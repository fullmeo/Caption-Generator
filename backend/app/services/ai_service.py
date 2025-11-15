"""
Multi-Model AI Service
Supports GPT-4 Vision, Claude 3.5 Sonnet, and other AI models
"""
import os
import base64
from typing import Optional, Dict, List, Literal
from enum import Enum
import anthropic
from openai import OpenAI
from app.core.config import settings

# AI Models
class AIModel(str, Enum):
    GPT4_VISION = "gpt-4-vision-preview"
    GPT4 = "gpt-4"
    CLAUDE_SONNET = "claude-3-5-sonnet-20241022"
    CLAUDE_HAIKU = "claude-3-5-haiku-20241022"

# Caption Styles
class CaptionStyle(str, Enum):
    PROFESSIONAL = "professional"  # Formel, professionnel
    CASUAL = "casual"  # Décontracté, amical
    POETIC = "poetic"  # Poétique, artistique
    ENERGETIC = "energetic"  # Énergique, enthousiaste
    MINIMAL = "minimal"  # Minimaliste, sobre
    STORYTELLING = "storytelling"  # Narratif, histoire

# Languages
class Language(str, Enum):
    FRENCH = "fr"
    ENGLISH = "en"
    SPANISH = "es"
    GERMAN = "de"
    ITALIAN = "it"

class MultiModelAIService:
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.claude_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None

    async def analyze_image_with_model(
        self,
        image_data: bytes,
        filename: str,
        model: AIModel = AIModel.GPT4_VISION
    ) -> dict:
        """Analyze image using specified AI model"""

        if model in [AIModel.GPT4_VISION, AIModel.GPT4]:
            return await self._analyze_with_openai(image_data, filename, model)
        elif model in [AIModel.CLAUDE_SONNET, AIModel.CLAUDE_HAIKU]:
            return await self._analyze_with_claude(image_data, filename, model)
        else:
            raise ValueError(f"Unsupported model: {model}")

    async def _analyze_with_openai(
        self,
        image_data: bytes,
        filename: str,
        model: AIModel
    ) -> dict:
        """Analyze image using OpenAI GPT-4 Vision"""
        try:
            base64_image = base64.b64encode(image_data).decode('utf-8')
            ext = filename.lower().split('.')[-1]
            mime_type = f"image/{ext if ext in ['jpeg', 'jpg', 'png', 'gif', 'webp'] else 'jpeg'}"

            response = self.openai_client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": self._get_analysis_prompt()
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }],
                max_tokens=600
            )

            return self._parse_analysis_response(response.choices[0].message.content, "openai")

        except Exception as e:
            print(f"OpenAI analysis error: {str(e)}")
            return self._get_fallback_analysis(str(e))

    async def _analyze_with_claude(
        self,
        image_data: bytes,
        filename: str,
        model: AIModel
    ) -> dict:
        """Analyze image using Claude 3.5 Sonnet"""
        if not self.claude_client:
            raise ValueError("Claude API key not configured")

        try:
            base64_image = base64.b64encode(image_data).decode('utf-8')
            ext = filename.lower().split('.')[-1]
            media_type = f"image/{ext if ext in ['jpeg', 'jpg', 'png', 'gif', 'webp'] else 'jpeg'}"

            message = self.claude_client.messages.create(
                model=model.value,
                max_tokens=1024,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": base64_image,
                            },
                        },
                        {
                            "type": "text",
                            "text": self._get_analysis_prompt()
                        }
                    ],
                }]
            )

            return self._parse_analysis_response(message.content[0].text, "claude")

        except Exception as e:
            print(f"Claude analysis error: {str(e)}")
            return self._get_fallback_analysis(str(e))

    def _get_analysis_prompt(self) -> str:
        """Get the analysis prompt for image analysis"""
        return """Analyze this music-related image in detail and provide:

1. **Instruments detected**: List all visible musical instruments
2. **Musicians count**: Number of people visible
3. **Scene type**: (studio, live_performance, rehearsal, outdoor_festival, street_performance, recording_session)
4. **Musical genre/style**: Identify the genre (jazz, rock, classical, hip-hop, electronic, folk, world, fusion, etc.)
5. **Mood/Atmosphere**: Describe the overall feeling (energetic, intimate, melancholic, joyful, intense, relaxed)
6. **Lighting & Colors**: Describe dominant colors and lighting type (warm, cool, dramatic, natural, stage lights)
7. **Composition quality**: Rate the photo quality and composition
8. **Suggested Instagram filters**: Based on colors and mood (Clarendon, Gingham, Juno, Lark, etc.)
9. **Hashtags**: 15 highly relevant and trending hashtags
10. **Best caption angle**: What aspect to emphasize (energy, intimacy, technique, venue, etc.)

Return ONLY valid JSON in this exact format:
{
    "detected_objects": ["instrument1", "musician", "equipment"],
    "instruments": ["guitar", "drums"],
    "musician_count": 2,
    "scene_type": "live_performance",
    "genre": "jazz",
    "subgenre": "bebop",
    "mood": "energetic and vibrant",
    "lighting": "warm stage lights with dramatic shadows",
    "dominant_colors": ["#1a1a2e", "#eebf3f", "#c73e1d"],
    "composition_quality": "professional",
    "suggested_filters": ["Clarendon", "Juno", "Lark"],
    "suggested_tags": ["#jazz", "#livemusic", "#concert", "#bebop", "#jazzmusician", "#musicphotography", "#concertphotography", "#liveperformance", "#jazzclub", "#musiclife", "#jazznight", "#instamusic", "#musician", "#musiclover", "#jazzlove"],
    "confidence": 0.95,
    "caption_angle": "emphasize the energy and crowd engagement",
    "description": "Brief description of the scene"
}"""

    async def generate_caption_with_style(
        self,
        analysis: dict,
        style: CaptionStyle = CaptionStyle.CASUAL,
        language: Language = Language.FRENCH,
        musicians: Optional[List[str]] = None,
        venue: Optional[str] = None,
        custom_context: Optional[str] = None,
        model: AIModel = AIModel.GPT4
    ) -> dict:
        """Generate caption with specific style and language"""

        if model in [AIModel.GPT4_VISION, AIModel.GPT4]:
            return await self._generate_with_openai(
                analysis, style, language, musicians, venue, custom_context, model
            )
        elif model in [AIModel.CLAUDE_SONNET, AIModel.CLAUDE_HAIKU]:
            return await self._generate_with_claude(
                analysis, style, language, musicians, venue, custom_context, model
            )

    async def _generate_with_openai(
        self,
        analysis: dict,
        style: CaptionStyle,
        language: Language,
        musicians: Optional[List[str]],
        venue: Optional[str],
        custom_context: Optional[str],
        model: AIModel
    ) -> dict:
        """Generate caption using OpenAI"""
        try:
            prompt = self._build_caption_prompt(
                analysis, style, language, musicians, venue, custom_context
            )

            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt_for_style(style, language)
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=400,
                temperature=0.8
            )

            caption = response.choices[0].message.content.strip()
            hashtags = [word for word in caption.split() if word.startswith('#')]

            return {
                "caption": caption,
                "hashtags": hashtags,
                "style": style.value,
                "language": language.value,
                "model_used": "openai-gpt4"
            }

        except Exception as e:
            print(f"OpenAI caption generation error: {str(e)}")
            return self._get_fallback_caption(analysis, style, language)

    async def _generate_with_claude(
        self,
        analysis: dict,
        style: CaptionStyle,
        language: Language,
        musicians: Optional[List[str]],
        venue: Optional[str],
        custom_context: Optional[str],
        model: AIModel
    ) -> dict:
        """Generate caption using Claude"""
        if not self.claude_client:
            raise ValueError("Claude API key not configured")

        try:
            prompt = self._build_caption_prompt(
                analysis, style, language, musicians, venue, custom_context
            )

            message = self.claude_client.messages.create(
                model=model.value,
                max_tokens=500,
                system=self._get_system_prompt_for_style(style, language),
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            caption = message.content[0].text.strip()
            hashtags = [word for word in caption.split() if word.startswith('#')]

            return {
                "caption": caption,
                "hashtags": hashtags,
                "style": style.value,
                "language": language.value,
                "model_used": f"claude-{model.value}"
            }

        except Exception as e:
            print(f"Claude caption generation error: {str(e)}")
            return self._get_fallback_caption(analysis, style, language)

    def _build_caption_prompt(
        self,
        analysis: dict,
        style: CaptionStyle,
        language: Language,
        musicians: Optional[List[str]],
        venue: Optional[str],
        custom_context: Optional[str]
    ) -> str:
        """Build the caption generation prompt"""

        context_parts = []
        if musicians:
            context_parts.append(f"Musicians: {', '.join(musicians)}")
        if venue:
            context_parts.append(f"Venue: {venue}")
        if custom_context:
            context_parts.append(f"Additional context: {custom_context}")

        context = "\n".join(context_parts) if context_parts else "No additional context"

        lang_names = {
            Language.FRENCH: "French",
            Language.ENGLISH: "English",
            Language.SPANISH: "Spanish",
            Language.GERMAN: "German",
            Language.ITALIAN: "Italian"
        }

        return f"""Generate an Instagram caption in {lang_names[language]} for this music photo.

**Image Analysis:**
- Genre: {analysis.get('genre', 'music')} {f"({analysis.get('subgenre', '')})" if analysis.get('subgenre') else ''}
- Scene: {analysis.get('scene_type', 'music performance')}
- Mood: {analysis.get('mood', 'creative')}
- Instruments: {', '.join(analysis.get('instruments', ['instruments']))}
- Lighting: {analysis.get('lighting', 'stage lighting')}
- Caption Angle: {analysis.get('caption_angle', 'general music vibe')}

**Context:**
{context}

**Style Requirements:**
{self._get_style_requirements(style)}

**Format:**
- 2-4 sentences in {lang_names[language]}
- Appropriate emojis for the style
- End with 10-15 relevant hashtags
- Optimized for Instagram engagement

Return ONLY the caption text, nothing else."""

    def _get_style_requirements(self, style: CaptionStyle) -> str:
        """Get specific requirements for each style"""
        requirements = {
            CaptionStyle.PROFESSIONAL: """
- Professional and polished tone
- Focus on technical aspects and artistry
- Sophisticated vocabulary
- Minimal emojis (max 2-3, professional ones only)
- Industry-relevant hashtags""",

            CaptionStyle.CASUAL: """
- Friendly and conversational tone
- Relatable and authentic voice
- Moderate emoji use (4-6)
- Mix of popular and niche hashtags
- Feels like talking to a friend""",

            CaptionStyle.POETIC: """
- Artistic and lyrical language
- Metaphors and imagery
- Evocative descriptions
- Selective emoji use (2-3, symbolic)
- Poetic/artistic hashtags""",

            CaptionStyle.ENERGETIC: """
- High energy and enthusiasm
- Exclamation points and dynamic language
- Generous emoji use (6-8)
- Trending and viral hashtags
- Captures excitement and momentum""",

            CaptionStyle.MINIMAL: """
- Short and concise (1-2 sentences max)
- No or very minimal emojis (0-1)
- Simple, direct language
- Essential hashtags only (5-8)
- Let the image speak""",

            CaptionStyle.STORYTELLING: """
- Narrative structure with beginning/middle/end
- Sets the scene and builds atmosphere
- Personal and engaging
- Strategic emoji use (3-5)
- Story-focused hashtags"""
        }
        return requirements.get(style, requirements[CaptionStyle.CASUAL])

    def _get_system_prompt_for_style(self, style: CaptionStyle, language: Language) -> str:
        """Get system prompt based on style"""
        base = "You are an expert social media content creator specializing in music and Instagram captions."

        style_prompts = {
            CaptionStyle.PROFESSIONAL: "You write professional, polished content for established musicians and industry professionals.",
            CaptionStyle.CASUAL: "You write friendly, authentic captions that feel personal and relatable.",
            CaptionStyle.POETIC: "You write artistic, lyrical captions with beautiful imagery and metaphors.",
            CaptionStyle.ENERGETIC: "You write high-energy, enthusiastic captions that capture excitement and momentum.",
            CaptionStyle.MINIMAL: "You write minimal, concise captions that are direct and impactful.",
            CaptionStyle.STORYTELLING: "You write narrative captions that tell compelling stories and set the scene."
        }

        return f"{base} {style_prompts[style]} Always write in perfect, native-level {language.value.upper()}."

    def _parse_analysis_response(self, content: str, source: str) -> dict:
        """Parse AI response and extract JSON"""
        import json
        try:
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != 0:
                return json.loads(content[start:end])
            else:
                return self._get_fallback_analysis(f"No JSON found in {source} response")
        except json.JSONDecodeError as e:
            return self._get_fallback_analysis(f"JSON parse error from {source}: {str(e)}")

    def _get_fallback_analysis(self, error: str = "") -> dict:
        """Fallback analysis when AI fails"""
        return {
            "detected_objects": ["musician", "instrument"],
            "instruments": ["unknown"],
            "musician_count": 1,
            "scene_type": "music",
            "genre": "music",
            "subgenre": "",
            "mood": "creative",
            "lighting": "stage lighting",
            "dominant_colors": ["#1a1a2e", "#eebf3f"],
            "composition_quality": "good",
            "suggested_filters": ["Clarendon", "Juno"],
            "suggested_tags": ["#music", "#musician", "#livemusic"],
            "confidence": 0.5,
            "caption_angle": "general music vibe",
            "description": "Music performance",
            "error": error
        }

    def _get_fallback_caption(self, analysis: dict, style: CaptionStyle, language: Language) -> dict:
        """Fallback caption when AI fails"""
        captions = {
            Language.FRENCH: "🎵 Session musicale intense ! L'énergie était incroyable. 🎸✨\n\n#music #livemusic #musician #concert #musiclife",
            Language.ENGLISH: "🎵 Amazing music session! The energy was incredible. 🎸✨\n\n#music #livemusic #musician #concert #musiclife",
            Language.SPANISH: "🎵 ¡Sesión musical increíble! La energía fue espectacular. 🎸✨\n\n#musica #musicaenvivo #musico #concierto #vidamusical",
            Language.GERMAN: "🎵 Fantastische Musik-Session! Die Energie war unglaublich. 🎸✨\n\n#musik #livemusik #musiker #konzert #musikleben",
            Language.ITALIAN: "🎵 Sessione musicale fantastica! L'energia era incredibile. 🎸✨\n\n#musica #musicadalvivo #musicista #concerto #vitamusicale"
        }

        caption = captions.get(language, captions[Language.FRENCH])
        hashtags = [word for word in caption.split() if word.startswith('#')]

        return {
            "caption": caption,
            "hashtags": hashtags,
            "style": style.value,
            "language": language.value,
            "fallback": True
        }

# Singleton instance
multi_model_ai_service = MultiModelAIService()
