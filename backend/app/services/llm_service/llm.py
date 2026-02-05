from langchain_ollama import ChatOllama
from langchain_google_genai import GoogleGenerativeAI
from langchain_core.language_models.llms import LLM
from typing import Optional, List, Any
import os
from dotenv import load_dotenv
import requests

load_dotenv()


class MyOpenLM(LLM):
    api_url: str = "https://openlmfallback-0adc8b183b77.herokuapp.com/api/chat"

    def _llm_type(self) -> str:
        return "my_lm"

    def _call(
        self, prompt: str, stop: Optional[List[str]] = None, **kwargs: Any
    ) -> str:
        response = requests.post(
            self.api_url,
            json={"message": prompt},
            headers={"Content-Type": "application/json"},
            timeout=500,
        )
        response.raise_for_status()
        return response.json()["data"]["response"]


def get_ollama_model():
    return ChatOllama(model=os.getenv("OLLAMA_MODEL"), temperature=0)


from langchain_google_genai import ChatGoogleGenerativeAI


def get_google_model():
    return ChatGoogleGenerativeAI(
        model=os.getenv("GOOGLE_MODEL"),
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.0,
    )


def get_MyOpenLM_model():
    return MyOpenLM()


def get_llm():
    provider = os.getenv("LLM_PROVIDER", "OLLAMA").upper()
    if provider == "GOOGLE":
        return get_google_model()
    elif provider == "MYOPENLM":
        return get_MyOpenLM_model()
    return get_ollama_model()
