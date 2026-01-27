import requests
import os

SCRAPE_API_URL = os.getenv("IMAGE_GENERATION_ENDPOINT")
if not SCRAPE_API_URL:
    raise ValueError("IMAGE_GENERATION_ENDPOINT environment variable is not set")


def fetch_image(prompt: str, engine: str = "google", num_images: int = 10) -> bytes:
    params = {
        "query": prompt,
        "engine": engine,
        "num_images": num_images
    }
    response = requests.get(SCRAPE_API_URL, params=params)
    response.raise_for_status()

    data = response.json()
    images = data.get("images", [])
    
    if not images:
        raise Exception("No images found in scraper response")

    for img_entry in images:
        try:
            image_url = img_entry.get("image_url")
            if not image_url:
                continue
                
            print(f"Downloading image from: {image_url}")
            image_response = requests.get(image_url, timeout=10)
            if image_response.status_code == 200:
                print("Successfully downloaded image.")
                return image_response.content
            else:
                print(f"Failed to download image. Status code: {image_response.status_code}")
        except Exception as e:
            print(f"Error downloading image: {e}")
            continue
            
    raise Exception("Failed to download any images from scraper results")


def generate_image_from_llm(prompt: str, llm=None) -> bytes:
    return fetch_image(prompt)


def generate_diagram_from_llm(prompt: str, llm=None) -> bytes:
    return fetch_image(prompt + " diagram")


class ImageGenerator:
    def __init__(self, llm=None):
        self.llm = llm
    
    def generate_image(self, prompt: str) -> bytes:
        return generate_image_from_llm(prompt, self.llm)
