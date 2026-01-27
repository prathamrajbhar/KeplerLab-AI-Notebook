from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid

from app.db.postgres import get_db
from app.services.material_service import get_material_for_user
from app.services.rag.retriever import retrieve_chunks
from app.services.slide_generation.generator import generate_chapter_ppt
from app.services.ppt_generator.generator import PPTGenerator
from app.services.slide_generation.image_generator import fetch_image
from app.services.explainer.slide_renderer import render_slides_to_images
from app.services.auth import get_current_user
from app.models.user import User
from app.services.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

HTML_OUTPUT_DIR = os.getenv("HTML_OUTPUT_DIR", "output/html")
SLIDE_IMAGES_DIR = os.getenv("SLIDE_IMAGES_DIR", "output/slide_images")


class SlideRequest(BaseModel):
    material_id: Optional[str] = None
    topic: Optional[str] = None


@router.post("/slide")
async def generate_slide(
    request: SlideRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate slides and return image filenames for preview."""
    if not request.material_id and not request.topic:
        raise HTTPException(status_code=400, detail="Either material_id or topic is required")
    
    text = ""
    material = None
    
    if request.material_id:
        material = await get_material_for_user(request.material_id, current_user.id, db)
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")
        text = material.original_text or ""
        logger.info(f"Stage: Retrieved material - {material.filename}")
    elif request.topic:
        chunks = retrieve_chunks(request.topic, k=10, user_id=str(current_user.id))
        text = "\n\n".join(chunks)
        logger.info(f"Stage: Retrieved chunks for topic - {request.topic}")
    
    if not text:
        raise HTTPException(status_code=400, detail="No content available for slide generation")
    
    logger.info("Stage: PPT data generation started")
    ppt_data = generate_chapter_ppt(text)
    logger.info("Stage: PPT data generation completed")
    
    # Generate HTML for image rendering
    generator = PPTGenerator(image_generator=fetch_image)
    html_path = generator.save_html(ppt_data, HTML_OUTPUT_DIR)
    logger.info(f"Stage: HTML saved to: {html_path}")
    
    # Generate unique folder for this request
    session_id = request.material_id or str(uuid.uuid4())[:8]
    output_dir = os.path.join(SLIDE_IMAGES_DIR, session_id)
    
    # Render slides to images
    logger.info("Stage: Rendering slides to images")
    try:
        image_paths = render_slides_to_images(html_path, output_dir)
        logger.info(f"Stage: Rendered {len(image_paths)} slide images")
    except Exception as e:
        logger.error(f"Failed to render slides: {e}")
        # Return data without images on error
        return {
            "chapter_title": ppt_data.get("chapter_title", "Presentation"),
            "slide_count": len(ppt_data.get("slides", [])) + 1,
            "slides": [],
            "session_id": session_id,
            "error": str(e)
        }
    
    # Get just the filenames for URLs
    slide_filenames = [os.path.basename(p) for p in image_paths]
    
    return {
        "chapter_title": ppt_data.get("chapter_title", "Presentation"),
        "slide_count": len(image_paths),
        "slides": slide_filenames,
        "session_id": session_id
    }


@router.get("/slide/image/{session_id}/{filename}")
async def get_slide_image(session_id: str, filename: str):
    """Serve a slide image file."""
    image_path = os.path.join(SLIDE_IMAGES_DIR, session_id, filename)
    
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    
    return FileResponse(
        image_path, 
        media_type="image/png",
        headers={"Cache-Control": "no-cache"}
    )


@router.post("/slide/download")
async def download_slide(
    request: SlideRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate and download PPTX file."""
    if not request.material_id and not request.topic:
        raise HTTPException(status_code=400, detail="Either material_id or topic is required")
    
    text = ""
    material = None
    
    if request.material_id:
        material = await get_material_for_user(request.material_id, current_user.id, db)
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")
        text = material.original_text or ""
    elif request.topic:
        chunks = retrieve_chunks(request.topic, k=10, user_id=str(current_user.id))
        text = "\n\n".join(chunks)
    
    if not text:
        raise HTTPException(status_code=400, detail="No content available for slide generation")
    
    ppt_data = generate_chapter_ppt(text)
    generator = PPTGenerator(image_generator=fetch_image)
    
    html_path = generator.save_html(ppt_data, HTML_OUTPUT_DIR)
    logger.info(f"Stage: HTML saved to: {html_path}")
    
    pptx_buffer = generator.generate(ppt_data)
    
    title = ppt_data.get('chapter_title', 'presentation').replace(' ', '_')
    filename = f"{title}.pptx"
    
    return StreamingResponse(
        pptx_buffer,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
