from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

from app.db.postgres import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.notebook_service import (
    create_notebook,
    get_user_notebooks,
    get_notebook_by_id,
    update_notebook,
    delete_notebook
)
from app.services.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/notebooks")


class NotebookCreate(BaseModel):
    name: str
    description: Optional[str] = None


class NotebookUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class NotebookResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


@router.post("", response_model=NotebookResponse, status_code=status.HTTP_201_CREATED)
async def create_notebook_endpoint(
    request: NotebookCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notebook = await create_notebook(current_user.id, request.name, request.description, db)
    return NotebookResponse(
        id=str(notebook.id),
        name=notebook.name,
        description=notebook.description,
        created_at=notebook.created_at.isoformat(),
        updated_at=notebook.updated_at.isoformat()
    )


@router.get("", response_model=List[NotebookResponse])
async def list_notebooks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notebooks = await get_user_notebooks(current_user.id, db)
    return [
        NotebookResponse(
            id=str(n.id),
            name=n.name,
            description=n.description,
            created_at=n.created_at.isoformat(),
            updated_at=n.updated_at.isoformat()
        )
        for n in notebooks
    ]


@router.get("/{notebook_id}", response_model=NotebookResponse)
async def get_notebook(
    notebook_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notebook = await get_notebook_by_id(notebook_id, current_user.id, db)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return NotebookResponse(
        id=str(notebook.id),
        name=notebook.name,
        description=notebook.description,
        created_at=notebook.created_at.isoformat(),
        updated_at=notebook.updated_at.isoformat()
    )


@router.put("/{notebook_id}", response_model=NotebookResponse)
async def update_notebook_endpoint(
    notebook_id: UUID,
    request: NotebookUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notebook = await update_notebook(notebook_id, current_user.id, request.name, request.description, db)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return NotebookResponse(
        id=str(notebook.id),
        name=notebook.name,
        description=notebook.description,
        created_at=notebook.created_at.isoformat(),
        updated_at=notebook.updated_at.isoformat()
    )


@router.delete("/{notebook_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notebook_endpoint(
    notebook_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    deleted = await delete_notebook(notebook_id, current_user.id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return None


# ===== Generated Content Endpoints =====

from sqlalchemy import select
from app.models.generated_content import GeneratedContent


class SaveContentRequest(BaseModel):
    content_type: str  # flashcards, quiz, slides, audio, video
    title: Optional[str] = None
    data: dict
    material_id: Optional[str] = None


@router.post("/{notebook_id}/content")
async def save_generated_content(
    notebook_id: UUID,
    request: SaveContentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save generated content (flashcards, quiz, etc.) to a notebook."""
    # Verify notebook ownership
    notebook = await get_notebook_by_id(notebook_id, current_user.id, db)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    material_uuid = UUID(request.material_id) if request.material_id else None
    
    content = GeneratedContent(
        notebook_id=notebook_id,
        user_id=current_user.id,
        material_id=material_uuid,
        content_type=request.content_type,
        title=request.title,
        data=request.data
    )
    db.add(content)
    await db.commit()
    await db.refresh(content)
    
    logger.info(f"Saved {request.content_type} content for notebook {notebook_id}")
    
    return {
        "id": str(content.id),
        "content_type": content.content_type,
        "title": content.title,
        "created_at": content.created_at.isoformat()
    }


@router.get("/{notebook_id}/content")
async def get_notebook_content(
    notebook_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all generated content for a notebook."""
    # Verify notebook ownership
    notebook = await get_notebook_by_id(notebook_id, current_user.id, db)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    result = await db.execute(
        select(GeneratedContent)
        .where(GeneratedContent.notebook_id == notebook_id)
        .where(GeneratedContent.user_id == current_user.id)
        .order_by(GeneratedContent.created_at.desc())
    )
    contents = result.scalars().all()
    
    return [
        {
            "id": str(c.id),
            "content_type": c.content_type,
            "title": c.title,
            "data": c.data,
            "material_id": str(c.material_id) if c.material_id else None,
            "created_at": c.created_at.isoformat()
        }
        for c in contents
    ]


@router.delete("/{notebook_id}/content/{content_id}")
async def delete_generated_content(
    notebook_id: UUID,
    content_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a specific generated content item."""
    result = await db.execute(
        select(GeneratedContent)
        .where(GeneratedContent.id == content_id)
        .where(GeneratedContent.notebook_id == notebook_id)
        .where(GeneratedContent.user_id == current_user.id)
    )
    content = result.scalar_one_or_none()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    await db.delete(content)
    await db.commit()
    
    return {"deleted": True}

