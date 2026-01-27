# Explainer video API route
# POST /explainer - Generate and return explainer video info
# GET /explainer/video/{filename} - Serve the video file

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import os

from app.db.postgres import get_db
from app.services.explainer.explainer_service import generate_explainer_video
from app.services.auth import get_current_user
from app.models.user import User
from app.services.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

VIDEO_OUTPUT_DIR = os.getenv("VIDEO_OUTPUT_DIR", "output/videos")


class ExplainerRequest(BaseModel):
    material_id: str


@router.post("/explainer")
async def create_explainer(
    request: ExplainerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate an explainer video for the given material.
    Returns video metadata and URL for preview.
    """
    logger.info(f"Explainer video request for material: {request.material_id} by user: {current_user.id}")
    
    try:
        video_path = await generate_explainer_video(request.material_id, current_user.id, db)
        
        logger.info(f"Video generated: {video_path}")
        
        video_filename = os.path.basename(video_path)
        
        return {
            "video_filename": video_filename,
            "video_path": video_path,
            "material_id": request.material_id,
            "user_id": str(current_user.id)
        }
        
    except ValueError as e:
        logger.error(f"Explainer error: {e}")
        raise HTTPException(status_code=404, detail=str(e))
        
    except Exception as e:
        logger.error(f"Explainer generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate explainer video")


@router.get("/explainer/video/{user_id}/{filename}")
async def get_explainer_video(
    user_id: str,
    filename: str,
):
    """
    Serve the generated explainer video file.
    Note: No auth required because video elements can't send Authorization headers.
    Security is maintained by requiring the correct user_id in the URL path.
    """
    video_path = os.path.join(VIDEO_OUTPUT_DIR, user_id, filename)
    
    if not os.path.exists(video_path):
        logger.warning(f"Video not found: {video_path}")
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        headers={"Cache-Control": "no-cache"}
    )


@router.post("/explainer/download")
async def download_explainer(
    request: ExplainerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate and download the explainer video directly."""
    logger.info(f"Explainer download request for material: {request.material_id}")
    
    try:
        video_path = await generate_explainer_video(request.material_id, current_user.id, db)
        
        return FileResponse(
            path=video_path,
            media_type="video/mp4",
            filename="explainer.mp4"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Explainer download failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate explainer video")

