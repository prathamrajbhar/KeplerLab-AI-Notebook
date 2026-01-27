import os

TTS_MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "models")
os.makedirs(TTS_MODEL_DIR, exist_ok=True)
os.environ["TTS_HOME"] = TTS_MODEL_DIR

import soundfile as sf
from TTS.api import TTS
import torch
from app.services.logger import get_logger

logger = get_logger(__name__)

_tts = None
_speaker = None


def _get_tts():
    global _tts, _speaker
    if _tts is None:
        logger.info("Loading TTS model...")
        _tts = TTS("tts_models/en/vctk/vits", gpu=torch.cuda.is_available())
        _speaker = _tts.speakers[7]
        logger.info("TTS model loaded")
    return _tts, _speaker


def generate_slide_audio(narrations: list, output_dir: str) -> list:
    os.makedirs(output_dir, exist_ok=True)
    
    tts, speaker = _get_tts()
    sample_rate = tts.synthesizer.output_sample_rate
    
    audio_paths = []
    
    for i, slide in enumerate(narrations):
        text = slide.get('narration', '')
        if not text:
            logger.warning(f"Slide {i} has no narration, skipping")
            continue
        
        logger.info(f"Generating audio for slide {i}...")
        
        wav = tts.tts(text=text, speaker=speaker)
        
        filename = f"slide_{i}.wav"
        filepath = os.path.join(output_dir, filename)
        sf.write(filepath, wav, sample_rate)
        
        audio_paths.append(filepath)
        logger.info(f"Saved audio: {filepath}")
    
    logger.info(f"Generated {len(audio_paths)} audio files")
    return audio_paths
