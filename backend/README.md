# SwiftCover Backend

AI-powered parametric micro-insurance API for Q-Commerce workers.

## Quick Start

### Using Docker (Recommended)

From the project root:

```bash
docker-compose up --build
```

This will:
1. Start PostgreSQL database
2. Build and start the FastAPI backend
3. Create all database tables
4. Train ML models
5. Seed demo data (10 workers, policies, 30 days activity, 4 past disruptions)

The API will be available at: http://localhost:8000

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export DATABASE_URL="postgresql://postgres:swiftcover123@localhost:5432/swiftcover"
export CORS_ORIGINS="http://localhost:5173"
```

3. Run the application:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## Seed Data

The application automatically seeds demo data on first startup:

- **10 Workers** across 5 cities (Hyderabad, Bangalore, Mumbai, Delhi, Chennai)
- **3 Plan Types**: Premium (workers 1-3), Standard (4-7), Basic (8-10)
- **30 Days Activity** per worker with realistic day-of-week patterns
- **4 Past Disruptions** with claims:
  - Heavy rain in Hyderabad (16 days ago)
  - Severe pollution in Delhi (10 days ago)
  - Flood in Bangalore (7 days ago)
  - Extreme heat in Mumbai (4 days ago)

## Key Features

- ✅ Lifespan context manager for startup/shutdown
- ✅ Automatic table creation
- ✅ ML model training (IsolationForest for fraud detection)
- ✅ Demo data seeding
- ✅ CORS configuration
- ✅ 6 API routers: workers, policies, disruptions, claims, activity, analytics
- ✅ Health check endpoint

## Architecture

```
backend/
├── main.py              # FastAPI app + lifespan + seed data
├── database/            # SQLAlchemy models & connection
├── routers/             # API endpoints (6 routers)
├── services/            # Business logic (premium, claims, fraud, payout)
├── ml/                  # ML models (risk, income, fraud)
└── schemas/             # Pydantic validation schemas
```
