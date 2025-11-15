"""
Database initialization script
Creates tables and seeds initial data
"""
import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, SessionLocal
from app.core.security import get_password_hash
from app.models.models import Base, User, Musician, Venue

def init_db():
    """Initialize database with tables and seed data"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")

    db = SessionLocal()

    try:
        # Check if data already exists
        existing_musicians = db.query(Musician).count()
        if existing_musicians > 0:
            print("Database already contains data. Skipping seed.")
            return

        print("\nSeeding initial data...")

        # Seed Musicians
        musicians = [
            Musician(
                name="John Coltrane",
                instrument="Saxophone",
                style="Jazz",
                bio="Legendary jazz saxophonist and composer"
            ),
            Musician(
                name="Miles Davis",
                instrument="Trumpet",
                style="Jazz",
                bio="Iconic jazz trumpeter and bandleader"
            ),
            Musician(
                name="Herbie Hancock",
                instrument="Piano",
                style="Jazz Fusion",
                bio="Innovative jazz pianist and composer"
            ),
            Musician(
                name="Jaco Pastorius",
                instrument="Bass",
                style="Fusion",
                bio="Revolutionary electric bass player"
            ),
            Musician(
                name="Tony Williams",
                instrument="Drums",
                style="Jazz",
                bio="Virtuoso jazz drummer"
            ),
        ]

        for musician in musicians:
            db.add(musician)

        print(f"✓ Added {len(musicians)} musicians")

        # Seed Venues
        venues = [
            Venue(
                name="Duc des Lombards",
                city="Paris",
                type="Jazz Club",
                address="42 Rue des Lombards, 75001 Paris",
                description="Iconic Parisian jazz club in the heart of the city"
            ),
            Venue(
                name="New Morning",
                city="Paris",
                type="Concert Hall",
                address="7-9 Rue des Petites Écuries, 75010 Paris",
                description="Legendary concert hall for jazz and world music"
            ),
            Venue(
                name="Sunset-Sunside",
                city="Paris",
                type="Jazz Club",
                address="60 Rue des Lombards, 75001 Paris",
                description="Double jazz club featuring acoustic and electric jazz"
            ),
            Venue(
                name="La Bellevilloise",
                city="Paris",
                type="Cultural Center",
                address="19-21 Rue Boyer, 75020 Paris",
                description="Cultural center with concerts, exhibitions and events"
            ),
            Venue(
                name="Olympia",
                city="Paris",
                type="Theater",
                address="28 Boulevard des Capucines, 75009 Paris",
                description="Historic music hall and theater"
            ),
        ]

        for venue in venues:
            db.add(venue)

        print(f"✓ Added {len(venues)} venues")

        # Create a demo user
        demo_user = User(
            email="demo@captiongen.com",
            username="demo",
            full_name="Demo User",
            hashed_password=get_password_hash("demo123"),
            is_active=True
        )
        db.add(demo_user)
        print("✓ Created demo user (username: demo, password: demo123)")

        db.commit()
        print("\n✅ Database initialized successfully!")

    except Exception as e:
        print(f"\n❌ Error seeding database: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Caption Generator - Database Initialization")
    print("=" * 60)
    init_db()
