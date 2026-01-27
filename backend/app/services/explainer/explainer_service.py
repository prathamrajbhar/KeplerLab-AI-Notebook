# Main explainer service
# Orchestrates the full explainer video generation pipeline

import os
import uuid
import tempfile
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.services.material_service import get_material_for_user
from app.services.slide_generation.generator import generate_chapter_ppt
from app.services.ppt_generator.generator import PPTGenerator
from app.services.explainer.script_generator import generate_explainer_script
from app.services.explainer.audio_generator import generate_slide_audio
from app.services.explainer.slide_renderer import render_slides_to_images
from app.services.explainer.video_composer import compose_explainer_video
from app.services.logger import get_logger

logger = get_logger(__name__)

# Output directories
HTML_OUTPUT_DIR = os.getenv("HTML_OUTPUT_DIR", "output/html")
VIDEO_OUTPUT_DIR = os.getenv("VIDEO_OUTPUT_DIR", "output/videos")


async def generate_explainer_video(material_id: str, user_id: UUID, db: AsyncSession) -> str:
    """
    Generate a complete explainer video for a material.
    
    Pipeline:
    1. Get material and generate slides JSON
    2. Generate HTML from slides
    3. Generate teacher-style narration script via LLM
    4. Generate audio files for each slide
    5. Render slide images from HTML
    6. Compose final MP4 video
    
    Args:
        material_id: UUID of the uploaded material
        user_id: UUID of the current user
        db: Database session
        
    Returns:
        Path to the generated MP4 video file
    """
    logger.info(f"Starting explainer video generation for material: {material_id}")
    
    # Step 1: Get material from database with user ownership check
    material = await get_material_for_user(material_id, user_id, db)
    if not material:
        raise ValueError(f"Material not found: {material_id}")
    
    if not material.original_text:
        raise ValueError("Material has no text content")
    
    logger.info(f"Processing material: {material.filename}")
    
    # Step 2: Generate slides JSON from material text
    logger.info("Generating slides data...")
    slides_data = generate_chapter_ppt(material.original_text)
    
    # Step 3: Generate HTML from slides
    logger.info("Generating HTML slides...")
    generator = PPTGenerator()
    html_path = generator.save_html(slides_data, HTML_OUTPUT_DIR)
    logger.info(f"HTML saved to: {html_path}")
    
    # Create temp directory for intermediate files
    temp_dir = tempfile.mkdtemp(prefix="explainer_")
    
    try:
        # Step 4: Generate narration script via LLM
        logger.info("Generating explainer script...")
        narrations = generate_explainer_script(slides_data)
        
        # Step 5: Generate audio files for each slide
        logger.info("Generating audio narrations...")
        audio_dir = os.path.join(temp_dir, "audio")
        audio_paths = generate_slide_audio(narrations, audio_dir)
        
        # Step 6: Render slide images from HTML
        logger.info("Rendering slide images...")
        image_dir = os.path.join(temp_dir, "images")
        image_paths = render_slides_to_images(html_path, image_dir)
        
        # Step 7: Compose final video (user-scoped output)
        logger.info("Composing final video...")
        user_video_dir = os.path.join(VIDEO_OUTPUT_DIR, str(user_id))
        os.makedirs(user_video_dir, exist_ok=True)
        video_filename = f"explainer_{material_id[:8]}_{uuid.uuid4().hex[:6]}.mp4"
        video_path = os.path.join(user_video_dir, video_filename)
        
        compose_explainer_video(image_paths, audio_paths, video_path)
        
        logger.info(f"Explainer video complete: {video_path}")
        return video_path
        
    except Exception as e:
        logger.error(f"Error generating explainer video: {e}")
        raise

