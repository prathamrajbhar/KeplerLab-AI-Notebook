from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from app.db.postgres import get_db
from app.services.material_service import get_material_for_user
from app.services.quiz.generator import generate_quiz
from app.services.auth import get_current_user
from app.models.user import User
from app.services.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


class QuizRequest(BaseModel):
    material_id: str
    topic: Optional[str] = None


@router.post("/quiz")
async def create_quiz(
    request: QuizRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    logger.info("Quiz generation started")
    
    material = await get_material_for_user(request.material_id, current_user.id, db)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    if not material.original_text:
        raise HTTPException(status_code=400, detail="Material has no text content")
    
    if request.topic and request.topic.strip():
        text = f"Focus on the topic: {request.topic}\n\nContent:\n{material.original_text}"
        logger.info(f"Generating quiz for material: {material.filename}, topic: {request.topic}")
    else:
        text = material.original_text
        logger.info(f"Generating quiz for entire material: {material.filename}")
    
    try:
        quiz = generate_quiz(text)
        logger.info(f"Generated {len(quiz.get('questions', []))} questions")
        return JSONResponse(content=quiz)
    except Exception as e:
        logger.error(f"Quiz generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz")

