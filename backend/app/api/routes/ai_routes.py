"""
Advanced AI Routes
Multi-model, multi-style, multi-language caption generation
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import json

from app.core.database import get_db
from app.models.models import User, Caption
from app.services.ai_service import (
    multi_model_ai_service,
    AIModel,
    CaptionStyle,
    Language
)

router = APIRouter(prefix="/ai", tags=["AI Advanced"])

# Dependency to get current user (simplified for now)
async def get_current_user_optional():
    """Optional user dependency - returns None if not authenticated"""
    return None  # TODO: Implement proper auth dependency

@router.post("/analyze-advanced")
async def analyze_media_advanced(
    file: UploadFile = File(...),
    model: AIModel = Query(AIModel.GPT4_VISION, description="AI model to use for analysis"),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Analyze media with advanced AI model selection

    **Models available:**
    - `gpt-4-vision-preview`: OpenAI GPT-4 Vision (best for detailed analysis)
    - `gpt-4`: OpenAI GPT-4 (text-based fallback)
    - `claude-3-5-sonnet-20241022`: Claude 3.5 Sonnet (excellent reasoning)
    - `claude-3-5-haiku-20241022`: Claude 3.5 Haiku (fast and efficient)
    """
    try:
        if not file.content_type.startswith(('image/', 'video/')):
            raise HTTPException(status_code=400, detail="File must be an image or video")

        content = await file.read()

        analysis = await multi_model_ai_service.analyze_image_with_model(
            content,
            file.filename,
            model=model
        )

        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "model_used": model.value,
            "analysis": analysis
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/generate-styled-caption")
async def generate_styled_caption(
    analysis: dict,
    style: CaptionStyle = Query(CaptionStyle.CASUAL, description="Caption style"),
    language: Language = Query(Language.FRENCH, description="Output language"),
    model: AIModel = Query(AIModel.GPT4, description="AI model for generation"),
    musicians: Optional[str] = Query(None, description="Comma-separated musician names"),
    venue: Optional[str] = Query(None, description="Venue name"),
    custom_context: Optional[str] = Query(None, description="Additional context"),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Generate caption with specific style and language

    **Styles:**
    - `professional`: Formal, polished, industry-focused
    - `casual`: Friendly, conversational, relatable
    - `poetic`: Artistic, lyrical, metaphorical
    - `energetic`: High-energy, enthusiastic, exciting
    - `minimal`: Short, concise, direct
    - `storytelling`: Narrative, atmospheric, engaging

    **Languages:**
    - `fr`: French
    - `en`: English
    - `es`: Spanish
    - `de`: German
    - `it`: Italian
    """
    try:
        musicians_list = musicians.split(',') if musicians else None

        result = await multi_model_ai_service.generate_caption_with_style(
            analysis=analysis,
            style=style,
            language=language,
            musicians=musicians_list,
            venue=venue,
            custom_context=custom_context,
            model=model
        )

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/analyze-and-generate-pro")
async def analyze_and_generate_pro(
    file: UploadFile = File(...),
    analysis_model: AIModel = Query(AIModel.GPT4_VISION, description="Model for analysis"),
    caption_model: AIModel = Query(AIModel.GPT4, description="Model for caption generation"),
    style: CaptionStyle = Query(CaptionStyle.CASUAL, description="Caption style"),
    language: Language = Query(Language.FRENCH, description="Output language"),
    musicians: Optional[str] = Query(None, description="Comma-separated musician names"),
    venue: Optional[str] = Query(None, description="Venue name"),
    custom_context: Optional[str] = Query(None, description="Additional context"),
    save_to_db: bool = Query(True, description="Save to database"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Complete workflow: Analyze with one model, generate caption with another

    This is the **PRO version** allowing you to:
    - Choose different models for analysis vs generation
    - Select caption style (professional, casual, poetic, etc.)
    - Choose output language (FR, EN, ES, DE, IT)
    - Add custom context
    - Save to database (if authenticated)

    **Example combinations:**
    - Analysis: `claude-3-5-sonnet-20241022`, Caption: `gpt-4` (Claude's reasoning + GPT's creativity)
    - Analysis: `gpt-4-vision-preview`, Caption: `gpt-4` (OpenAI stack)
    - Fast: `claude-3-5-haiku-20241022` for both (quick results)
    """
    try:
        if not file.content_type.startswith(('image/', 'video/')):
            raise HTTPException(status_code=400, detail="File must be an image or video")

        # Step 1: Analyze image
        content = await file.read()
        analysis = await multi_model_ai_service.analyze_image_with_model(
            content,
            file.filename,
            model=analysis_model
        )

        # Step 2: Generate caption
        musicians_list = musicians.split(',') if musicians else None
        caption_result = await multi_model_ai_service.generate_caption_with_style(
            analysis=analysis,
            style=style,
            language=language,
            musicians=musicians_list,
            venue=venue,
            custom_context=custom_context,
            model=caption_model
        )

        # Step 3: Save to database (if user is authenticated and wants to save)
        if save_to_db and current_user and db:
            db_caption = Caption(
                user_id=current_user.id,
                caption_text=caption_result["caption"],
                media_filename=file.filename,
                detected_objects=json.dumps(analysis.get("detected_objects", [])),
                suggested_tags=json.dumps(analysis.get("suggested_tags", [])),
                confidence=analysis.get("confidence"),
                musicians=json.dumps(musicians_list) if musicians_list else None,
                venue=venue,
                style=analysis.get("genre", "music")
            )
            db.add(db_caption)
            db.commit()

        return {
            "filename": file.filename,
            "analysis": {
                **analysis,
                "model_used": analysis_model.value
            },
            "caption": caption_result["caption"],
            "hashtags": caption_result["hashtags"],
            "style": style.value,
            "language": language.value,
            "models_used": {
                "analysis": analysis_model.value,
                "caption": caption_model.value
            },
            "saved_to_db": save_to_db and current_user is not None
        }

    except ValueError as e:
        if db:
            db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if db:
            db.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/compare-models")
async def compare_models(
    file: UploadFile = File(...),
    models: List[AIModel] = Query(
        [AIModel.GPT4_VISION, AIModel.CLAUDE_SONNET],
        description="Models to compare"
    )
):
    """
    Compare multiple AI models on the same image

    Returns analysis from each model side-by-side for comparison
    """
    try:
        if not file.content_type.startswith(('image/', 'video/')):
            raise HTTPException(status_code=400, detail="File must be an image or video")

        content = await file.read()
        results = {}

        for model in models:
            try:
                analysis = await multi_model_ai_service.analyze_image_with_model(
                    content,
                    file.filename,
                    model=model
                )
                results[model.value] = analysis
            except Exception as e:
                results[model.value] = {"error": str(e)}

        return {
            "filename": file.filename,
            "comparisons": results,
            "models_compared": [m.value for m in models]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/available-options")
async def get_available_options():
    """
    Get all available AI options (models, styles, languages)
    """
    return {
        "models": {
            "analysis": [
                {
                    "value": AIModel.GPT4_VISION.value,
                    "name": "GPT-4 Vision",
                    "provider": "OpenAI",
                    "description": "Best for detailed visual analysis"
                },
                {
                    "value": AIModel.CLAUDE_SONNET.value,
                    "name": "Claude 3.5 Sonnet",
                    "provider": "Anthropic",
                    "description": "Excellent reasoning and understanding"
                },
                {
                    "value": AIModel.CLAUDE_HAIKU.value,
                    "name": "Claude 3.5 Haiku",
                    "provider": "Anthropic",
                    "description": "Fast and efficient"
                }
            ],
            "caption": [
                {
                    "value": AIModel.GPT4.value,
                    "name": "GPT-4",
                    "provider": "OpenAI",
                    "description": "Creative and engaging captions"
                },
                {
                    "value": AIModel.CLAUDE_SONNET.value,
                    "name": "Claude 3.5 Sonnet",
                    "provider": "Anthropic",
                    "description": "Sophisticated and nuanced writing"
                },
                {
                    "value": AIModel.CLAUDE_HAIKU.value,
                    "name": "Claude 3.5 Haiku",
                    "provider": "Anthropic",
                    "description": "Quick caption generation"
                }
            ]
        },
        "styles": [
            {"value": CaptionStyle.PROFESSIONAL.value, "name": "Professional", "description": "Formal and polished"},
            {"value": CaptionStyle.CASUAL.value, "name": "Casual", "description": "Friendly and relatable"},
            {"value": CaptionStyle.POETIC.value, "name": "Poetic", "description": "Artistic and lyrical"},
            {"value": CaptionStyle.ENERGETIC.value, "name": "Energetic", "description": "High-energy and enthusiastic"},
            {"value": CaptionStyle.MINIMAL.value, "name": "Minimal", "description": "Short and concise"},
            {"value": CaptionStyle.STORYTELLING.value, "name": "Storytelling", "description": "Narrative and engaging"}
        ],
        "languages": [
            {"value": Language.FRENCH.value, "name": "Français", "flag": "🇫🇷"},
            {"value": Language.ENGLISH.value, "name": "English", "flag": "🇬🇧"},
            {"value": Language.SPANISH.value, "name": "Español", "flag": "🇪🇸"},
            {"value": Language.GERMAN.value, "name": "Deutsch", "flag": "🇩🇪"},
            {"value": Language.ITALIAN.value, "name": "Italiano", "flag": "🇮🇹"}
        ]
    }
