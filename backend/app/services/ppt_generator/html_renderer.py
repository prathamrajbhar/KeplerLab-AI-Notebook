import re
import base64
import os
from typing import Dict, List


class HTMLSlideRenderer:
    def __init__(self, image_generator=None):
        self.image_generator = image_generator
        self.slide_count = 0
        self._css_cache = None
    
    def render_presentation(self, chapter_data: Dict) -> str:
        chapter_title = chapter_data.get('chapter_title', 'Presentation')
        slides = chapter_data.get('slides', [])
        
        slides_html = [self._render_title_slide(chapter_title)]
        self.slide_count = 1
        
        for slide_data in slides:
            self.slide_count += 1
            slides_html.append(self._render_content_slide(slide_data))
        
        return self._wrap_in_document(chapter_title, '\n'.join(slides_html))
    
    def _wrap_in_document(self, title: str, slides_html: str) -> str:
        css = self._get_styles()
        return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{self._escape_html(title)}</title>
    <style>{css}</style>
</head>
<body>{slides_html}</body>
</html>'''
    
    def _get_styles(self) -> str:
        if self._css_cache:
            return self._css_cache
        css_path = os.path.join(os.path.dirname(__file__), 'slide_styles.css')
        with open(css_path, 'r', encoding='utf-8') as f:
            self._css_cache = f.read()
        return self._css_cache
    
    def _render_title_slide(self, chapter_title: str) -> str:
        return f'''<div class="slide slide-title">
    <div class="accent-bar"></div>
    <div class="decorative-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
    </div>
    <div class="title-content">
        <h1>{self._escape_html(chapter_title)}</h1>
        <span class="subtitle">Presentation Overview</span>
    </div>
</div>'''
    
    def _render_content_slide(self, slide_data: Dict) -> str:
        section_number = slide_data.get('section_number', '')
        title = slide_data.get('title', '')
        blocks = slide_data.get('blocks', [])
        layout_intent = slide_data.get('layout_intent', 'dense_text')
        
        formatted_title = f"{section_number}   {title}" if section_number else title
        body_html = self._render_blocks(blocks, layout_intent)
        
        return f'''<div class="slide slide-content">
    <div class="slide-header">
        <h2>{self._escape_html(formatted_title)}</h2>
        <div class="title-underline"></div>
        <div class="corner-dot"></div>
    </div>
    <div class="slide-body">{body_html}</div>
    <div class="slide-footer"><span class="page-number">{self.slide_count:02d}</span></div>
</div>'''
    
    def _render_blocks(self, blocks: List[Dict], layout_intent: str) -> str:
        if layout_intent in ['text_with_image', 'text_with_diagram']:
            return self._render_text_with_image_layout(blocks)
        elif layout_intent == 'split_columns':
            return self._render_split_layout(blocks)
        return '\n'.join(self._render_block(b) for b in blocks)
    
    def _render_text_with_image_layout(self, blocks: List[Dict]) -> str:
        text_blocks, image_block = [], None
        for block in blocks:
            if block.get('block_type') in ['image_block', 'diagram_block']:
                image_block = block
            else:
                text_blocks.append(self._render_block(block))
        
        return f'''<div class="layout-text-image">
    <div class="text-column">{chr(10).join(text_blocks)}</div>
    <div class="image-column">{self._render_block(image_block) if image_block else ''}</div>
</div>'''
    
    def _render_split_layout(self, blocks: List[Dict]) -> str:
        mid = len(blocks) // 2
        left = '\n'.join(self._render_block(b) for b in blocks[:mid])
        right = '\n'.join(self._render_block(b) for b in blocks[mid:])
        return f'<div class="layout-split"><div>{left}</div><div>{right}</div></div>'
    
    def _render_block(self, block: Dict) -> str:
        if not block:
            return ''
        renderers = {
            'paragraph_block': self._render_paragraph_block,
            'bullet_block': self._render_bullet_block,
            'numbered_block': self._render_numbered_block,
            'definition_block': self._render_definition_block,
            'table_block': self._render_table_block,
            'image_block': self._render_image_block,
            'diagram_block': self._render_diagram_block,
        }
        renderer = renderers.get(block.get('block_type', ''))
        return renderer(block) if renderer else ''
    
    def _render_paragraph_block(self, block: Dict) -> str:
        content = block.get('content', '')
        return f'<div class="block-paragraph">{self._format_markdown(content)}</div>' if content else ''
    
    def _render_bullet_block(self, block: Dict) -> str:
        heading = block.get('heading', '')
        bullets = block.get('bullets', [])
        if not bullets:
            return ''
        heading_html = f'<div class="block-heading">{self._escape_html(heading)}</div>' if heading else ''
        items = '\n'.join(f'<li>{self._format_markdown(b)}</li>' for b in bullets)
        return f'<div class="block-bullet">{heading_html}<ul>{items}</ul></div>'
    
    def _render_numbered_block(self, block: Dict) -> str:
        heading = block.get('heading', '')
        points = block.get('points', [])
        if not points:
            return ''
        heading_html = f'<div class="block-heading">{self._escape_html(heading)}</div>' if heading else ''
        items = '\n'.join(f'<li>{self._format_markdown(p)}</li>' for p in points)
        return f'<div class="block-numbered">{heading_html}<ol>{items}</ol></div>'
    
    def _render_definition_block(self, block: Dict) -> str:
        term, definition = block.get('term', ''), block.get('definition', '')
        if not term and not definition:
            return ''
        return f'''<div class="block-definition">
    <div class="term">{self._escape_html(term)}</div>
    <div class="definition">{self._format_markdown(definition)}</div>
</div>'''
    
    def _render_table_block(self, block: Dict) -> str:
        heading = block.get('heading', '')
        columns, rows = block.get('columns', []), block.get('rows', [])
        if not columns or not rows:
            return ''
        heading_html = f'<div class="block-heading">{self._escape_html(heading)}</div>' if heading else ''
        header = ''.join(f'<th>{self._escape_html(c)}</th>' for c in columns)
        body = ''.join(f'<tr>{"".join(f"<td>{self._escape_html(str(cell))}</td>" for cell in row)}</tr>' for row in rows)
        return f'<div class="block-table">{heading_html}<table><thead><tr>{header}</tr></thead><tbody>{body}</tbody></table></div>'
    
    def _render_image_block(self, block: Dict) -> str:
        prompt = block.get('image_prompt', '')
        image_data = None
        if self.image_generator and prompt:
            try:
                image_data = self.image_generator(prompt)
            except Exception:
                pass
        if image_data:
            b64 = base64.b64encode(image_data).decode('utf-8')
            return f'<div class="block-image"><img src="data:image/png;base64,{b64}" alt="{self._escape_html(prompt[:100])}"></div>'
        return f'<div class="block-image"><div class="image-placeholder">[Image: {self._escape_html(prompt[:80])}...]</div></div>'
    
    def _render_diagram_block(self, block: Dict) -> str:
        prompt = block.get('diagram_prompt', '')
        data = None
        if self.image_generator and prompt:
            try:
                data = self.image_generator(prompt)
            except Exception:
                pass
        if data:
            b64 = base64.b64encode(data).decode('utf-8')
            return f'<div class="block-image"><img src="data:image/png;base64,{b64}" alt="{self._escape_html(prompt[:100])}"></div>'
        return f'<div class="block-image"><div class="image-placeholder">[Diagram: {self._escape_html(prompt[:80])}...]</div></div>'
    
    def _format_markdown(self, text) -> str:
        if not text:
            return ''
        if not isinstance(text, str):
            text = str(text)
        text = self._escape_html(text)
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
        text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
        return text
    
    def _escape_html(self, text) -> str:
        if not text:
            return ''
        if not isinstance(text, str):
            text = str(text)
        return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&#39;')
