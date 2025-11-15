# Caption Generator - Setup Guide

## 🚀 Production-Ready Features

This application now includes:

- ✅ **OpenAI GPT-4 Vision** - Real image analysis
- ✅ **PostgreSQL Database** - Data persistence
- ✅ **JWT Authentication** - Secure user management
- ✅ **Caption History** - Track all generated captions
- ✅ **User Profiles** - Personal accounts with favorites
- ✅ **SQLAlchemy ORM** - Database models and relationships
- ✅ **Alembic Migrations** - Database version control

---

## 📋 Prerequisites

1. **Python 3.10+**
2. **PostgreSQL 14+**
3. **Node.js 18+**
4. **OpenAI API Key** (for GPT-4 Vision)

---

## ⚙️ Backend Setup

### 1. Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Create Database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE caption_generator;

# Create user (optional)
CREATE USER caption_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE caption_generator TO caption_user;

# Exit
\q
```

### 2. Configure Environment Variables

Create `.env` file in `backend/` directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/caption_generator

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production-use-openssl-rand-hex-32

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional
OPENAI_MODEL=gpt-4-vision-preview
```

### 3. Install Python Dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements
```

### 4. Initialize Database

```bash
# Initialize database with tables and seed data
python init_db.py
```

This will create:
- All database tables (users, musicians, venues, captions, favorites)
- 5 demo musicians (John Coltrane, Miles Davis, etc.)
- 5 demo venues (Duc des Lombards, New Morning, etc.)
- Demo user: `username: demo`, `password: demo123`

### 5. Run Backend (Enhanced Version)

**Option A: Simple Version (Mock Data)**
```bash
# Current version without DB/OpenAI
uvicorn app.main:app --reload
```

**Option B: Enhanced Version (PostgreSQL + OpenAI)**
```bash
# Production-ready version with all features
uvicorn app.main_enhanced:app --reload
```

The API will be available at:
- **Swagger UI:** http://127.0.0.1:8000/docs
- **API:** http://127.0.0.1:8000/

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: **http://localhost:5173**

---

## 🔑 Using the Enhanced API

### 1. Register a User

```bash
curl -X POST "http://127.0.0.1:8000/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "myusername",
    "password": "mypassword",
    "full_name": "My Name"
  }'
```

### 2. Login and Get Token

```bash
curl -X POST "http://127.0.0.1:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=myusername&password=mypassword"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Use Protected Endpoints

```bash
# Set your token
TOKEN="your-access-token-here"

# Analyze and generate caption
curl -X POST "http://127.0.0.1:8000/analyze-and-generate" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "style=jazz" \
  -F "venue=Duc des Lombards"

# Get your caption history
curl -X GET "http://127.0.0.1:8000/my-captions" \
  -H "Authorization: Bearer $TOKEN"

# Get analytics
curl -X GET "http://127.0.0.1:8000/analytics" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Database Migrations with Alembic

```bash
cd backend

# Generate a migration (after modifying models)
alembic revision --autogenerate -m "Add new field"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current revision
alembic current

# Show migration history
alembic history
```

---

## 🔄 Switching Between Versions

### Current Version (Simple - Mock Data)
```bash
# File: backend/app/main.py
uvicorn app.main:app --reload
```

- ✅ No database required
- ✅ No OpenAI API key needed
- ✅ Quick testing and development
- ❌ No data persistence
- ❌ No authentication
- ❌ Mock image analysis

### Enhanced Version (Production)
```bash
# File: backend/app/main_enhanced.py
uvicorn app.main_enhanced:app --reload
```

- ✅ PostgreSQL database
- ✅ OpenAI GPT-4 Vision
- ✅ JWT authentication
- ✅ Caption history
- ✅ User profiles
- ✅ Real image analysis

---

## 🧪 Testing

### Test with Demo User

```bash
# Login with demo user
curl -X POST "http://127.0.0.1:8000/token" \
  -d "username=demo&password=demo123"

# Use the returned token for authenticated requests
```

### Test Image Analysis

1. Upload an image of musicians playing
2. The AI will detect:
   - Instruments (guitar, drums, piano, etc.)
   - Number of musicians
   - Scene type (studio, live, rehearsal)
   - Musical style
   - Mood/atmosphere
3. Caption is automatically generated based on analysis

---

## 📝 API Endpoints Reference

### Public Endpoints
- `POST /register` - Register new user
- `POST /token` - Login and get access token

### Protected Endpoints (Require Authentication)
- `GET /me` - Get current user info
- `POST /analyze-media` - Analyze media with AI
- `POST /generate-caption` - Generate caption
- `POST /analyze-and-generate` - Analyze + generate (saves to DB)
- `GET /my-captions` - Get caption history
- `GET /musicians` - List musicians
- `POST /musicians` - Add musician
- `GET /venues` - List venues
- `POST /venues` - Add venue
- `GET /analytics` - User analytics

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d caption_generator -c "SELECT 1;"
```

### OpenAI API Issues

- Verify API key in `.env` file
- Check OpenAI account has credits
- Ensure `gpt-4-vision-preview` model is accessible

### Import Errors

```bash
# Make sure you're in the backend directory
cd backend

# And in the virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows
```

---

## 🚀 Next Steps

1. **Deploy to Production**
   - Use environment variables for secrets
   - Set up proper PostgreSQL instance
   - Configure CORS for production domains
   - Add rate limiting
   - Set up logging and monitoring

2. **Add More Features**
   - Image upload to cloud storage (AWS S3, Cloudinary)
   - Email verification
   - Password reset
   - Social media sharing
   - Template customization
   - Analytics dashboard

3. **Optimize Performance**
   - Cache frequently accessed data (Redis)
   - Optimize database queries
   - Add pagination to all list endpoints
   - Compress images before analysis
   - Implement background jobs (Celery)

---

## 📚 Documentation

- **FastAPI Docs:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc
- **OpenAPI JSON:** http://127.0.0.1:8000/openapi.json

---

## 🆘 Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review error messages in console
3. Check database logs
4. Verify environment variables

---

**Happy caption generating! 🎵✨**
