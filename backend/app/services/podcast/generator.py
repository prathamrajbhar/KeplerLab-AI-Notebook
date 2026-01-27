import json
from io import BytesIO
from app.services.llm_service.llm import get_llm
from app.services.text_to_speech.tts import generate_dialogue_audio
from app.prompts import get_podcast_prompt


def generate_podcast_script(material_text: str) -> dict:
    llm = get_llm()
    prompt = get_podcast_prompt(material_text[:8000])
    response = llm.invoke(prompt)
    
    text = getattr(response, 'content', str(response)).strip()
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end+1]
    return json.loads(text)


def generate_podcast_audio(material_text: str) -> tuple[BytesIO, str]:
    script = generate_podcast_script(material_text)
    
    dialogue = [(d["speaker"], d["text"]) for d in script.get("dialogue", [])]
    
    audio_buffer = generate_dialogue_audio(dialogue)
    
    title = script.get("title", "Podcast")
    return audio_buffer, title
