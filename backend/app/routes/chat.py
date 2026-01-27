from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

from app.db.postgres import get_db
from app.services.material_service import get_material_for_user
from app.services.chat.service import chat, clear_session, get_session_history
from app.services.auth import get_current_user
from app.models.user import User
from app.models.chat_history import ChatMessage
from app.services.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    material_id: str
    message: str
    notebook_id: str


class ClearChatRequest(BaseModel):
    notebook_id: str


@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    logger.info("Chat request received")
    
    material = await get_material_for_user(request.material_id, current_user.id, db)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    if not material.original_text:
        raise HTTPException(status_code=400, detail="Material has no text content")
    
    # Use notebook_id as session key for consistency
    session_id = f"{current_user.id}_{request.notebook_id}"
    
    try:
        context = material.original_text[:6000]
        answer = chat(session_id, context, request.message)
        
        # Save user message to DB
        user_msg = ChatMessage(
            notebook_id=UUID(request.notebook_id),
            user_id=current_user.id,
            role="user",
            content=request.message
        )
        db.add(user_msg)
        
        # Save assistant message to DB
        assistant_msg = ChatMessage(
            notebook_id=UUID(request.notebook_id),
            user_id=current_user.id,
            role="assistant",
            content=answer
        )
        db.add(assistant_msg)
        await db.commit()
        
        logger.info(f"Chat response generated and saved for notebook: {request.notebook_id}")
        
        return JSONResponse(content={
            "session_id": session_id,
            "answer": answer
        })
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response")


@router.get("/chat/history/{notebook_id}")
async def get_notebook_chat_history(
    notebook_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all chat messages for a notebook"""
    try:
        nb_id = UUID(notebook_id)
        
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.notebook_id == nb_id)
            .where(ChatMessage.user_id == current_user.id)
            .order_by(ChatMessage.created_at.asc())
        )
        messages = result.scalars().all()
        
        return [
            {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    except Exception as e:
        logger.error(f"Failed to get chat history: {e}")
        raise HTTPException(status_code=500, detail="Failed to load chat history")


@router.delete("/chat/history/{notebook_id}")
async def clear_notebook_chat(
    notebook_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear all chat messages for a notebook"""
    try:
        nb_id = UUID(notebook_id)
        
        # Clear in-memory session
        session_id = f"{current_user.id}_{notebook_id}"
        clear_session(session_id)
        
        # Delete from DB
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.notebook_id == nb_id)
            .where(ChatMessage.user_id == current_user.id)
        )
        messages = result.scalars().all()
        
        for msg in messages:
            await db.delete(msg)
        await db.commit()
        
        logger.info(f"Cleared chat history for notebook: {notebook_id}")
        return {"cleared": True, "count": len(messages)}
    except Exception as e:
        logger.error(f"Failed to clear chat history: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear chat history")


