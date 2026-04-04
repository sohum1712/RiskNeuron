# Axio Backend

FastAPI backend for the Axio parametric insurance platform.

## Setup

```bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API Docs

Interactive docs available at `http://localhost:8000/docs` once running.

## Key Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/workers/register` | Register new worker + risk assessment |
| POST | `/api/workers/login` | Login by phone number |
| GET | `/api/workers/{id}/dashboard` | Full dashboard data |
| POST | `/api/policies/create` | Create policy |
| POST | `/api/disruptions/simulate` | Trigger disruption simulation |
| GET | `/api/analytics/overview` | Admin KPIs |
