from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import os
import uuid

from app.db.postgres import get_db
from app.services.material_service import get_material_for_user
from app.services.podcast.generator import generate_podcast_audio
from app.services.auth import get_current_user
from app.models.user import User
from app.services.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

PODCAST_OUTPUT_DIR = os.getenv("PODCAST_OUTPUT_DIR", "output/podcasts")


class PodcastRequest(BaseModel):
    material_id: str


@router.post("/podcast")
async def generate_podcast(
    request: PodcastRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate podcast and return metadata for preview."""
    logger.info(f"Podcast generation started - {request.material_id}")
    
    material = await get_material_for_user(request.material_id, current_user.id, db)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    if not material.original_text:
        raise HTTPException(status_code=400, detail="Material has no text content")
    
    logger.info(f"Generating podcast for: {material.filename}")
    audio_buffer, title = generate_podcast_audio(material.original_text)
    logger.info("Podcast generation completed")
    
    user_podcast_dir = os.path.join(PODCAST_OUTPUT_DIR, str(current_user.id))
    os.makedirs(user_podcast_dir, exist_ok=True)
    
    safe_title = "".join(c if c.isalnum() or c in (' ', '-', '_') else '' for c in title)
    filename = f"{safe_title.replace(' ', '_')[:50] or 'podcast'}_{uuid.uuid4().hex[:6]}.wav"
    filepath = os.path.join(user_podcast_dir, filename)
    
    with open(filepath, "wb") as f:
        f.write(audio_buffer.read())
    logger.info(f"Podcast saved to: {filepath}")
    
    return {
        "title": title,
        "audio_filename": filename,
        "material_id": request.material_id,
        "user_id": str(current_user.id)
    }


@router.get("/podcast/audio/{user_id}/{filename}")
async def get_podcast_audio(user_id: str, filename: str):
    """Serve the generated podcast audio file."""
    # Note: No auth required as files are in user-specific UUID directories
    audio_path = os.path.join(PODCAST_OUTPUT_DIR, user_id, filename)
    
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        path=audio_path,
        media_type="audio/wav",
        headers={"Cache-Control": "no-cache"}
    )


@router.post("/podcast/download")
async def download_podcast(
    request: PodcastRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate and download podcast directly."""
    material = await get_material_for_user(request.material_id, current_user.id, db)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    if not material.original_text:
        raise HTTPException(status_code=400, detail="Material has no text content")
    
    audio_buffer, title = generate_podcast_audio(material.original_text)
    
    user_podcast_dir = os.path.join(PODCAST_OUTPUT_DIR, str(current_user.id))
    os.makedirs(user_podcast_dir, exist_ok=True)
    
    safe_title = "".join(c if c.isalnum() or c in (' ', '-', '_') else '' for c in title)
    filename = f"{safe_title.replace(' ', '_')[:50] or 'podcast'}.wav"
    filepath = os.path.join(user_podcast_dir, filename)
    
    with open(filepath, "wb") as f:
        f.write(audio_buffer.read())
    
    return FileResponse(
        path=filepath,
        media_type="audio/wav",
        filename=filename
    )

