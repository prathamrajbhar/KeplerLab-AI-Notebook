from typing import Dict, List
from app.services.llm_service.llm import get_llm
from app.prompts import get_chat_prompt


_sessions: Dict[str, Dict] = {}


def get_or_create_session(session_id: str, context: str) -> Dict:
    if session_id not in _sessions:
        _sessions[session_id] = {
            "context": context,
            "history": []
        }
    return _sessions[session_id]


def format_history(history: List[Dict]) -> str:
    if not history:
        return "None"
    
    formatted = []
    for msg in history[-10:]:
        formatted.append(f"User: {msg['user']}")
        formatted.append(f"Assistant: {msg['assistant']}")
    return "\n".join(formatted)


def chat(session_id: str, context: str, user_message: str) -> str:
    session = get_or_create_session(session_id, context)
    
    history_str = format_history(session["history"])
    
    prompt = get_chat_prompt(session["context"], history_str, user_message)
    
    llm = get_llm()
    response = llm.invoke(prompt)
    answer = getattr(response, 'content', str(response)).strip()
    
    session["history"].append({
        "user": user_message,
        "assistant": answer
    })
    
    return answer


def clear_session(session_id: str) -> bool:
    if session_id in _sessions:
        del _sessions[session_id]
        return True
    return False


def get_session_history(session_id: str) -> List[Dict]:
    if session_id in _sessions:
        return _sessions[session_id]["history"]
    return []
