from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    captions = relationship("Caption", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")

class Musician(Base):
    __tablename__ = "musicians"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    instrument = Column(String, nullable=False)
    style = Column(String, nullable=False)
    bio = Column(Text)
    image_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Venue(Base):
    __tablename__ = "venues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False)
    type = Column(String, nullable=False)  # Jazz Club, Concert Hall, etc.
    address = Column(String)
    description = Column(Text)
    website = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Caption(Base):
    __tablename__ = "captions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    caption_text = Column(Text, nullable=False)
    media_filename = Column(String)
    media_url = Column(String)

    # Analysis data
    detected_objects = Column(Text)  # JSON string
    suggested_tags = Column(Text)  # JSON string
    confidence = Column(Float)

    # Context
    musicians = Column(Text)  # JSON string
    venue = Column(String)
    style = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="captions")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    caption_id = Column(Integer, ForeignKey("captions.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="favorites")
    caption = relationship("Caption")
