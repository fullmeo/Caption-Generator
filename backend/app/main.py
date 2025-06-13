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
        "version": "1.0.0"
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