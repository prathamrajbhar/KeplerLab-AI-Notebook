from langchain_huggingface import HuggingFaceEmbeddings
from app.db.chroma import get_collection, get_user_collection
import os

embeddings = HuggingFaceEmbeddings(model_name=os.getenv("EMBEDDING_MODEL"))


def embed_and_store(chunks, material_id: str = None, user_id: str = None):
    collection = get_user_collection(user_id) if user_id else get_collection()
    
    for chunk in chunks:
        metadata = {"source": "chapter"}
        if material_id:
            metadata["material_id"] = material_id
        if user_id:
            metadata["user_id"] = user_id
        collection.add(
            ids=[chunk["id"]],
            documents=[chunk["text"]],
            metadatas=[metadata],
        )

