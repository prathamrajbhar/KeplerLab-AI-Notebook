from app.db.chroma import get_collection, get_user_collection
from typing import Optional


def retrieve_chunks(
    query, k=5, material_id: str = None, user_id: str = None, notebook_id: str = None
):
    collection = get_user_collection(user_id) if user_id else get_collection()

    filters = []
    if material_id:
        filters.append({"material_id": material_id})
    elif notebook_id:
        filters.append({"notebook_id": notebook_id})

    if user_id:
        filters.append({"user_id": user_id})

    # Chroma 'where' filter: wrap multiple filters in $and
    if not filters:
        where_filter = None
    elif len(filters) == 1:
        where_filter = filters[0]
    else:
        where_filter = {"$and": filters}

    results = collection.query(query_texts=[query], n_results=k, where=where_filter)
    return results.get("documents", [[]])[0]
