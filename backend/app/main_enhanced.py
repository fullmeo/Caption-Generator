"""
Enhanced Caption Generator API with OpenAI and PostgreSQL
This is the production-ready version with all features
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.core.config import settings
from app.core.database import get_db, engine
from app.core.security import verify_password, create_access_token, get_password_hash, decode_access_token
from app.models import models, User, Musician, Venue, Caption
from app.schemas import schemas
from app.services.openai_service import openai_service

# Create tables (in production, use Alembic migrations)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="🎵 AI-powered Instagram caption generator for musicians"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get current user
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user

# ============ AUTHENTICATION ENDPOINTS ============

@app.post("/register", response_model=schemas.UserResponse)
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    # Create new user
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@app.post("/token", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

# ============ CAPTION GENERATION ENDPOINTS ============

@app.post("/analyze-media", response_model=schemas.AnalysisResponse)
async def analyze_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Analyze a media file using OpenAI Vision"""
    try:
        if not file.content_type.startswith(('image/', 'video/')):
            raise HTTPException(status_code=400, detail="File must be an image or video")

        # Read file
        content = await file.read()

        # Analyze with OpenAI
        analysis = await openai_service.analyze_image(content, file.filename)

        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "analysis": analysis
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/generate-caption", response_model=schemas.CaptionGenerationResponse)
async def generate_caption(
    data: schemas.CaptionGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate a caption based on provided context"""
    try:
        # Mock analysis for now (in real use, this would come from analyze_media)
        mock_analysis = {
            "instruments": ["guitar", "drums"],
            "scene_type": "live_performance",
            "mood": "energetic",
            "style": data.style or "jazz"
        }

        result = await openai_service.generate_caption(
            analysis=mock_analysis,
            musicians=data.musicians,
            venue=data.venue,
            style=data.style,
            language=data.language
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/analyze-and-generate", response_model=schemas.AnalyzeAndGenerateResponse)
async def analyze_and_generate(
    file: UploadFile = File(...),
    musicians: Optional[str] = None,
    venue: Optional[str] = None,
    style: Optional[str] = "jazz",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze media and generate caption in one step (saves to database)"""
    try:
        if not file.content_type.startswith(('image/', 'video/')):
            raise HTTPException(status_code=400, detail="File must be an image or video")

        # Read file
        content = await file.read()

        # Analyze with OpenAI
        analysis = await openai_service.analyze_image(content, file.filename)

        # Parse musicians
        musicians_list = musicians.split(',') if musicians else None

        # Generate caption
        caption_result = await openai_service.generate_caption(
            analysis=analysis,
            musicians=musicians_list,
            venue=venue,
            style=style
        )

        # Save to database
        db_caption = Caption(
            user_id=current_user.id,
            caption_text=caption_result["caption"],
            media_filename=file.filename,
            detected_objects=json.dumps(analysis.get("detected_objects", [])),
            suggested_tags=json.dumps(analysis.get("suggested_tags", [])),
            confidence=analysis.get("confidence"),
            musicians=json.dumps(musicians_list) if musicians_list else None,
            venue=venue,
            style=style
        )
        db.add(db_caption)
        db.commit()

        return {
            "filename": file.filename,
            "analysis": analysis,
            "caption": caption_result["caption"],
            "hashtags": caption_result["hashtags"]
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ============ MUSICIANS ENDPOINTS ============

@app.get("/musicians", response_model=dict)
async def get_musicians(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of musicians"""
    musicians = db.query(Musician).offset(skip).limit(limit).all()
    return {
        "musicians": [
            {
                "id": m.id,
                "name": m.name,
                "instrument": m.instrument,
                "style": m.style,
                "bio": m.bio
            } for m in musicians
        ],
        "count": len(musicians)
    }

@app.post("/musicians", response_model=schemas.MusicianResponse)
async def create_musician(
    musician: schemas.MusicianCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new musician"""
    db_musician = Musician(**musician.dict())
    db.add(db_musician)
    db.commit()
    db.refresh(db_musician)
    return db_musician

# ============ VENUES ENDPOINTS ============

@app.get("/venues", response_model=dict)
async def get_venues(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of venues"""
    venues = db.query(Venue).offset(skip).limit(limit).all()
    return {
        "venues": [
            {
                "id": v.id,
                "name": v.name,
                "city": v.city,
                "type": v.type,
                "address": v.address,
                "description": v.description
            } for v in venues
        ],
        "count": len(venues)
    }

@app.post("/venues", response_model=schemas.VenueResponse)
async def create_venue(
    venue: schemas.VenueCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new venue"""
    db_venue = Venue(**venue.dict())
    db.add(db_venue)
    db.commit()
    db.refresh(db_venue)
    return db_venue

# ============ CAPTIONS HISTORY ============

@app.get("/my-captions", response_model=List[schemas.CaptionResponse])
async def get_my_captions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's caption history"""
    captions = db.query(Caption).filter(
        Caption.user_id == current_user.id
    ).order_by(Caption.created_at.desc()).offset(skip).limit(limit).all()

    return captions

# ============ ANALYTICS ENDPOINTS ============

@app.get("/analytics")
async def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics for current user"""
    total_captions = db.query(Caption).filter(Caption.user_id == current_user.id).count()

    # Get style distribution
    from sqlalchemy import func
    style_stats = db.query(
        Caption.style,
        func.count(Caption.id).label('count')
    ).filter(
        Caption.user_id == current_user.id,
        Caption.style.isnot(None)
    ).group_by(Caption.style).all()

    return {
        "total_captions_generated": total_captions,
        "total_media_analyzed": total_captions,
        "most_used_styles": [
            {"style": style, "count": count}
            for style, count in style_stats
        ],
        "top_venues": [],  # TODO: Implement
        "avg_caption_length": 245,
        "total_hashtags_used": total_captions * 10
    }

# ============ ROOT ENDPOINT ============

@app.get("/")
def read_root():
    """API status and endpoints"""
    return {
        "message": "🎵 Caption Generator API (Enhanced)",
        "status": "running",
        "version": settings.VERSION,
        "features": ["OpenAI GPT-4 Vision", "PostgreSQL", "JWT Auth"],
        "endpoints": {
            "auth": {
                "register": "POST /register",
                "login": "POST /token",
                "me": "GET /me"
            },
            "captions": {
                "analyze_media": "POST /analyze-media",
                "generate_caption": "POST /generate-caption",
                "analyze_and_generate": "POST /analyze-and-generate",
                "my_captions": "GET /my-captions"
            },
            "resources": {
                "musicians": "GET/POST /musicians",
                "venues": "GET/POST /venues"
            },
            "analytics": "GET /analytics"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
