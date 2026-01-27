from TTS.api import TTS
import soundfile as sf
import os
import re
import torch

# Load model (NO gpu argument here)
tts = TTS("tts_models/en/vctk/vits")

# Move to GPU if available
if torch.cuda.is_available():
    tts = tts.to("cuda")

# Output folder
output_dir = "speaker_samples"
os.makedirs(output_dir, exist_ok=True)

sample_text = "Hello, this is a sample of my voice."
sample_rate = tts.synthesizer.output_sample_rate

def safe_filename(name):
    name = name.strip()
    return re.sub(r'[\\/:*?"<>|\r\n]+', '_', name)

print(f"Found {len(tts.speakers)} speakers. Generating samples...")

for speaker in tts.speakers:
    try:
        wav = tts.tts(text=sample_text, speaker=speaker)

        safe_name = safe_filename(speaker)
        filepath = os.path.join(output_dir, f"{safe_name}.wav")

        sf.write(filepath, wav, sample_rate)
        print(f"✅ Saved: {filepath}")

    except Exception as e:
        print(f"❌ Skipped speaker {repr(speaker)} → {e}")

print("🎉 Done!")
