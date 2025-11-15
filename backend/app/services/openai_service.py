import os
import base64
from typing import Optional
from openai import OpenAI
from app.core.config import settings

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    async def analyze_image(self, image_data: bytes, filename: str) -> dict:
        """
        Analyze an image using GPT-4 Vision
        Returns detected instruments, musicians, scene type, and suggested tags
        """
        try:
            # Encode image to base64
            base64_image = base64.b64encode(image_data).decode('utf-8')

            # Determine image type from filename
            ext = filename.lower().split('.')[-1]
            mime_type = f"image/{ext if ext in ['jpeg', 'jpg', 'png', 'gif', 'webp'] else 'jpeg'}"

            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """Analyze this music-related image and provide:
1. Detected musical instruments (list)
2. Number of musicians visible
3. Scene type (studio, live_performance, rehearsal, outdoor, etc.)
4. Musical style/genre if identifiable
5. Atmosphere/mood
6. Suggested Instagram hashtags (10-15 relevant tags)

Return your analysis in this exact JSON format:
{
    "detected_objects": ["instrument1", "instrument2", "musician"],
    "instruments": ["guitar", "drums"],
    "musician_count": 2,
    "scene_type": "live_performance",
    "style": "jazz",
    "mood": "energetic",
    "suggested_tags": ["#jazz", "#livemusic", "#concert"],
    "confidence": 0.95,
    "description": "Brief description of the scene"
}"""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )

            # Parse response
            content = response.choices[0].message.content

            # Try to extract JSON from response
            import json
            try:
                # Look for JSON in the response
                start = content.find('{')
                end = content.rfind('}') + 1
                if start != -1 and end != 0:
                    analysis = json.loads(content[start:end])
                else:
                    # Fallback if no JSON found
                    analysis = {
                        "detected_objects": ["musician", "instrument"],
                        "instruments": ["unknown"],
                        "musician_count": 1,
                        "scene_type": "music",
                        "style": "unknown",
                        "mood": "creative",
                        "suggested_tags": ["#music", "#musician", "#artist"],
                        "confidence": 0.7,
                        "description": content
                    }
            except json.JSONDecodeError:
                # Fallback analysis
                analysis = {
                    "detected_objects": ["musician"],
                    "instruments": ["unknown"],
                    "musician_count": 1,
                    "scene_type": "music",
                    "style": "unknown",
                    "mood": "creative",
                    "suggested_tags": ["#music", "#musician"],
                    "confidence": 0.6,
                    "description": content
                }

            return analysis

        except Exception as e:
            print(f"Error analyzing image with OpenAI: {str(e)}")
            # Return fallback analysis
            return {
                "detected_objects": ["musician"],
                "instruments": ["unknown"],
                "musician_count": 1,
                "scene_type": "music",
                "style": "jazz",
                "mood": "creative",
                "suggested_tags": ["#music", "#jazz", "#musician"],
                "confidence": 0.5,
                "description": "Image analysis unavailable",
                "error": str(e)
            }

    async def generate_caption(
        self,
        analysis: dict,
        musicians: Optional[list] = None,
        venue: Optional[str] = None,
        style: Optional[str] = None,
        language: str = "fr"
    ) -> dict:
        """
        Generate an Instagram caption based on image analysis and context
        """
        try:
            # Build context
            context_parts = []
            if musicians:
                context_parts.append(f"Musiciens: {', '.join(musicians)}")
            if venue:
                context_parts.append(f"Lieu: {venue}")
            if style:
                context_parts.append(f"Style: {style}")

            context = "\n".join(context_parts) if context_parts else "Pas de contexte supplémentaire"

            prompt = f"""Generate an engaging Instagram caption in {language} for a music post.

Image Analysis:
- Instruments: {', '.join(analysis.get('instruments', []))}
- Scene: {analysis.get('scene_type', 'music')}
- Mood: {analysis.get('mood', 'creative')}
- Style: {analysis.get('style', 'music')}

Context:
{context}

Create a caption that:
1. Is authentic and engaging (2-3 sentences)
2. Captures the energy and mood
3. Includes relevant emojis
4. Ends with 10-15 relevant hashtags
5. Is optimized for Instagram engagement

Return ONLY the caption text, nothing else."""

            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a social media expert specializing in music content for Instagram. Create authentic, engaging captions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.8
            )

            caption = response.choices[0].message.content.strip()

            # Extract hashtags from caption
            hashtags = [word for word in caption.split() if word.startswith('#')]

            return {
                "caption": caption,
                "hashtags": hashtags,
                "language": language
            }

        except Exception as e:
            print(f"Error generating caption with OpenAI: {str(e)}")
            # Fallback caption
            caption = f"🎵 Belle session ce soir ! ✨\n\nL'énergie était incroyable ! 🎸\n\n#music #livemusic #musician #jazz #concert"
            return {
                "caption": caption,
                "hashtags": ["#music", "#livemusic", "#musician", "#jazz", "#concert"],
                "error": str(e)
            }

# Create a singleton instance
openai_service = OpenAIService()
