# Slide renderer for explainer videos
# Uses Playwright to screenshot each slide from HTML

import os
import subprocess
import sys
import json
from app.services.logger import get_logger

logger = get_logger(__name__)


def render_slides_to_images(html_path: str, output_dir: str) -> list:
    """
    Render each slide from HTML to PNG images using Playwright.
    Uses subprocess to avoid Windows asyncio issues.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    logger.info(f"Rendering slides from: {html_path}")
    
    abs_html_path = os.path.abspath(html_path)
    abs_output_dir = os.path.abspath(output_dir)
    
    # Run Playwright in a separate Python process to avoid asyncio issues
    script = f'''
import os
import json
from playwright.sync_api import sync_playwright

html_path = {repr(abs_html_path)}
output_dir = {repr(abs_output_dir)}
image_paths = []

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={{"width": 1280, "height": 720}})
    
    file_url = "file:///" + html_path.replace(os.sep, "/")
    page.goto(file_url)
    page.wait_for_load_state("networkidle")
    
    slides = page.query_selector_all(".slide")
    
    for i, slide in enumerate(slides):
        filepath = os.path.join(output_dir, f"slide_{{i}}.png")
        slide.scroll_into_view_if_needed()
        slide.screenshot(path=filepath)
        image_paths.append(filepath)
    
    browser.close()

print(json.dumps(image_paths))
'''
    
    try:
        result = subprocess.run(
            [sys.executable, "-c", script],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode != 0:
            logger.error(f"Playwright subprocess error: {result.stderr}")
            raise RuntimeError(f"Playwright failed: {result.stderr}")
        
        image_paths = json.loads(result.stdout.strip())
        logger.info(f"Rendered {len(image_paths)} slide images")
        return image_paths
        
    except subprocess.TimeoutExpired:
        logger.error("Playwright subprocess timed out")
        raise RuntimeError("Slide rendering timed out")
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Playwright output: {result.stdout}")
        raise RuntimeError("Failed to parse slide renderer output")
