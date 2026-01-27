from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from app.db.postgres import get_db
from app.services.material_service import get_material_for_user
from app.services.flashcard.generator import generate_flashcards
from app.services.auth import get_current_user
from app.models.user import User
from app.services.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


class FlashcardRequest(BaseModel):
    material_id: str
    topic: Optional[str] = None


@router.post("/flashcard")
async def create_flashcards(
    request: FlashcardRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    logger.info(f"Flashcard generation started")
    
    material = await get_material_for_user(request.material_id, current_user.id, db)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    if not material.original_text:
        raise HTTPException(status_code=400, detail="Material has no text content")
    
    if request.topic and request.topic.strip():
        text = f"Focus on the topic: {request.topic}\n\nContent:\n{material.original_text}"
        logger.info(f"Generating flashcards for material: {material.filename}, topic: {request.topic}")
    else:
        text = material.original_text
        logger.info(f"Generating flashcards for entire material: {material.filename}")
    
    try:
        flashcards = generate_flashcards(text)
        logger.info(f"Generated {len(flashcards.get('flashcards', []))} flashcards")
        return JSONResponse(content=flashcards)
    except Exception as e:
        logger.error(f"Flashcard generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate flashcards")

