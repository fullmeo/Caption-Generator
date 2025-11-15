from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = FastAPI(
    title="Caption Generator API",
    description="🎵 AI-powered caption generator for musicians",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://*.preview.app.github.dev",
        "https://*.githubpreview.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "🎵 Caption Generator API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "analyze_media": "/analyze-media",
            "generate_caption": "/generate-caption",
            "analyze_and_generate": "/analyze-and-generate",
            "musicians": "/musicians",
            "venues": "/venues",
            "analytics": "/analytics"
        }
    }

@app.post("/analyze-media")
async def analyze_media(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith(('image/', 'video/')):
            raise HTTPException(status_code=400, detail="File must be an image or video")
        
        result = {
            "filename": file.filename,
            "content_type": file.content_type,
            "analysis": {
                "detected_objects": ["instrument", "musician"],
                "suggested_tags": ["#music", "#live", "#studio"],
                "confidence": 0.85
            }
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/generate-caption")
async def generate_caption(data: dict):
    try:
        musicians = data.get("musicians", [])
        venue = data.get("venue", "")
        style = data.get("style", "jazz")

        caption = f"🎵 Session {style}"

        if venue:
            caption += f" au {venue}"

        if musicians:
            caption += f" avec {', '.join(musicians)}"

        hashtags = [f"#{style}", "#livemusic", "#musician", "#paris"]
        caption += f"\n\n{' '.join(hashtags)}"

        return {"caption": caption, "hashtags": hashtags}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/analyze-and-generate")
async def analyze_and_generate(file: UploadFile = File(...)):
    """Analyse un média et génère directement une caption"""
    try:
        # Vérifier le type de fichier
        if not file.content_type.startswith(('image/', 'video/')):
            raise HTTPException(status_code=400, detail="File must be an image or video")

        # Analyse du média (mock pour l'instant)
        analysis = {
            "detected_objects": ["guitar", "musician", "stage"],
            "suggested_tags": ["#jazz", "#livemusic", "#concert"],
            "confidence": 0.92,
            "dominant_colors": ["#1a1a2e", "#eebf3f"],
            "scene_type": "live_performance"
        }

        # Génération automatique de la caption basée sur l'analyse
        style = "jazz"
        caption = f"🎵 Belle session {style} ce soir !\n\n"
        caption += "L'énergie était incroyable, le public a adoré ! 🎸✨\n\n"

        hashtags = analysis["suggested_tags"] + ["#musician", "#liveperformance", "#musiclife"]
        caption += " ".join(hashtags)

        return {
            "filename": file.filename,
            "analysis": analysis,
            "caption": caption,
            "hashtags": hashtags
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/musicians")
async def get_musicians():
    """Retourne la liste des musiciens enregistrés"""
    musicians = [
        {"id": 1, "name": "John Coltrane", "instrument": "Saxophone", "style": "Jazz"},
        {"id": 2, "name": "Miles Davis", "instrument": "Trumpet", "style": "Jazz"},
        {"id": 3, "name": "Herbie Hancock", "instrument": "Piano", "style": "Jazz Fusion"},
        {"id": 4, "name": "Jaco Pastorius", "instrument": "Bass", "style": "Fusion"},
        {"id": 5, "name": "Tony Williams", "instrument": "Drums", "style": "Jazz"}
    ]
    return {"musicians": musicians, "count": len(musicians)}

@app.get("/venues")
async def get_venues():
    """Retourne la liste des lieux de concerts"""
    venues = [
        {"id": 1, "name": "Duc des Lombards", "city": "Paris", "type": "Jazz Club"},
        {"id": 2, "name": "New Morning", "city": "Paris", "type": "Concert Hall"},
        {"id": 3, "name": "Sunset-Sunside", "city": "Paris", "type": "Jazz Club"},
        {"id": 4, "name": "La Bellevilloise", "city": "Paris", "type": "Cultural Center"},
        {"id": 5, "name": "Olympia", "city": "Paris", "type": "Theater"}
    ]
    return {"venues": venues, "count": len(venues)}

@app.get("/analytics")
async def get_analytics():
    """Retourne les statistiques d'utilisation"""
    return {
        "total_captions_generated": 127,
        "total_media_analyzed": 89,
        "most_used_styles": [
            {"style": "jazz", "count": 45},
            {"style": "fusion", "count": 23},
            {"style": "afro", "count": 18},
            {"style": "world", "count": 12}
        ],
        "top_venues": [
            {"name": "Duc des Lombards", "count": 15},
            {"name": "New Morning", "count": 12}
        ],
        "avg_caption_length": 245,
        "total_hashtags_used": 456
    }