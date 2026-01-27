"""
AI-powered notebook name generator.
Generates a concise, descriptive name based on content.
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from app.services.logger import get_logger

logger = get_logger(__name__)


def generate_notebook_name(content: str, filename: str = None) -> str:
    """
    Generate a notebook name based on file content using AI.
    
    Args:
        content: Text content from the uploaded file
        filename: Original filename (optional, used as fallback)
    
    Returns:
        A concise, descriptive notebook name (2-5 words)
    """
    # Limit content to first 2000 chars for efficiency
    content_preview = content[:2000] if len(content) > 2000 else content
    
    prompt = f"""Based on this document content, generate a short, descriptive notebook name (2-5 words max).
The name should capture the main topic or subject matter.
Do NOT include words like "Notebook", "Notes", "Document", or file extensions.
Just return the name, nothing else.

Content preview:
{content_preview}

Notebook name:"""

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            temperature=0.3
        )
        
        response = llm.invoke(prompt)
        name = response.content.strip().strip('"\'')
        
        # Clean up and validate
        name = name[:50]  # Max 50 chars
        if not name or len(name) < 3:
            # Fallback to filename-based name
            if filename:
                name = filename.rsplit('.', 1)[0][:40]
            else:
                name = "New Notebook"
        
        logger.info(f"Generated notebook name: {name}")
        return name
        
    except Exception as e:
        logger.error(f"Failed to generate notebook name: {e}")
        # Fallback to filename or default
        if filename:
            return filename.rsplit('.', 1)[0][:40]
        return "New Notebook"
