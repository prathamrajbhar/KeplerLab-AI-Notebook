import json
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app.services.ppt_generator.generator import generate_ppt, PPTGenerator
from app.services.ppt_generator.html_renderer import HTMLSlideRenderer
from app.services.slide_generation.image_generator import fetch_image


def test_html_generation():
    sample_path = os.path.join(os.path.dirname(__file__), '..', 'sample_output.json')
    with open(sample_path, 'r', encoding='utf-8') as f:
        chapter_data = json.load(f)
    
    # Use fetch_image for images in HTML
    renderer = HTMLSlideRenderer(image_generator=fetch_image)
    html_content = renderer.render_presentation(chapter_data)
    
    output_dir = os.path.join(os.path.dirname(__file__), 'output')
    os.makedirs(output_dir, exist_ok=True)
    
    html_path = os.path.join(output_dir, 'generated_presentation.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"HTML presentation generated at: {html_path}")
    return chapter_data, html_content


def test_full_pipeline():
    sample_path = os.path.join(os.path.dirname(__file__), '..', 'sample_output.json')
    with open(sample_path, 'r', encoding='utf-8') as f:
        chapter_data = json.load(f)
    
    # Use fetch_image for images in PPTX
    pptx_buffer = generate_ppt(chapter_data, image_generator=fetch_image)
    
    output_dir = os.path.join(os.path.dirname(__file__), 'output')
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, 'generated_presentation.pptx')
    with open(output_path, 'wb') as f:
        f.write(pptx_buffer.read())
    
    print(f"PPTX presentation generated at: {output_path}")


if __name__ == '__main__':
    print("Starting generation from complete sample_output.json...")
    test_html_generation()
    test_full_pipeline()
    print("Generation complete.")
