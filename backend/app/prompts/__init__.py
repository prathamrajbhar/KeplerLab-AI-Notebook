import os


def load_prompt(filename: str) -> str:
    filepath = os.path.join(os.path.dirname(__file__), filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def get_slide_generation_prompt(chapter_text: str) -> str:
    return load_prompt('slide_generation_prompt.txt').replace('{chapter_text}', chapter_text)


def get_podcast_prompt(material_text: str) -> str:
    return load_prompt('podcast_prompt.txt').replace('{material_text}', material_text)


def get_explainer_prompt(slides_json: str) -> str:
    # Load the explainer prompt and insert the slides JSON
    prompt = load_prompt('explainer_prompt.txt')
    return prompt.replace('{{SLIDES_JSON}}', slides_json)


def get_flashcard_prompt(content_text: str) -> str:
    prompt = load_prompt('flashcard_prompt.txt')
    return prompt.replace('{{CONTENT_TEXT}}', content_text)


def get_quiz_prompt(content_text: str) -> str:
    prompt = load_prompt('quiz_prompt.txt')
    return prompt.replace('{{CONTENT_TEXT}}', content_text)


def get_chat_prompt(context: str, chat_history: str, user_message: str) -> str:
    prompt = load_prompt('chat_prompt.txt')
    prompt = prompt.replace('{{CONTEXT}}', context)
    prompt = prompt.replace('{{CHAT_HISTORY}}', chat_history)
    prompt = prompt.replace('{{USER_MESSAGE}}', user_message)
    return prompt
