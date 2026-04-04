# Axio — AI-Powered Parametric Insurance for Q-Commerce Gig Workers

Axio is a full-stack parametric micro-insurance platform for India's Q-Commerce delivery workers (Zepto, Blinkit, Swiggy Instamart). It automatically detects income-disrupting events — heavy rain, extreme heat, severe pollution, traffic shutdowns, platform outages — and triggers instant UPI payouts with zero paperwork and zero manual claims.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion |
| Backend | FastAPI (Python 3.12), SQLAlchemy 2, SQLite |
| ML | Scikit-learn — Isolation Forest (fraud detection), custom risk scoring |
| State | Zustand 4 + TanStack React Query 5 |
| Charts | Recharts 2 |
| HTTP | Axios |
| Routing | React Router v6 |

---

## Project Structure

```
axio/
├── backend/
│   ├── database/
│   │   ├── connection.py      # SQLAlchemy engine + session factory
│   │   └── models.py          # ORM models: Worker, Policy, Claim, DisruptionEvent, etc.
│   ├── ml/
│   │   ├── risk_model.py      # Per-worker risk score + zone risk lookup
│   │   ├── fraud_model.py     # Isolation Forest fraud detection
│   │   ├── income_model.py    # Expected earnings estimation
│   │   └── train_models.py    # Model training + joblib serialization
│   ├── routers/
│   │   ├── workers.py         # Registration, login, dashboard
│   │   ├── policies.py        # Policy creation, renewal, upgrade
│   │   ├── claims.py          # Claim listing, review, payout
│   │   ├── disruptions.py     # Disruption simulation + active events
│   │   ├── analytics.py       # Admin KPIs + weekly trends
│   │   └── activity.py        # Worker daily activity logging
│   ├── schemas/               # Pydantic request/response models
│   ├── services/
│   │   ├── claim_engine.py    # Parametric claim evaluation logic
│   │   ├── fraud_detector.py  # Fraud scoring pipeline
│   │   ├── payout_service.py  # UPI payout simulation
│   │   └── premium_engine.py  # Dynamic premium calculation
│   ├── main.py                # FastAPI app + startup seeding
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.ts      # Axios API client (all endpoints)
    │   ├── assets/images/     # Bg07.jpeg, Landing page.jpeg
    │   ├── components/
    │   │   ├── ui/            # Button, Badge, Card, Skeleton
    │   │   ├── charts/        # EarningsChart, RiskGauge
    │   │   ├── AppBackground  # Shared Bg07.jpeg background
    │   │   ├── BrandLogo      # "Axio" in Poppins SemiBold Italic
    │   │   ├── PageShell      # Shared floating navbar layout
    │   │   ├── DisruptionAlert
    │   │   ├── WeeklyPremiumCard
    │   │   └── PayoutNotification
    │   ├── pages/
    │   │   ├── Landing.tsx    # Public landing page
    │   │   ├── Login.tsx      # Phone number login
    │   │   ├── Onboarding.tsx # 4-step worker registration wizard
    │   │   ├── WorkerDashboard.tsx
    │   │   ├── PolicyPage.tsx
    │   │   ├── ClaimsPage.tsx
    │   │   ├── ProfilePage.tsx
    │   │   └── AdminDashboard.tsx
    │   ├── store/
    │   │   └── useStore.ts    # Zustand store (persists workerId)
    │   └── types/
    │       └── index.ts       # Full TypeScript type definitions
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

On first run the backend will:
1. Create all database tables
2. Train and save the ML models (`ml/models/`)
3. Seed 10 demo workers with policies, 30 days of activity, and past claims

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. Backend API at `http://localhost:8000`.  
Interactive API docs at `http://localhost:8000/docs`.

---

## Demo Accounts

Use any of these phone numbers on the Login page:

| Name | Phone | City | Plan |
|---|---|---|---|
| Rahul Kumar | 9876543210 | Hyderabad | Premium |
| Priya Sharma | 9876543211 | Hyderabad | Premium |
| Mohammed Ali | 9876543212 | Bangalore | Premium |
| Suresh Reddy | 9876543213 | Hyderabad | Standard |
| Anita Devi | 9876543214 | Mumbai | Standard |
| Kiran Patel | 9876543215 | Bangalore | Standard |
| Raju Singh | 9876543216 | Delhi | Standard |
| Deepa Nair | 9876543217 | Mumbai | Basic |
| Venkat Rao | 9876543218 | Hyderabad | Basic |
| Fatima Begum | 9876543219 | Bangalore | Basic |

Admin console: `http://localhost:5173/admin`

---

## Coverage Plans

| Plan | Weekly Premium | Weekly Max Payout | Covered Disruptions |
|---|---|---|---|
| Basic | ₹49 | ₹1,500 | Heavy rain, floods, severe pollution (AQI 250+) |
| Standard | ₹89 | ₹2,500 | + Extreme heat (43°C+), traffic shutdown |
| Premium | ₹149 | ₹4,000 | + Dark store closure, curfews, platform outages |

Premiums are dynamically adjusted per worker based on city, zone flood/heat/pollution risk, experience, and platform.

---

## Parametric Triggers

Claims are evaluated automatically — no forms, no waiting.

| Disruption | Threshold |
|---|---|
| Heavy Rain | Rainfall ≥ 60mm |
| Flood | Rainfall ≥ 100mm |
| Extreme Heat | Temperature ≥ 42°C |
| Severe Pollution | AQI ≥ 180 |
| Traffic Shutdown | Traffic index ≥ 7.5/10 |
| Dark Store Closure | Store marked inactive |
| Curfew / Strike | Zone-level order drop > 70% |
| Platform Outage | App API unresponsive > 30 min |

---

## ML Models

**Risk Model** — scores each worker 0–1 based on city disruption history, zone-level flood/heat/pollution risk, delivery platform, shift type, and experience. Determines risk tier (low / medium / high) and adjusts premium.

**Fraud Detector** — Isolation Forest trained on synthetic claim patterns. Flags anomalies like new-account claims, loss exceeding 2.5× historical average, and implausible order drops.

**Income Model** — estimates expected daily earnings using historical activity with day-of-week multipliers, used as the baseline for income loss calculation.

---

## Key API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/workers/register` | Register worker + get risk profile + plan options |
| POST | `/api/workers/login?phone=` | Login by phone number |
| GET | `/api/workers/{id}/dashboard` | Full dashboard data (policy, disruptions, chart, claims) |
| POST | `/api/policies/create` | Activate a coverage plan |
| POST | `/api/policies/{id}/renew` | Renew policy for another 7 days |
| GET | `/api/claims/worker/{id}` | Worker's claim history |
| POST | `/api/disruptions/simulate` | Trigger a disruption event (admin demo) |
| GET | `/api/analytics/overview` | Admin KPIs + weekly trends + city stats |

---

## Reset Database

```bash
# Windows
.\reset-database.ps1

# Manual — delete the SQLite file and restart backend
cd backend
del axio.db        # Windows
rm axio.db         # macOS / Linux
```

---

## Docker

```bash
docker-compose up --build
```

> Note: The `docker-compose.yml` references PostgreSQL. For local development without Docker, SQLite is used automatically.
