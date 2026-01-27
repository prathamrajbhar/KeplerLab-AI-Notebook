import os
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips
from app.services.logger import get_logger

logger = get_logger(__name__)


def compose_explainer_video(image_paths: list, audio_paths: list, output_path: str) -> str:
    num_clips = min(len(image_paths), len(audio_paths))
    
    if num_clips == 0:
        raise ValueError("No images or audio files to compose")
    
    logger.info(f"Composing video from {num_clips} slides...")
    
    video_clips = []
    
    for i in range(num_clips):
        image_path = image_paths[i]
        audio_path = audio_paths[i]
        
        logger.info(f"Processing slide {i}: {os.path.basename(image_path)}")
        
        audio = AudioFileClip(audio_path)
        duration = audio.duration
        
        image_clip = ImageClip(image_path, duration=duration)
        
        video_clip = image_clip.with_audio(audio)
        
        video_clips.append(video_clip)
        
        logger.info(f"Slide {i} duration: {duration:.1f} seconds")
    
    logger.info("Concatenating video clips...")
    final_video = concatenate_videoclips(video_clips, method="compose")
    
    total_duration = sum(clip.duration for clip in video_clips)
    logger.info(f"Total video duration: {total_duration:.1f} seconds")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    logger.info(f"Exporting video to: {output_path}")
    final_video.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        logger=None
    )
    
    for clip in video_clips:
        clip.close()
    final_video.close()
    
    logger.info("Video export complete")
    return output_path
