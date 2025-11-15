from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Musician schemas
class MusicianBase(BaseModel):
    name: str
    instrument: str
    style: str
    bio: Optional[str] = None
    image_url: Optional[str] = None

class MusicianCreate(MusicianBase):
    pass

class MusicianResponse(MusicianBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Venue schemas
class VenueBase(BaseModel):
    name: str
    city: str
    type: str
    address: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None

class VenueCreate(VenueBase):
    pass

class VenueResponse(VenueBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Caption schemas
class CaptionCreate(BaseModel):
    caption_text: str
    media_filename: Optional[str] = None
    detected_objects: Optional[List[str]] = None
    suggested_tags: Optional[List[str]] = None
    confidence: Optional[float] = None
    musicians: Optional[List[str]] = None
    venue: Optional[str] = None
    style: Optional[str] = None

class CaptionResponse(BaseModel):
    id: int
    user_id: int
    caption_text: str
    media_filename: Optional[str] = None
    style: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Analysis schemas
class AnalysisResponse(BaseModel):
    filename: str
    content_type: str
    analysis: dict

class CaptionGenerationRequest(BaseModel):
    musicians: Optional[List[str]] = None
    venue: Optional[str] = None
    style: Optional[str] = "jazz"
    language: Optional[str] = "fr"

class CaptionGenerationResponse(BaseModel):
    caption: str
    hashtags: List[str]
    language: str = "fr"

class AnalyzeAndGenerateResponse(BaseModel):
    filename: str
    analysis: dict
    caption: str
    hashtags: List[str]
