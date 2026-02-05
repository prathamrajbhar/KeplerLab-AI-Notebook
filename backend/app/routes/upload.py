from fastapi import APIRouter, UploadFile, Depends, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
import shutil
import os

from app.db.postgres import get_db
from app.services.material_service import (
    process_material,
    get_user_materials,
    delete_material,
    get_material_for_user,
)
from app.services.notebook_service import create_notebook
from app.services.notebook_name_generator import generate_notebook_name
from app.services.auth import get_current_user
from app.models.user import User
from app.services.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR")
if not UPLOAD_DIR:
    raise ValueError("UPLOAD_DIR environment variable is not set")


@router.post("/upload")
async def upload(
    file: UploadFile,
    notebook_id: Optional[str] = Form(None),
    auto_create_notebook: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logger.info(
        f"Stage: File upload started - {file.filename} by user {current_user.id}"
    )

    user_upload_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)

    path = os.path.join(user_upload_dir, file.filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    logger.info("Stage: File saved to disk")

    nb_id = UUID(notebook_id) if notebook_id else None
    created_notebook = None

    # Auto-create notebook with AI-generated name if requested
    if auto_create_notebook == "true" and not nb_id:
        logger.info("Stage: Auto-generating notebook name from content")

        # Read content for name generation
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content_preview = f.read(5000)
        except:
            content_preview = ""

        # Generate name using AI
        notebook_name = generate_notebook_name(content_preview, file.filename)

        # Create the notebook
        created_notebook = await create_notebook(
            current_user.id, notebook_name, None, db
        )
        nb_id = created_notebook.id
        logger.info(f"Stage: Created notebook '{notebook_name}' with id {nb_id}")

    material = await process_material(path, file.filename, current_user.id, db, nb_id)
    logger.info(f"Stage: Material processing completed - {material.id}")

    response = {
        "material_id": str(material.id),
        "filename": material.filename,
        "chunk_count": material.chunk_count,
        "status": material.status.value,
    }

    # Include notebook info if auto-created
    if created_notebook:
        response["notebook"] = {
            "id": str(created_notebook.id),
            "name": created_notebook.name,
        }

    return response


@router.get("/materials")
async def list_materials(
    notebook_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    nb_id = UUID(notebook_id) if notebook_id else None
    materials = await get_user_materials(current_user.id, db, nb_id)
    return [
        {
            "id": str(m.id),
            "filename": m.filename,
            "status": m.status.value,
            "chunk_count": m.chunk_count,
            "created_at": m.created_at.isoformat(),
        }
        for m in materials
    ]


@router.delete("/materials/{material_id}")
async def remove_material(
    material_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await delete_material(material_id, current_user.id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"deleted": True}


@router.get("/materials/{material_id}/text")
async def get_material_text(
    material_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    material = await get_material_for_user(material_id, current_user.id, db)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"text": material.original_text}
