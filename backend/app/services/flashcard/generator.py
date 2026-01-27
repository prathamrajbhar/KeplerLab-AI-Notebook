import json
from io import BytesIO
from app.services.llm_service.llm import get_llm
from app.prompts import get_flashcard_prompt


def generate_flashcards(material_text: str) -> dict:
    llm = get_llm()
    prompt = get_flashcard_prompt(material_text[:8000])
    response = llm.invoke(prompt)
    
    text = getattr(response, 'content', str(response)).strip()
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end+1]
    return json.loads(text)
