# Script generator for explainer videos
# Takes slide JSON and uses LLM to generate teacher-style narrations

import json
import re
from app.services.llm_service.llm import get_llm
from app.prompts import get_explainer_prompt
from app.services.logger import get_logger

logger = get_logger(__name__)


def clean_json_response(text: str) -> str:
    """
    Clean LLM response to extract valid JSON.
    Handles markdown code blocks, escape issues, and other common problems.
    """
    # Remove markdown code blocks (```json ... ``` or ``` ... ```)
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'```\s*$', '', text, flags=re.MULTILINE)
    text = text.strip()
    
    # Find the JSON object boundaries
    start = text.find('{')
    end = text.rfind('}')
    
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in response")
    
    json_str = text[start:end+1]
    
    # Fix common escape issues in narration text
    # Replace unescaped newlines inside strings
    # This regex finds strings and normalizes newlines within them
    def fix_string_escapes(match):
        s = match.group(0)
        # Replace actual newlines with escaped newlines
        s = s.replace('\r\n', '\\n').replace('\r', '\\n').replace('\n', '\\n')
        # Replace unescaped tabs
        s = s.replace('\t', '\\t')
        return s
    
    # Match JSON strings (simplified - handles most cases)
    json_str = re.sub(r'"(?:[^"\\]|\\.)*"', fix_string_escapes, json_str)
    
    return json_str


def generate_explainer_script(slides_data: dict) -> list:
    """
    Generate teacher-style narration for each slide using LLM.
    
    Args:
        slides_data: Dictionary containing slides from the PPT generator
        
    Returns:
        List of dicts with slide_index, title, and narration for each slide
    """
    # Convert slides data to JSON string for the prompt
    slides_json = json.dumps(slides_data, indent=2)
    
    # Get the LLM and prepare the prompt
    llm = get_llm()
    prompt = get_explainer_prompt(slides_json)
    
    logger.info("Generating explainer script via LLM...")
    
    # Call LLM to generate narrations
    response = llm.invoke(prompt)
    
    # Extract text from response (handles different LLM response formats)
    text = getattr(response, 'content', str(response)).strip()
    
    # Clean and parse JSON from response
    try:
        cleaned_json = clean_json_response(text)
        result = json.loads(cleaned_json)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        logger.error(f"Raw response (first 500 chars): {text[:500]}")
        raise
    
    narrations = result.get('slides', [])
    
    logger.info(f"Generated narrations for {len(narrations)} slides")
    return narrations
