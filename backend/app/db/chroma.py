import os
from dotenv import load_dotenv

load_dotenv()

os.environ["ANONYMIZED_TELEMETRY"] = "False"

import chromadb
from chromadb.config import Settings

CHROMA_DIR = os.getenv("CHROMA_DIR")
MODEL_CACHE_DIR = os.path.join(os.path.dirname(CHROMA_DIR), "models")
os.environ["SENTENCE_TRANSFORMERS_HOME"] = MODEL_CACHE_DIR

_client = None


def get_client():
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=CHROMA_DIR,
            settings=Settings(anonymized_telemetry=False)
        )
    return _client


def get_collection():
    """Get the default global collection (for backward compatibility)."""
    return get_client().get_or_create_collection(name="chapters")


def get_user_collection(user_id: str):
    """Get or create a user-specific collection for data isolation."""
    collection_name = f"user_{user_id}_chapters"
    return get_client().get_or_create_collection(name=collection_name)


def delete_user_collection(user_id: str) -> bool:
    """Delete a user's collection (for account deletion)."""
    try:
        collection_name = f"user_{user_id}_chapters"
        get_client().delete_collection(name=collection_name)
        return True
    except Exception:
        return False
