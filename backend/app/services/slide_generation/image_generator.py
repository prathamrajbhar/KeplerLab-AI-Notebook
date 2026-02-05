import requests
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

SCRAPE_API_URL = os.getenv("IMAGE_GENERATION_ENDPOINT")
if not SCRAPE_API_URL:
    logger.warning(
        "IMAGE_GENERATION_ENDPOINT environment variable is not set. Image generation will fail."
    )
    SCRAPE_API_URL = None  # Allow graceful degradation


def validate_image_data(image_data: bytes) -> bool:
    """Validate that the downloaded data is actually an image."""
    if not image_data or len(image_data) < 100:  # Too small to be a valid image
        return False

    # Check for common image file signatures
    image_signatures = [
        b"\xff\xd8\xff",  # JPEG
        b"\x89PNG\r\n\x1a\n",  # PNG
        b"GIF87a",  # GIF87a
        b"GIF89a",  # GIF89a
        b"RIFF",  # WebP (starts with RIFF)
        b"BM",  # BMP
    ]

    return any(image_data.startswith(sig) for sig in image_signatures)


def fetch_image(
    prompt: str, engine: str = "google", num_images: int = 10, max_retries: int = 3
) -> bytes:
    """
    Fetch an image based on the given prompt using an external scraping API.

    Args:
        prompt: Search query for the image
        engine: Search engine to use (default: google)
        num_images: Number of images to request
        max_retries: Maximum number of download attempts per image

    Returns:
        bytes: Image data

    Raises:
        Exception: If no valid images can be downloaded
    """
    if not SCRAPE_API_URL:
        raise Exception(
            "IMAGE_GENERATION_ENDPOINT is not configured. Cannot fetch images."
        )

    logger.info(f"Fetching image for prompt: '{prompt[:100]}...'")

    try:
        params = {"query": prompt, "engine": engine, "num_images": num_images}

        # Request image search results
        logger.debug(f"Requesting images from {SCRAPE_API_URL} with params: {params}")
        response = requests.get(SCRAPE_API_URL, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        images = data.get("images", [])

        if not images:
            logger.warning(
                f"No images found in scraper response for prompt: '{prompt[:50]}...'"
            )
            raise Exception(f"No images found for prompt: '{prompt[:50]}...'")

        logger.info(f"Found {len(images)} image URLs from scraper")

        # Try to download images with retry logic
        for idx, img_entry in enumerate(images):
            image_url = img_entry.get("image_url")
            if not image_url:
                logger.debug(f"Image entry {idx} has no URL, skipping")
                continue

            # Try downloading this image with retries
            for attempt in range(max_retries):
                try:
                    logger.debug(
                        f"Attempt {attempt + 1}/{max_retries}: Downloading image from: {image_url}"
                    )
                    image_response = requests.get(
                        image_url,
                        timeout=15,
                        headers={
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        },
                    )

                    if image_response.status_code == 200:
                        image_data = image_response.content

                        # Validate the image data
                        if validate_image_data(image_data):
                            logger.info(
                                f"Successfully downloaded and validated image ({len(image_data)} bytes) from: {image_url}"
                            )
                            return image_data
                        else:
                            logger.warning(
                                f"Downloaded data from {image_url} is not a valid image"
                            )
                    else:
                        logger.warning(
                            f"Failed to download image. Status code: {image_response.status_code}"
                        )

                except requests.Timeout:
                    logger.warning(
                        f"Timeout downloading image from {image_url} (attempt {attempt + 1}/{max_retries})"
                    )
                except requests.RequestException as e:
                    logger.warning(
                        f"Error downloading image from {image_url}: {str(e)} (attempt {attempt + 1}/{max_retries})"
                    )
                except Exception as e:
                    logger.error(
                        f"Unexpected error downloading image from {image_url}: {str(e)}"
                    )
                    break  # Don't retry on unexpected errors

            logger.debug(
                f"Failed to download image {idx + 1} after {max_retries} attempts"
            )

        # If we get here, all images failed
        logger.error(
            f"Failed to download any valid images from {len(images)} URLs for prompt: '{prompt[:50]}...'"
        )
        raise Exception(
            f"Failed to download any valid images for prompt: '{prompt[:50]}...'"
        )

    except requests.RequestException as e:
        logger.error(f"Error communicating with image scraper API: {str(e)}")
        raise Exception(f"Image scraper API error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in fetch_image: {str(e)}")
        raise


def generate_image_from_llm(prompt: str, llm=None) -> bytes:
    """Generate an image using the fetch_image function."""
    return fetch_image(prompt)


def generate_diagram_from_llm(prompt: str, llm=None) -> bytes:
    """Generate a diagram by appending 'diagram' to the prompt."""
    # Enhance the prompt for better diagram results
    diagram_prompt = (
        prompt
        if "diagram" in prompt.lower()
        else f"{prompt} technical diagram schematic"
    )
    return fetch_image(diagram_prompt)


class ImageGenerator:
    def __init__(self, llm=None):
        self.llm = llm

    def generate_image(self, prompt: str) -> bytes:
        return generate_image_from_llm(prompt, self.llm)
