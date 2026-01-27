from pydantic import BaseModel
from typing import List, Optional


class Block(BaseModel):
    block_type: str
    content: Optional[str] = None
    heading: Optional[str] = None
    bullets: Optional[List[str]] = None
    points: Optional[List[str]] = None
    headers: Optional[List[str]] = None
    rows: Optional[List[List[str]]] = None
    diagram_prompt: Optional[str] = None


class Slide(BaseModel):
    slide_id: int
    section_number: Optional[str] = None
    title: str
    layout_intent: str
    blocks: List[Block]


class ChapterPPT(BaseModel):
    chapter_title: str
    slides: List[Slide]
