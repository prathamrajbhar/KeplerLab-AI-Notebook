import json
from app.services.llm_service.llm import get_llm
from app.prompts import get_slide_generation_prompt


def generate_chapter_ppt(chapter_text: str) -> dict:
    llm = get_llm()
    prompt = get_slide_generation_prompt(chapter_text)
    response = llm.invoke(prompt)
    
    text = getattr(response, 'content', str(response)).strip()
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end+1]
    return json.loads(text)
