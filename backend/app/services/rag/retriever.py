from app.db.chroma import get_collection, get_user_collection
from typing import Optional


def retrieve_chunks(query, k=5, material_id: str = None, user_id: str = None):
    collection = get_user_collection(user_id) if user_id else get_collection()
    
    where_filter = None
    if material_id:
        where_filter = {"material_id": material_id}
    
    results = collection.query(query_texts=[query], n_results=k, where=where_filter)
    return results.get('documents', [[]])[0]
