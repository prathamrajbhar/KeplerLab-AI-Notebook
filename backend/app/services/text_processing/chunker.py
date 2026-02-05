import uuid
from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_text(text):
    splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=200)

    chunks = splitter.split_text(text)

    return [{"id": str(uuid.uuid4()), "text": chunk} for chunk in chunks]
