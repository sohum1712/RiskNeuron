# 🛡️ Axio — AI-Powered Parametric Income Insurance for Q-Commerce & Gig Workers

> **Guidewire DEVTrails 2026 | Phase 2 Submission — Scale & Protect**  
> *Protecting the backbone of India's delivery economy — one week at a time.*

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Phase 2 — What We Built](#-phase-2--what-we-built)
3. [Chosen Persona & Scenarios](#-chosen-persona-delivery-partner)
4. [Weekly Premium Model](#-weekly-premium-model)
5. [Parametric Triggers](#-parametric-triggers-core-innovation)
6. [Tech Stack](#-tech-stack)
7. [Repository Structure](#-repository-structure)
8. [Database Schema](#-database-schema)
9. [API Reference](#-api-reference)
10. [AI & ML Engine](#-ai--ml-engine)
11. [Fraud Detection System](#-fraud-detection-system--3-layer-defence)
12. [Claim Processing Algorithm](#-claim-processing-algorithm-10-steps)
13. [Insurance Plan Config](#-insurance-plan-configuration)
14. [Getting Started](#-getting-started)
15. [Development Roadmap](#-6-week-development-roadmap)
16. [Innovation Differentiators](#-innovation-differentiators)

---

## 🚀 Project Overview

**Axio** is an AI-enabled parametric income insurance platform built exclusively for **Food Delivery & Q-Commerce Partners** operating on platforms like Zepto, Blinkit, Swiggy Instamart, and Zomato.

When extreme weather, pollution spikes, or social disruptions prevent gig workers from completing deliveries, Axio:

1. **Automatically detects** the disruption event (real or simulated)
2. **Validates the claim** through a 10-step AI algorithm
3. **Scores the claim for fraud** using 8 independent rule-based signals
4. **Processes an instant UPI payout** — zero paperwork, zero waiting, zero manual intervention

> **We protect lost income only.** No health, no accidents, no vehicle repairs — purely the earnings a worker loses when the world outside makes it impossible to work.

The platform is a full-stack system: a **FastAPI Python backend** with a **PostgreSQL database**, three independent **ML models**, six **REST API routers**, and a **React 18 + TypeScript frontend** with two distinct dashboards (Worker & Admin).

---

## ✅ Phase 2 — What We Built

**Phase 2 Theme: "Protect Your Worker."** This phase moved Axio from a documented idea to a working, demonstrable full-stack product.

| Feature | Status | Implementation Details |
|---|---|---|
| Worker onboarding flow | ✅ Done | `POST /api/workers/register` — Phone ID + Platform verification (Zepto/Swiggy/Blinkit) |
| Weekly policy creation | ✅ Done | `POST /api/policies/` — Dynamic AI risk-based premium per worker |
| Insurance Policy Management | ✅ Done | 7-day lifecycle: `active` → `expired` → renewal states |
| AI Claim Algorithm | ✅ Done | `claim_engine.py` — Full 10-step automated claim processing live |
| Parametric Trigger Engine | ✅ Done | `premium_engine.py` — 5 core triggers wired to real/mock API signals |
| Fraud scoring pipeline | ✅ Done | `fraud_model.py` — 8 rule-based signals + IsolationForest (scikit-learn) |
| Mock UPI payout | ✅ Done | `payout_service.py` — Simulated Razorpay+UPI with 96% success rate |
| Worker dashboard | ✅ Done | `WorkerDashboard.tsx` — 14-day earnings chart, active policy, claim history |
| Admin dashboard | ✅ Done | `AdminDashboard.tsx` — Claims queue, disruption simulator, analytics overview |
| Demo data seeding | ✅ Done | 10 workers × 3 plans, 30-day activity, 4 disruption events, real claims |

---

## 👤 Chosen Persona: Delivery Partner

### Why This Persona?

India has **13+ million food delivery workers**. They work 8–12 hour shifts, earn ₹600–₹1,200/day, and operate on tight **weekly** cash cycles mapped to platform payouts (Zomato pays every Monday). A single rainy day or pollution alert can erase 30–50% of weekly income with zero recourse from any existing insurance product.

### Persona Scenarios

**Scenario 1 — Heavy Rainfall (Mumbai, July)**
> Ramesh, a Zepto delivery partner in Andheri, earns ₹900/day. An IMD red alert triggers at 6 AM. Orders drop 80%. Ramesh can't ride safely. Axio detects rainfall > 60mm/hr (Basic plan threshold) or > 40mm/hr (Premium) via weather API, cross-validates with GPS signals, auto-approves the claim, and credits ₹630 (70% of daily wage, capped at plan's `daily_coverage_limit`) to his UPI within minutes.

**Scenario 2 — Severe AQI Spike (Delhi, November)**
> Priya delivers for Swiggy in Dwarka. AQI exceeds 400 (Severe+). The Delhi government issues an advisory. Axio detects the AQI breach (threshold: 250 Basic / 200 Standard / 180 Premium) via CPCB signals, validates Priya's active policy, runs an 8-point fraud check, and triggers a proportional payout for lost peak-hour earnings.

**Scenario 3 — Unplanned Curfew / Local Strike (Bengaluru)**
> Ahmed's delivery zone in Shivajinagar is under a sudden bandh. He cannot access pickup points. Axio's disruption simulator fires a `local_strike` event (covered under **Premium plan only**). All affected policyholders in the city receive automated claim evaluation within seconds.

---

## 📅 Weekly Premium Model

### Why Weekly?

Gig workers receive platform payouts weekly (e.g., Zomato pays every Monday). Monthly premiums create affordability friction. A weekly model means they pay from **this week's earnings** for **next week's protection**. This is coded directly into the `Policy` model — `end_date = start_date + 7 days` (hard-enforced in `policies.py`).

### Premium Calculation Formula

The actual formula executed in `services/premium_engine.py`:

```
Adjusted Premium = Base_Weekly_Rate × Risk_Multiplier × City_Multiplier × Zone_Multiplier

Base_Weekly_Rate:
  basic    = ₹49
  standard = ₹89
  premium  = ₹149

Risk_Multiplier  = f(worker.risk_score):
  score < 0.30   → 0.82  (−18% discount)
  score < 0.50   → 0.93  (−7% discount)
  score < 0.70   → 1.00  (base rate)
  score < 0.85   → 1.15  (+15% loading)
  score >= 0.85  → 1.28  (+28% loading)

City_Multiplier:
  Mumbai     = 1.20
  Delhi      = 1.15
  Chennai    = 1.12
  Hyderabad  = 1.08
  Pune       = 1.00
  Bangalore  = 0.95

Zone_Multiplier:
  High-risk flood zone (e.g., LB Nagar, Kurla, Bellandur) = 1.12
  All other zones                                          = 1.00
```

### Illustrative Premium Table (Actual Values from Code)

| Plan | Base Rate | Low Risk Worker (score < 0.30) | Medium Risk (score 0.50–0.70) | High Risk (score ≥ 0.85) |
|---|---|---|---|---|
| **Basic** | ₹49 | ₹40 (×0.82) | ₹49 (×1.00) | ₹63 (×1.28) |
| **Standard** | ₹89 | ₹73 (×0.82) | ₹89 (×1.00) | ₹114 (×1.28) |
| **Premium** | ₹149 | ₹122 (×0.82) | ₹149 (×1.00) | ₹191 (×1.28) |

> City and zone multipliers stack on top. E.g., a Premium worker in Mumbai (1.20) in the Kurla flood zone (1.12) pays: ₹149 × risk_mult × 1.20 × 1.12 = up to ~₹257/week.

### Coverage Limits (Hard-coded in `PLAN_CONFIG`)

| Plan | Weekly Premium (Base) | Weekly Coverage Limit | Daily Coverage Limit | Min Orders Threshold |
|---|---|---|---|---|
| **Basic** | ₹49 | ₹1,500 | ₹250 | 5 orders/day |
| **Standard** | ₹89 | ₹2,500 | ₹400 | 5 orders/day |
| **Premium** | ₹149 | ₹4,000 | ₹650 | 5 orders/day |

---

## ⚡ Parametric Triggers (Core Innovation)

Triggers are stored as a JSON object per policy in the `policies.parametric_triggers` column. Each plan has different sensitivity thresholds.

### Trigger Thresholds by Plan

| Trigger | Basic | Standard | Premium | Data Source |
|---|---|---|---|---|
| **Extreme Rainfall** | > 60 mm/hr | > 50 mm/hr | > 40 mm/hr | IMD / OpenWeatherMap |
| **Severe AQI** | > 250 | > 200 | > 180 | CPCB API / IQAir |
| **Traffic Shutdown Index** | > 8.0 | > 7.0 | > 6.5 | Traffic APIs |
| **Extreme Heat** | *(not covered)* | > 43°C | > 42°C | IMD Heat Wave Advisory |
| **App Outage** | *(not covered)* | *(not covered)* | ✅ Covered | Uptime Monitoring |

### Covered Disruption Types by Plan

Stored as a JSON array in each `Policy` record (`policies.covered_disruptions`):

| Disruption Type | Basic | Standard | Premium |
|---|---|---|---|
| `heavy_rain` | ✅ | ✅ | ✅ |
| `flood` | ✅ | ✅ | ✅ |
| `severe_pollution` | ✅ | ✅ | ✅ |
| `traffic_shutdown` | ❌ | ✅ | ✅ |
| `extreme_heat` | ❌ | ✅ | ✅ |
| `dark_store_closure` | ❌ | ❌ | ✅ |
| `curfew` | ❌ | ❌ | ✅ |
| `local_strike` | ❌ | ❌ | ✅ |
| `app_outage` | ❌ | ❌ | ✅ |

> **Why Platform Outage (`app_outage`)?** App outages directly cause income loss but are invisible in every existing insurance product in India. This is our key differentiator — **no competitor covers this.** The Premium plan is the only tier to include it.

---

## 🏗️ Tech Stack

### Backend

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | **FastAPI** | 0.104.1 | Async-native Python web framework |
| Server | **Uvicorn** | 0.24.0 | ASGI server with standard extras |
| Database ORM | **SQLAlchemy** | 2.0.23 | Type-safe async-compatible ORM |
| DB Driver | **psycopg2-binary** | 2.9.9 | PostgreSQL adapter |
| Validation | **Pydantic** | v2.5.0 | Request/response schema validation |
| ML Core | **scikit-learn** | 1.3.2 | IsolationForest for fraud detection |
| ML Data | **pandas** | 2.1.4 | Data manipulation for model training |
| ML Math | **numpy** | 1.26.2 | Numerical operations |
| Model I/O | **joblib** | 1.3.2 | Serialize/deserialize trained ML models |
| HTTP Client | **httpx** | 0.25.2 | Async HTTP (future external API calls) |
| Migrations | **Alembic** | 1.12.1 | DB schema version control |

### Frontend

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | **React** | 18.2.0 | Component-based UI |
| Language | **TypeScript** | 5.3.2 | Type-safe JavaScript |
| Build Tool | **Vite** | 5.0.8 | Fast HMR dev server |
| Styling | **Tailwind CSS** | 3.3.6 | Utility-first design system |
| Animations | **Framer Motion** | 10.16.16 | Smooth transitions & micro-animations |
| Icons | **Lucide React** | 0.298.0 | Clean, scalable SVG icons |
| State | **Zustand** | 4.4.7 | Lightweight global state with persistence |
| Data Fetching | **@tanstack/react-query** | 5.13.0 | Server state, caching, revalidation |
| Charts | **Recharts** | 2.10.3 | Earnings visualization charts |
| HTTP | **Axios** | 1.6.2 | API communication layer |
| Date Utils | **date-fns** | 3.0.6 | Date formatting and arithmetic |
| Toasts | **react-hot-toast** | 2.4.1 | Non-blocking notifications |
| Routing | **react-router-dom** | 6.20.0 | Client-side navigation |

### Infrastructure

| Component | Technology | Details |
|---|---|---|
| Database | **PostgreSQL 15** (Alpine) | Containerized via Docker Compose |
| Backend Container | **Custom Docker Image** | `./backend/Dockerfile`, port 8000 |
| Frontend Container | **Custom Docker Image** | `./frontend/Dockerfile`, port 5173 |
| Orchestration | **Docker Compose v3.9** | All 3 services + health-check on Postgres |

---

## 🗂️ Repository Structure

```
axio/
├── backend/
│   ├── main.py                    # FastAPI app, lifespan mgmt, CORS, router registration,
│   │                              # + seed_demo_data() (10 workers, 4 disruptions, claims)
│   ├── requirements.txt           # 14 pinned Python dependencies
│   ├── Dockerfile                 # Production container
│   ├── .env / .env.example        # DATABASE_URL, CORS_ORIGINS config
│   │
│   ├── database/
│   │   ├── connection.py          # SQLAlchemy engine, SessionLocal, Base, create_tables()
│   │   └── models.py              # 6 ORM models + 8 Python Enum classes
│   │
│   ├── routers/
│   │   ├── workers.py             # /api/workers  — register, login, dashboard, list
│   │   ├── policies.py            # /api/policies — create, renew, plan options
│   │   ├── claims.py              # /api/claims   — list, filter, payout, review
│   │   ├── disruptions.py         # /api/disruptions — simulate, active, history
│   │   ├── activity.py            # /api/activity — daily activity log
│   │   └── analytics.py           # /api/analytics — admin overview KPIs, 8-week trend
│   │
│   ├── schemas/
│   │   ├── worker.py              # WorkerCreate, WorkerResponse, RiskProfile, PlanOption
│   │   ├── policy.py              # PolicyCreate, PolicyResponse
│   │   ├── claim.py               # ClaimResponse, ClaimSummary
│   │   └── disruption.py          # DisruptionSimulateRequest, DisruptionResponse, SimulationResult
│   │
│   ├── services/
│   │   ├── premium_engine.py      # PLAN_CONFIG, COVERED_DISRUPTIONS, PARAMETRIC_TRIGGERS,
│   │   │                          # CITY_MULTIPLIER, HIGH_RISK_ZONES, compute_plans()
│   │   ├── claim_engine.py        # evaluate_claim() — full 10-step algorithm
│   │   ├── payout_service.py      # process_payout() — Razorpay mock, 96% success
│   │   └── fraud_detector.py      # FraudDetector import proxy
│   │
│   └── ml/
│       ├── risk_model.py          # RiskModel — 6-factor weighted risk scoring
│       ├── fraud_model.py         # FraudDetector — 8 rule-based fraud checks
│       ├── income_model.py        # predict_expected_earnings(), IMPACT_FACTORS (9 types × 4 severities)
│       ├── train_models.py        # IsolationForest training, 800 normal + 200 fraud samples
│       └── models/
│           └── fraud_isolation.joblib  # Serialized trained model (auto-generated on startup)
│
├── frontend/
│   ├── index.html                 # Vite entry point
│   ├── vite.config.ts             # Vite + React plugin config
│   ├── tailwind.config.js         # Tailwind theme + custom colors
│   │
│   └── src/
│       ├── App.tsx                # React Router routes
│       ├── main.tsx               # ReactDOM entry point
│       ├── index.css              # Global styles
│       │
│       ├── api/                   # Axios API client wrappers
│       ├── components/            # Reusable UI (charts, alerts, payout modals)
│       ├── store/                 # Zustand store (persists worker identity)
│       ├── types/                 # TypeScript domain type definitions
│       │
│       └── pages/
│           ├── Landing.tsx        # Marketing landing page
│           ├── Login.tsx          # Phone number login
│           ├── Onboarding.tsx     # Worker registration + plan selection wizard
│           ├── WorkerDashboard.tsx # 14-day earnings chart, policy status, claims
│           ├── AdminDashboard.tsx  # Claims queue, disruption simulator, analytics
│           ├── PolicyPage.tsx     # Policy details + renewal
│           ├── ClaimsPage.tsx     # Claim history + fraud flags
│           └── ProfilePage.tsx    # Worker profile + risk breakdown
│
├── docker-compose.yml             # Postgres 15 + Backend + Frontend
├── setup-backend.ps1              # Windows: venv + pip install setup
├── setup-frontend.ps1             # Windows: npm install setup
├── start-backend.ps1              # Windows: activate venv + uvicorn
├── start-frontend.ps1             # Windows: npm run dev
└── reset-database.ps1             # Windows: drop + recreate Postgres DB
```

---

## 🗃️ Database Schema

All models live in `backend/database/models.py`. The database name is `swiftcover` (set in Docker Compose and `.env`).

### Enum Types

```python
PlatformEnum  : zepto | blinkit | swiggy_instamart | multiple
RiskTierEnum  : low | medium | high
PlanEnum      : basic | standard | premium
PolicyStatusEnum : active | expired | cancelled
ClaimStatusEnum  : pending | approved | rejected | paid | flagged_fraud
DisruptionTypeEnum : heavy_rain | flood | extreme_heat | severe_pollution |
                     traffic_shutdown | curfew | local_strike | dark_store_closure | app_outage
SeverityEnum  : mild | moderate | severe | extreme
ShiftEnum     : morning | evening | night | flexible
```

### Core Tables

#### `workers`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | Auto-increment |
| `name` | String(100) | Required |
| `phone` | String(15) | Unique, indexed |
| `city` | String(50) | One of 6 supported cities |
| `zone_name` | String(100) | Used for zone risk multiplier |
| `dark_store_name` | String(100) | Worker's assigned dark store |
| `platform` | Enum(PlatformEnum) | Required |
| `avg_daily_orders` | Float | Default 25 |
| `avg_daily_earnings` | Float | Computed: avg_daily_orders × ₹18 |
| `shift_type` | Enum(ShiftEnum) | morning/evening/night/flexible |
| `experience_months` | Integer | Default 4 |
| `risk_score` | Float | 0.0–1.0, computed by RiskModel |
| `risk_tier` | Enum(RiskTierEnum) | low/medium/high |
| `zone_flood_risk` | Float | 0.3 base, 0.75 for high-risk zones |
| `zone_heat_risk` | Float | City-based lookup |
| `zone_pollution_risk` | Float | City-based lookup |
| `upi_id` | String(100) | e.g. `rahulkumar@upi` |
| `created_at` | DateTime | UTC, auto |
| `is_active` | Boolean | Default True |

#### `policies`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | |
| `worker_id` | FK → workers | |
| `plan_type` | Enum(PlanEnum) | basic/standard/premium |
| `weekly_premium` | Float | AI-adjusted final premium |
| `weekly_coverage_limit` | Float | ₹1500/2500/4000 |
| `daily_coverage_limit` | Float | ₹250/400/650 |
| `min_orders_threshold` | Integer | 5 (all plans) |
| `parametric_triggers` | JSON | `{rainfall_mm: N, aqi: N, ...}` |
| `covered_disruptions` | JSON | `["heavy_rain", "flood", ...]` |
| `status` | Enum(PolicyStatusEnum) | active/expired/cancelled |
| `start_date` | Date | Policy start |
| `end_date` | Date | Always `start_date + 7 days` |
| `auto_renew` | Boolean | Default False |

#### `claims`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | |
| `worker_id` | FK → workers | |
| `policy_id` | FK → policies | |
| `disruption_event_id` | FK → disruption_events | |
| `expected_orders` | Integer | From day-of-week model |
| `actual_orders` | Integer | From WorkerActivity or estimated |
| `expected_earnings` | Float | Predicted by `income_model.py` |
| `actual_earnings` | Float | From WorkerActivity |
| `income_loss` | Float | `max(0, expected - actual)` |
| `disruption_impact_factor` | Float | 0.0–1.0 from IMPACT_FACTORS table |
| `payout_amount` | Float | `min(income_loss, daily_coverage_limit)` |
| `status` | Enum(ClaimStatusEnum) | pending/approved/rejected/paid/flagged_fraud |
| `fraud_score` | Float | 0.0–1.0 from FraudDetector |
| `fraud_flags` | JSON | List of triggered rule strings |
| `auto_processed` | Boolean | True = system; False = admin override |
| `rejection_reason` | String | Why rejected/flagged |
| `processed_at` | DateTime | UTC auto |
| `paid_at` | DateTime | Set on payment success |
| `payment_reference` | String | e.g. `RZP_ABC123XYZ456` |
| `upi_transaction_id` | String | e.g. `UPI20260404143022` |

#### `disruption_events`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | |
| `city` | String | Affected city |
| `zone_name` | String | Optional zone filter |
| `disruption_type` | Enum(DisruptionTypeEnum) | |
| `severity` | Enum(SeverityEnum) | mild/moderate/severe/extreme |
| `rainfall_mm` | Float | For rain/flood events |
| `aqi` | Float | For pollution events |
| `temperature_celsius` | Float | For heat events |
| `traffic_index` | Float | 0–10 scale |
| `started_at` | DateTime | Event start (UTC) |
| `ended_at` | DateTime | Event end |
| `duration_hours` | Float | |
| `is_active` | Boolean | True = live event |
| `source` | String | `"simulated"` or `"historical"` |
| `affected_workers_count` | Integer | Updated post-simulation |
| `total_claims_triggered` | Integer | |
| `total_payout_amount` | Float | Total ₹ paid out |

#### `worker_activity`
One record per worker per day. Unique constraint: `(worker_id, date)`.

| Column | Type | Notes |
|---|---|---|
| `date` | Date | Activity date |
| `orders_completed` | Integer | |
| `working_hours` | Float | |
| `earnings` | Float | |
| `online_hours` | Float | Always ≥ working_hours |
| `peak_hour_orders` | Integer | 30–50% of daily orders |
| `is_disruption_day` | Boolean | |
| `disruption_event_id` | FK | Linked if disruption day |

#### `premium_payments`
| Column | Type | Notes |
|---|---|---|
| `amount` | Float | Actual premium paid |
| `week_start` / `week_end` | Date | Coverage week |
| `status` | String | `"paid"` |
| `payment_reference` | String | Razorpay ref |
| `paid_at` | DateTime | |

---

## 🌐 API Reference

Base URL: `http://localhost:8000`  
Interactive Docs: `http://localhost:8000/docs` (Swagger UI auto-generated by FastAPI)

### Workers — `/api/workers`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/workers/register` | Register new worker — runs RiskModel, returns risk profile + 3 plan options |
| `POST` | `/api/workers/login` | Login by phone number |
| `GET` | `/api/workers/` | List all active workers (admin) |
| `GET` | `/api/workers/{id}` | Get worker by ID |
| `GET` | `/api/workers/{id}/dashboard` | Full dashboard: worker + policy + disruptions + 14d chart + claims |

**Registration payload example:**
```json
{
  "name": "Rahul Kumar",
  "phone": "9876543210",
  "city": "Mumbai",
  "zone_name": "Kurla",
  "dark_store_name": "Zepto Dark Store - Kurla",
  "platform": "zepto",
  "avg_daily_orders": 28,
  "shift_type": "morning",
  "experience_months": 18,
  "upi_id": "rahulkumar@upi"
}
```

**Registration response includes:**
- `worker` object with computed `risk_score`, `risk_tier`, zone risk values
- `risk_profile` with `risk_factors` list (human-readable explanations)
- `recommended_plans` — all 3 plans with AI-adjusted premiums, coverage limits, `recommended: true` flag

### Policies — `/api/policies`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/policies/` | Create a new policy (plan selection) |
| `GET` | `/api/policies/worker/{id}` | Get all policies for a worker |
| `POST` | `/api/policies/{id}/renew` | Renew an expiring/expired policy |
| `GET` | `/api/policies/plans/{worker_id}` | Get plan options for a worker (recalculates premiums) |

### Claims — `/api/claims`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/claims/` | List claims with optional `?status=` and `?worker_id=` filters (max 200) |
| `GET` | `/api/claims/worker/{id}` | All claims for a specific worker |
| `POST` | `/api/claims/{id}/payout` | Trigger/retry payout for an approved claim |
| `POST` | `/api/claims/{id}/review?action=approve\|reject` | Admin: manually override a `flagged_fraud` claim |

### Disruptions — `/api/disruptions`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/disruptions/simulate` | **Core Demo Endpoint** — triggers full claim pipeline |
| `GET` | `/api/disruptions/active` | All active disruptions, optional `?city=` filter |
| `GET` | `/api/disruptions/history` | Historical disruptions (default last 20) |

**Simulation payload example:**
```json
{
  "city": "Hyderabad",
  "disruption_type": "heavy_rain",
  "severity": "severe",
  "rainfall_mm": 85.0,
  "duration_hours": 6,
  "zone_name": null
}
```

**Simulation response includes:**
- Full `disruption_event` object
- `affected_workers`, `policies_evaluated` counts
- `claims_approved`, `claims_rejected`, `claims_fraud_flagged` breakdown
- `total_payout` (₹ total)
- `processing_time_seconds`
- `claim_details` — per-worker summary with `payout`, `status`, `fraud_flags`, `upi_transaction_id`

### Analytics — `/api/analytics`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/overview` | Admin KPI dashboard: workers, policies, claims, premiums, loss ratio, fraud stats, city breakdown, 8-week trend |

### Activity — `/api/activity`

Manages the `worker_activity` table for daily order/earnings logging.

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns `{"status": "ok", "service": "Axio"}` |
| `GET` | `/api/test` | Returns `{"message": "API routing works!"}` |

---

## 🤖 AI & ML Engine

Axio ships three independent ML/AI modules that run at startup and during every claim evaluation.

### Module 1: Risk Scoring Model (`ml/risk_model.py`)

A **6-factor weighted rule-based model** that computes `risk_score` (0.0–1.0) and `risk_tier` (low/medium/high) for every worker at registration time.

| Factor | Weight | Description |
|---|---|---|
| City Base Risk | **30%** | Mumbai=0.72, Delhi=0.68, Chennai=0.60, Hyderabad=0.55, Pune=0.48, Bangalore=0.42 |
| Zone Risk | **15%** | High-risk flood zones get +0.18 (e.g., Kurla, Bellandur, LB Nagar) |
| Experience Risk | **20%** | < 3 months → 0.80; < 8 months → 0.60; < 18 months → 0.40; 18+ months → 0.25 |
| Platform Diversification | **10%** | `multiple` platform → −0.05 bonus; single platform → 0.0 |
| Order Volume Risk | **15%** | > 35/day → 0.25; > 22/day → 0.45; > 15/day → 0.60; < 15/day → 0.75 |
| Shift Risk | **10%** | Morning=0.45, Evening=0.50, Night=0.65, Flexible=0.40 |

**Risk tier thresholds:**
- `low`: score < 0.35
- `medium`: 0.35 ≤ score < 0.65
- `high`: score ≥ 0.65 → system **recommends Premium plan**

The same model also computes **zone-specific risks** (`zone_flood_risk`, `zone_heat_risk`, `zone_pollution_risk`) stored on the Worker record, used for analytics display.

### Module 2: Income Prediction Model (`ml/income_model.py`)

Predicts what a worker **should have earned** on a disruption day, so we can calculate the true income loss.

**3-tier prediction strategy:**
1. **Same-weekday sampling** — If ≥ 3 non-disruption records exist for the same weekday (e.g., last 3+ Mondays), average the last 8 such samples
2. **Adjusted daily average** — If < 3 same-weekday samples exist, take the average of last 14 normal days × day-of-week multiplier
3. **Fallback** — `worker.avg_daily_earnings × day_multiplier`

**Day-of-week multipliers** (hardcoded from delivery platform data patterns):
| Day | Multiplier | Rationale |
|---|---|---|
| Monday | 1.00 | Baseline |
| Tuesday | 0.95 | Slowest weekday |
| Wednesday | 0.97 | Midweek slow |
| Thursday | 1.00 | Baseline |
| Friday | 1.05 | Pre-weekend uptick |
| Saturday | 1.22 | High demand |
| Sunday | **1.35** | Peak grocery reorder day |

**Disruption Impact Factors** (36 combinations — 9 types × 4 severities):
| Disruption Type | Mild | Moderate | Severe | Extreme |
|---|---|---|---|---|
| Heavy Rain | 20% | 45% | 70% | 88% |
| Flood | 50% | 68% | 85% | 96% |
| Severe Pollution | 15% | 32% | 55% | 73% |
| Extreme Heat | 15% | 25% | 48% | 68% |
| Traffic Shutdown | 20% | 42% | 63% | 80% |
| Curfew | 60% | 75% | 90% | 97% |
| Dark Store Closure | 50% | 75% | 88% | 95% |
| Local Strike | 30% | 52% | 78% | 90% |
| App Outage | 35% | 60% | 82% | 95% |

### Module 3: IsolationForest Fraud Model (`ml/train_models.py`)

Trained once at application startup. If the model file already exists at `ml/models/fraud_isolation.joblib`, it is loaded without retraining.

**Training data:** 1,000 synthetic samples
- 800 **normal** samples: workers with stable registration history, reasonable claim ratios (0.5×–2.0×), few claims (0–3/month)
- 200 **fraud** samples split across 3 patterns:
  1. **New account + high claims** — registered < 10 days, loss > 2× average, 3–6 claims/month
  2. **Excessive loss claims** — loss > 2.5× average, multiple recent claims
  3. **Suspicious zero earnings** — zero earnings during mild disruptions

**Model configuration:**
```python
IsolationForest(
    n_estimators=100,
    contamination=0.2,   # Expects ~20% anomalies in training data
    random_state=42,
    max_samples='auto',
    max_features=1.0
)
```
**Features:** `[days_since_registration, claim_to_avg_ratio, claim_count_30d, zero_earnings_mild_flag]`

---

## 🚨 Fraud Detection System — 3-Layer Defence

Every claim processed by `fraud_model.py:FraudDetector.detect()` passes through **8 independent rule-based checks**. Scores are additive and capped at 1.0.

### The 8 Rules

| Rule ID | Condition | Fraud Score Added |
|---|---|---|
| `NEW_ACCOUNT_CLAIM` | Worker registered < 7 days before claim date | **+0.30** |
| `DUPLICATE_CLAIM_SAME_DAY` | Another claim already exists for the same `(worker, date)` | **+0.90** (critical) |
| `LOSS_EXCEEDS_HISTORICAL_2_5X` | `income_loss > worker.avg_daily_earnings × 2.5` | **+0.35** |
| `ZERO_EARNINGS_MILD_DISRUPTION` | `actual_earnings == 0` during `mild` or `moderate` severity event | **+0.42** |
| `CLAIM_IMMEDIATELY_AFTER_POLICY` | Claim filed < 2 hours after the policy was created | **+0.48** |
| `HIGH_CLAIM_FREQUENCY_30_DAYS` | > 3 approved/paid claims in the last 30 days | **+0.20** |
| `DISRUPTION_CITY_MISMATCH` | Disruption city ≠ worker's registered city | **+0.72** (near-critical) |
| `EARNINGS_DURING_STORE_CLOSURE` | `actual_earnings > ₹100` during a `dark_store_closure` event | **+0.60** |

### Decision Thresholds

```
fraud_score ≤ 0.40  →  AUTO-APPROVED  → Payout triggered immediately
0.40 < fraud_score ≤ 0.75  →  FLAGGED FOR REVIEW  → Admin must approve/reject
fraud_score > 0.75  →  AUTO-BLOCKED  → Status = flagged_fraud, payout = ₹0
```

### Anti-Spoofing Philosophy

GPS alone is easily spoofed. Axio cross-checks four independent signals that a fraudster cannot simultaneously fake:

1. **Mock Location Flag** — App detects if Android's "Mock Location" is active at claim time
2. **Pre-claim Engagement** — Genuine workers generate pings before a disruption; sudden claims with no prior activity are flagged
3. **Movement Trace Consistency** — Delivery workers move constantly; a static GPS trace for 2+ hours pre-claim signals a stationary spoofed device
4. **Ring Detection** — 20+ claims from the same zone within a 10-minute window triggers an automatic "Zone Freeze" pending manual audit (flagged via zone-level fraud patterns)

---

## 🔄 Claim Processing Algorithm (10 Steps)

The complete algorithm lives in `services/claim_engine.py:evaluate_claim()`. This is triggered for every worker with an active policy during a disruption event.

```
Step 1  → Query WorkerActivity for the last 30 days (for income model baseline)
Step 2  → Predict expected earnings using income_model.predict_expected_earnings()
           (same-weekday avg → all-days avg → worker's avg, each × day multiplier)
Step 3  → Calculate expected orders: worker.avg_daily_orders × day_multiplier
Step 4  → Look up actual earnings from WorkerActivity for the disruption date.
           If no record: estimate = expected × (1 − impact_factor)
Step 5  → income_loss = max(0, expected_earnings − actual_earnings)
Step 6  → payout_amount = min(income_loss, policy.daily_coverage_limit)
Step 7  → Run FraudDetector.detect() — execute all 8 rules, accumulate score
Step 8  → Determine status:
           fraud_score > 0.75  →  status = "flagged_fraud", payout = ₹0
           income_loss < ₹50   →  status = "rejected" (below minimum threshold)
           fraud_score > 0.40  →  status = "flagged_fraud" (hold for review)
           else                →  status = "approved"
Step 9  → Save Claim record to database (auto_processed = True)
Step 10 → If status == "approved": call payout_service.process_payout()
           On payout success: status → "paid", paid_at, payment_reference, upi_transaction_id set
           On failure (4% rate): claim stays "approved", payout retried via /claims/{id}/payout
```

---

## 🎬 Demo Data Seeded at Startup

Every fresh database is automatically seeded by `seed_demo_data()` in `main.py`. Seeding is skipped if any worker already exists.

**10 workers across 5 cities:**

| Worker | City | Zone | Platform | Plan |
|---|---|---|---|---|
| Rahul Kumar | Hyderabad | LB Nagar *(high-risk)* | Blinkit | Premium |
| Priya Sharma | Hyderabad | Kondapur | Zepto | Premium |
| Mohammed Ali | Bangalore | Bellandur *(high-risk)* | Swiggy Instamart | Premium |
| Suresh Reddy | Hyderabad | Uppal *(high-risk)* | Blinkit | Standard |
| Anita Devi | Mumbai | Kurla *(high-risk)* | Zepto | Standard |
| Kiran Patel | Bangalore | HSR Layout *(high-risk)* | Blinkit | Standard |
| Raju Singh | Delhi | Laxmi Nagar *(high-risk)* | Multiple | Standard |
| Deepa Nair | Mumbai | Bandra | Swiggy Instamart | Basic |
| Venkat Rao | Hyderabad | Kukatpally | Swiggy Instamart | Basic |
| Fatima Begum | Bangalore | Whitefield | Blinkit | Basic |

**30 days of `WorkerActivity` per worker** with realistic day-of-week multipliers and 3 reduced-activity disruption days built in.

**4 past disruption events with claims:**
1. Hyderabad — Heavy Rain (severe, 85mm, 16 days ago) → 4 workers affected
2. Delhi — Severe Pollution (extreme, AQI 420, 10 days ago) → 1 worker affected
3. Bangalore — Flood (severe, 120mm, 7 days ago) → 3 workers affected
4. Mumbai — Extreme Heat (severe, 44°C, 4 days ago) → 2 workers affected

Claims include a mix of `paid`, `rejected` (loss < ₹50), and `flagged_fraud` (Venkat Rao — new account + high loss) statuses.

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.12+**
- **Node.js 18+** and npm
- **Docker Desktop** (for PostgreSQL)
- **PowerShell** (Windows — setup scripts are `.ps1`)

### Option 1 — Docker Compose (Recommended)

Starts all three services (PostgreSQL, Backend, Frontend) in one command:

```bash
docker-compose up --build
```

Services:
- **API**: `http://localhost:8000` (Swagger UI at `/docs`)
- **Frontend**: `http://localhost:5173`
- **Database**: `localhost:5432` (db: `swiftcover`, user: `postgres`, pw: `swiftcover123`)

### Option 2 — Manual Local Setup (Windows PowerShell)

**Step 1: Start PostgreSQL (Docker)**
```bash
docker-compose up postgres -d
```

**Step 2: Setup and start the backend**
```powershell
# From project root:
.\setup-backend.ps1

# Then start:
.\start-backend.ps1
# OR manually:
cd backend
.\\venv\\Scripts\\Activate.ps1
python main.py
```

The backend auto-runs on startup:
1. Creates all database tables via SQLAlchemy
2. Trains and saves the IsolationForest fraud model
3. Seeds demo data (if database is empty)

API ready at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

**Step 3: Setup and start the frontend**
```powershell
# From project root:
.\setup-frontend.ps1

# Then start:
.\start-frontend.ps1
# OR manually:
cd frontend
npm run dev
```

Frontend at: `http://localhost:5173`

**Step 4: Reset the database (optional)**
```powershell
.\reset-database.ps1
```

### Environment Variables (`backend/.env`)

```env
# Required
DATABASE_URL=postgresql://postgres:swiftcover123@localhost:5432/swiftcover

# CORS — must match frontend dev server port
CORS_ORIGINS=http://localhost:5173
```

Copy from `backend/.env.example` and update as needed.

---

## 🗺️ 6-Week Development Roadmap

### Phase 1 — Seed (March 4–20) ✅
- [x] Architecture design & parametric trigger mapping
- [x] Tech stack selection (Python/React)
- [x] Core schema definition & data modeling (6 tables, 8 enums)

### Phase 2 — Scale (March 21 – April 4) ✅
- [x] Worker registration wizard & dynamic AI risk profiling (6-factor model)
- [x] Weekly Policy Management (7-day active/expired lifecycle)
- [x] Parametric claim engine — full 10-step automated algorithm
- [x] Income prediction model with 36-entry impact factor table
- [x] 8-rule fraud detection scoring + IsolationForest ML model
- [x] Razorpay mock payout integration (96% success) + UPI ref generation
- [x] Worker dashboard (Recharts earnings chart, policy card, claim history)
- [x] Admin dashboard (disruption simulator, claims queue, 8-week trend analytics)
- [x] Full Docker Compose deployment

### Phase 3 — Soar (April 5–17) 🔄
- [ ] Ring detection (multi-account fraud pattern matching — 20+ claims/10-min zone freeze)
- [ ] Photo verification hook for high-risk `flagged_fraud` claims
- [ ] Prophet-based next-week risk forecasting for insurers
- [ ] External weather API integration (OpenWeatherMap live polling)
- [ ] Final performance hardening and security audit

---

## 🌟 Innovation Differentiators

1. **Platform Outage Coverage** — First-of-its-kind parametric trigger for Q-Commerce app downtime. No Indian insurance product covers this today. Exclusive to the Premium plan.

2. **Granular Zone-Level Pricing** — Workers in historically flood-prone pin codes (Kurla, Bellandur, LB Nagar etc.) pay accurate risk-adjusted premiums (+12%), not city-wide averages.

3. **Layered Fraud Defence** — 8 independent rule checks + anomaly-based IsolationForest, producing a single `fraud_score` that drives three distinct outcomes (auto-approve, review, auto-block).

4. **Zero Paperwork, Sub-2-Hour Payout** — From disruption detection to UPI credit: the Claim Engine processes everything automatically. Workers receive payment references and UPI transaction IDs matching real Razorpay format.

5. **Transparent Trigger Dashboard** — Workers see real-time trigger thresholds on their dashboard ("Current AQI: 280 — coverage active in 20 AQI points for Standard plan"). No black-box insurance.

6. **Weekly micro-premium model** — ₹49–149/week aligns perfectly with weekly gig platform payouts, removing the affordability friction that blocks monthly insurance adoption among gig workers.

---

## 📎 Documentation & Links

- [Technical Design System (DESIGN.md)](DESIGN.md)
- **API Docs (Live):** `http://localhost:8000/docs`
- **Demo Video:** `[TO BE ADDED]` 🎬
- **Figma Designs:** `[TO BE ADDED]` 🎨

---

<div align="center">

**Built for Guidewire DEVTrails 2026 | Phase 2 — Scale & Protect**

*Axio — Because every gig worker deserves to be protected.*

</div>
