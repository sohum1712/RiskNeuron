# Axio — Technical Design
## Architecture, Schema, APIs, ML Models, Frontend

---

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite + Tailwind CSS + Recharts |
| State      | Zustand (persist workerId to localStorage)              |
| Data fetch | TanStack React Query v5                                 |
| Animations | Framer Motion                                           |
| Icons      | Lucide React                                            |
| Toasts     | react-hot-toast                                         |
| Backend    | Python 3.11 + FastAPI + Uvicorn                        |
| ORM        | SQLAlchemy 2.0 + Alembic                               |
| Validation | Pydantic v2                                             |
| Database   | PostgreSQL 15                                           |
| ML         | scikit-learn + pandas + numpy + joblib                 |
| DevOps     | Docker + docker-compose                                 |

---

## Project Structure

```
swiftcover/
├── docker-compose.yml
├── .gitignore
├── README.md
├── REQUIREMENTS.md
├── DESIGN.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py                    ← FastAPI app + lifespan (tables + seed)
│   ├── database/
│   │   ├── __init__.py
│   │   ├── connection.py          ← engine, SessionLocal, get_db, create_tables
│   │   └── models.py              ← all ORM models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── workers.py             ← /api/workers
│   │   ├── policies.py            ← /api/policies
│   │   ├── claims.py              ← /api/claims
│   │   ├── activity.py            ← /api/activity
│   │   ├── disruptions.py         ← /api/disruptions
│   │   └── analytics.py           ← /api/analytics
│   ├── services/
│   │   ├── __init__.py
│   │   ├── premium_engine.py      ← plan pricing + AI adjustments
│   │   ├── claim_engine.py        ← parametric claim evaluation
│   │   ├── fraud_detector.py      ← 8-rule fraud scoring
│   │   └── payout_service.py      ← mock UPI/Razorpay
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── risk_model.py          ← worker risk scoring (rule-based)
│   │   ├── income_model.py        ← expected earnings predictor
│   │   └── train_models.py        ← trains IsolationForest, saves to ml/models/
│   └── schemas/
│       ├── __init__.py
│       ├── worker.py
│       ├── policy.py
│       ├── claim.py
│       └── disruption.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── types/index.ts
        ├── api/client.ts
        ├── store/useStore.ts
        ├── pages/
        │   ├── Landing.tsx
        │   ├── Onboarding.tsx
        │   ├── WorkerDashboard.tsx
        │   ├── PolicyPage.tsx
        │   ├── ClaimsPage.tsx
        │   └── AdminDashboard.tsx
        └── components/
            ├── ui/Button.tsx
            ├── ui/Card.tsx
            ├── ui/Badge.tsx
            ├── ui/Skeleton.tsx
            ├── charts/EarningsChart.tsx
            ├── charts/RiskGauge.tsx
            ├── DisruptionAlert.tsx
            ├── WeeklyPremiumCard.tsx
            ├── PolicyCard.tsx
            └── PayoutNotification.tsx
```

---

## Database Schema

### Table: workers
```sql
id                  SERIAL PRIMARY KEY
name                VARCHAR(100) NOT NULL
phone               VARCHAR(15) UNIQUE NOT NULL        -- login identifier
city                VARCHAR(50) NOT NULL               -- Hyderabad|Bangalore|Mumbai|Delhi|Chennai|Pune
dark_store_name     VARCHAR(100)                       -- e.g. "Blinkit - LB Nagar"
zone_name           VARCHAR(100)                       -- delivery zone
platform            ENUM(zepto,blinkit,swiggy_instamart,multiple) NOT NULL
avg_daily_orders    FLOAT DEFAULT 25
avg_daily_earnings  FLOAT DEFAULT 550                  -- auto-calc: orders × 18
shift_type          ENUM(morning,evening,night,flexible) DEFAULT flexible
experience_months   INTEGER DEFAULT 4
risk_score          FLOAT DEFAULT 0.5                  -- 0.0=safe, 1.0=high
risk_tier           ENUM(low,medium,high) DEFAULT medium
zone_flood_risk     FLOAT DEFAULT 0.3
zone_heat_risk      FLOAT DEFAULT 0.4
zone_pollution_risk FLOAT DEFAULT 0.5
upi_id              VARCHAR(100)
created_at          TIMESTAMP DEFAULT now()
is_active           BOOLEAN DEFAULT true
```

### Table: policies
```sql
id                    SERIAL PRIMARY KEY
worker_id             INTEGER FK→workers.id NOT NULL
plan_type             ENUM(basic,standard,premium) NOT NULL
weekly_premium        FLOAT NOT NULL
weekly_coverage_limit FLOAT NOT NULL
daily_coverage_limit  FLOAT NOT NULL
min_orders_threshold  INTEGER DEFAULT 5
parametric_triggers   JSON                             -- {rainfall_mm:50, aqi:200}
covered_disruptions   JSON                             -- ["heavy_rain","flood",...]
status                ENUM(active,expired,cancelled) DEFAULT active
start_date            DATE NOT NULL
end_date              DATE NOT NULL                    -- always start_date + 7 days
auto_renew            BOOLEAN DEFAULT false
created_at            TIMESTAMP DEFAULT now()
```

### Table: worker_activity
```sql
id                  SERIAL PRIMARY KEY
worker_id           INTEGER FK→workers.id NOT NULL
date                DATE NOT NULL
orders_completed    INTEGER DEFAULT 0
working_hours       FLOAT DEFAULT 0
earnings            FLOAT DEFAULT 0
online_hours        FLOAT DEFAULT 0
peak_hour_orders    INTEGER DEFAULT 0
platform            VARCHAR(20)
is_disruption_day   BOOLEAN DEFAULT false
disruption_event_id INTEGER FK→disruption_events.id NULLABLE
UNIQUE(worker_id, date)
```

### Table: disruption_events
```sql
id                       SERIAL PRIMARY KEY
city                     VARCHAR(50) NOT NULL
zone_name                VARCHAR(100)
disruption_type          ENUM(heavy_rain,flood,extreme_heat,severe_pollution,
                              traffic_shutdown,curfew,local_strike,
                              dark_store_closure,app_outage) NOT NULL
severity                 ENUM(mild,moderate,severe,extreme) NOT NULL
rainfall_mm              FLOAT
aqi                      FLOAT
traffic_index            FLOAT
temperature_celsius      FLOAT
started_at               TIMESTAMP NOT NULL DEFAULT now()
ended_at                 TIMESTAMP
duration_hours           FLOAT
is_active                BOOLEAN DEFAULT true
source                   VARCHAR(50) DEFAULT 'simulated'
dark_stores_closed       INTEGER DEFAULT 0
estimated_order_drop_pct FLOAT DEFAULT 0
affected_workers_count   INTEGER DEFAULT 0
total_claims_triggered   INTEGER DEFAULT 0
total_payout_amount      FLOAT DEFAULT 0
created_at               TIMESTAMP DEFAULT now()
```

### Table: claims
```sql
id                       SERIAL PRIMARY KEY
worker_id                INTEGER FK→workers.id NOT NULL
policy_id                INTEGER FK→policies.id NOT NULL
disruption_event_id      INTEGER FK→disruption_events.id NOT NULL
claim_date               DATE NOT NULL
expected_orders          INTEGER
actual_orders            INTEGER
expected_earnings        FLOAT
actual_earnings          FLOAT
income_loss              FLOAT
disruption_impact_factor FLOAT                -- 0.0–1.0
payout_amount            FLOAT DEFAULT 0
status                   ENUM(pending,approved,rejected,paid,flagged_fraud) DEFAULT pending
fraud_score              FLOAT DEFAULT 0
fraud_flags              JSON DEFAULT []
auto_processed           BOOLEAN DEFAULT true
rejection_reason         VARCHAR(500)
processed_at             TIMESTAMP DEFAULT now()
paid_at                  TIMESTAMP
payment_reference        VARCHAR(100)         -- RZP_XXXXXXXXXXXX
upi_transaction_id       VARCHAR(100)         -- UPIYYYYMMDDHHMMSS####
```

### Table: premium_payments
```sql
id                SERIAL PRIMARY KEY
worker_id         INTEGER FK→workers.id NOT NULL
policy_id         INTEGER FK→policies.id NOT NULL
amount            FLOAT NOT NULL
week_start        DATE NOT NULL
week_end          DATE NOT NULL
status            VARCHAR(20) DEFAULT 'paid'
payment_reference VARCHAR(100)
paid_at           TIMESTAMP DEFAULT now()
```

---

## API Design

### Workers Router — /api/workers

**POST /api/workers/register**
Request: `{name, phone, city, dark_store_name, zone_name, platform, avg_daily_orders, shift_type, experience_months, upi_id?}`
Response: `{worker, risk_profile: {risk_score, risk_tier, risk_factors[], zone_flood_risk, zone_heat_risk, zone_pollution_risk}, recommended_plans: PlanOption[3], message}`
Logic: validate phone unique → compute risk via RiskModel → compute zone risks → save worker → generate 3 plans via PremiumEngine → return

**GET /api/workers/{worker_id}/dashboard**
Response: `{worker, active_policy|null, active_disruptions[], this_week_stats, earnings_chart[14], recent_claims[5]}`
Single endpoint that aggregates all dashboard data.

**GET /api/workers** — all active workers (admin)
**GET /api/workers/{worker_id}** — single worker

### Policies Router — /api/policies

**POST /api/policies/create**
Request: `{worker_id, plan_type, auto_renew?}`
Logic: check no existing active policy → compute adjusted premium → set parametric_triggers + covered_disruptions by plan → end_date = start_date + 7 days → create premium_payment record

**GET /api/policies/worker/{worker_id}** — worker's policy history
**POST /api/policies/{policy_id}/renew** — extend 7 days
**PUT /api/policies/{policy_id}/upgrade** — change plan type

### Disruptions Router — /api/disruptions

**POST /api/disruptions/simulate** ← MAIN DEMO ENDPOINT
Request: `{city, zone_name?, disruption_type, severity, duration_hours, rainfall_mm?, aqi?, traffic_index?, temperature_celsius?}`
Logic:
1. Create DisruptionEvent (is_active=True)
2. Find workers in city (filtered by zone if provided)
3. For each worker with active policy covering disruption type:
   a. Call claim_engine.evaluate(worker, disruption, policy, db)
   b. claim_engine internally calls fraud_detector and payout_service
4. Aggregate stats, update disruption event
5. Return SimulationResult with all claim_details

Response: `{disruption_event, affected_workers, policies_evaluated, claims_approved, claims_rejected, claims_fraud_flagged, total_payout, processing_time_seconds, claim_details[]}`

**GET /api/disruptions/active?city=** — active disruptions
**GET /api/disruptions/history?city=&limit=** — historical events

### Claims Router — /api/claims

**GET /api/claims?status=&worker_id=&limit=** — filtered claims list
**GET /api/claims/worker/{worker_id}** — worker's claims
**POST /api/claims/{claim_id}/payout** — trigger mock payout
**POST /api/claims/{claim_id}/review** — admin approve/reject with reason

### Activity Router — /api/activity

**POST /api/activity/log** — log single day activity
**GET /api/activity/worker/{worker_id}?days=30** — activity history

### Analytics Router — /api/analytics

**GET /api/analytics/overview**
Returns: `{total_workers, active_policies, active_disruptions, claims_this_week, payouts_this_week, premiums_this_week, loss_ratio, fraud_caught_this_week, fraud_amount_saved, city_stats[], weekly_trend[8]}`

---

## ML / AI Design

### Model 1: RiskModel (rule-based, no training required)

Location: `backend/ml/risk_model.py`

```
compute(worker_data) → (risk_score: float, risk_tier: str, factors: list[str])

Score components (weighted sum):
  city_base_risk      × 0.30   # Mumbai=0.72, Delhi=0.68, Chennai=0.60, Hyderabad=0.55, Pune=0.48, Bangalore=0.42
  zone_risk           × 0.15   # +0.18 if in known flood zone (LB Nagar, Uppal, Kurla, Dharavi, Bellandur, etc.)
  experience_risk     × 0.20   # <3mo=0.80, <8mo=0.60, <18mo=0.40, else=0.25
  platform_risk       × 0.10   # multiple=-0.05 bonus
  order_volume_risk   × 0.15   # >35 orders=0.25, >22=0.45, >15=0.60, else=0.75
  shift_risk          × 0.10   # morning=0.45, evening=0.50, night=0.65, flexible=0.40

risk_tier: score < 0.35=low | < 0.65=medium | else=high

Premium multiplier from risk_score:
  < 0.30 → ×0.82  (-18%)
  < 0.50 → ×0.93  (-7%)
  < 0.70 → ×1.00  (base)
  < 0.85 → ×1.15  (+15%)
  else   → ×1.28  (+28%)

City premium multiplier:
  Mumbai=1.20, Delhi=1.15, Chennai=1.12, Hyderabad=1.08, Pune=1.00, Bangalore=0.95

Zone multiplier: +0.12 for known flood zones
```

### Model 2: IncomePredictor (statistical, no training required)

Location: `backend/ml/income_model.py`

```
predict_expected_earnings(worker, activity_history, target_date) → float

Algorithm:
  1. weekday = target_date.weekday()
  2. multiplier = DAY_MULTIPLIERS[weekday]  # Sun=1.35, Sat=1.22, Fri=1.05, else ~1.0
  3. same_weekday_normal = [a.earnings for a in history if a.date.weekday()==weekday and not a.is_disruption_day]
  4. if len(same_weekday_normal) >= 3: base = avg(last 8 of these)
  5. elif history: base = avg(normal days last 14) × multiplier
  6. else: base = worker.avg_daily_earnings × multiplier
  7. return round(base, 2)

Income loss: max(0, expected - actual)
Payout: min(income_loss, policy.daily_coverage_limit)
```

Disruption impact factors (used when actual activity not available):
```
("heavy_rain", "mild")=0.20,     ("heavy_rain", "moderate")=0.45
("heavy_rain", "severe")=0.70,   ("heavy_rain", "extreme")=0.88
("flood", "moderate")=0.68,      ("flood", "severe")=0.85,       ("flood", "extreme")=0.96
("severe_pollution", "mild")=0.15, ("severe_pollution", "moderate")=0.32
("severe_pollution", "severe")=0.55, ("severe_pollution", "extreme")=0.73
("extreme_heat", "moderate")=0.25, ("extreme_heat", "severe")=0.48, ("extreme_heat", "extreme")=0.68
("traffic_shutdown", "mild")=0.20, ("traffic_shutdown", "moderate")=0.42, ("traffic_shutdown", "severe")=0.63
("curfew", "severe")=0.90,       ("curfew", "extreme")=0.97
("dark_store_closure", "moderate")=0.75, ("dark_store_closure", "severe")=0.88
("local_strike", "moderate")=0.52, ("local_strike", "severe")=0.78
("app_outage", "moderate")=0.60, ("app_outage", "severe")=0.82
```

### Model 3: FraudDetector (rule engine + IsolationForest)

Location: `backend/ml/fraud_model.py`
Trained model saved to: `backend/ml/models/fraud_isolation.joblib`

```
detect(worker, claim_date, income_loss, actual_earnings, disruption, db) → FraudResult

8 rules (see REQUIREMENTS.md for scores)
Final score = min(1.0, sum of triggered rule scores)
```

---

## Frontend Design System

```
Colors:
  Background:    #0F172A  (dark navy)
  Surface:       #1E293B  (card background)
  Border:        #334155
  Accent:        #06B6D4  (cyan — water/rain motif)
  Success:       #10B981  (emerald)
  Warning:       #F59E0B  (amber)
  Danger:        #EF4444  (red)
  Text Primary:  #F8FAFC
  Text Muted:    #94A3B8

Typography: Inter (Google Fonts)
Border radius: 12px cards, 8px inputs, 6px badges
Shadows: 0 4px 24px rgba(0,0,0,0.3)
```

### Platform Color Coding
- Zepto: yellow (#EAB308)
- Blinkit: orange (#F97316)
- Swiggy Instamart: purple (#A855F7)

### Page Routes
```
/                    → Landing.tsx
/onboarding          → Onboarding.tsx
/dashboard/:id       → WorkerDashboard.tsx
/policy/:id          → PolicyPage.tsx
/claims/:id          → ClaimsPage.tsx
/admin               → AdminDashboard.tsx (default tab: Overview)
/admin?tab=simulator → AdminDashboard.tsx (Simulator tab)
```

### State Management (Zustand)
```typescript
interface AppState {
  currentWorkerId: number | null
  setWorkerId: (id: number) => void
  clearWorker: () => void
}
// Persist currentWorkerId to localStorage
// On app load: if currentWorkerId exists → redirect to /dashboard/:id
```

---

## Service Logic Details

### PremiumEngine

```python
PLAN_CONFIG = {
  "basic":    {"weekly":49,  "coverage_weekly":1500, "coverage_daily":250},
  "standard": {"weekly":89,  "coverage_weekly":2500, "coverage_daily":400},
  "premium":  {"weekly":149, "coverage_weekly":4000, "coverage_daily":650},
}

compute_plans(worker) → List[PlanOption]:
  risk_mult  = get_risk_multiplier(worker.risk_score)
  city_mult  = CITY_MULTIPLIER[worker.city]
  zone_mult  = 1.12 if zone in HIGH_RISK_ZONES else 1.00
  adj_premium = round(base_weekly × risk_mult × city_mult × zone_mult)
  recommended = "premium" if risk>0.65 else "standard" if risk>0.35 else "basic"
  savings = worker.avg_daily_earnings × 0.6 × {basic:1.5, standard:2.5, premium:3.5}[plan]
```

### ClaimEngine

```python
evaluate(worker, disruption, policy, db) → Claim:
  1. Get history = last 30 days WorkerActivity for worker
  2. expected = predict_expected_earnings(worker, history, disruption.started_at.date())
  3. expected_orders = int(avg_daily_orders × DAY_MULTIPLIERS[weekday])
  4. actual = WorkerActivity for that date (if exists) else expected × (1 - impact_factor)
  5. income_loss = max(0, expected - actual)
  6. payout_amt = min(income_loss, policy.daily_coverage_limit)
  7. fraud = FraudDetector().detect(...)
  8. status:
     - fraud_score > 0.75 → flagged_fraud, payout=0
     - income_loss < 50 → rejected, payout=0
     - else → approved
  9. save Claim, commit
  10. if approved → PayoutService().process(claim, worker, db)
  return claim
```

### PayoutService

```python
process(claim, worker, db) → dict:
  txn_id = "RZP_" + random 12 chars (uppercase + digits)
  upi_ref = "UPI" + datetime.now().strftime('%Y%m%d%H%M%S') + phone[-4:]
  success = random() > 0.04  # 96% success
  if success:
    claim.status = "paid"
    claim.paid_at = now()
    claim.payment_reference = txn_id
    claim.upi_transaction_id = upi_ref
    db.commit()
  return {success, transaction_id, upi_reference, amount, message}
```

---

## Docker Setup

**docker-compose.yml** — 3 services: postgres, backend, frontend
- postgres: postgres:15-alpine, port 5432, healthcheck
- backend: build ./backend, port 8000, depends_on postgres healthy, PYTHONPATH=/app
- frontend: build ./frontend, port 5173, depends_on backend

**backend/Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p ml/models
ENV PYTHONPATH=/app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

**frontend/Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

---

## Seed Data Specification

### 10 Workers

| # | Name          | City       | Zone         | Platform         | Orders/day | Plan     |
|---|---------------|------------|--------------|------------------|------------|----------|
| 1 | Rahul Kumar   | Hyderabad  | LB Nagar     | Blinkit          | 28         | Premium  |
| 2 | Priya Sharma  | Hyderabad  | Kondapur     | Zepto            | 22         | Premium  |
| 3 | Mohammed Ali  | Bangalore  | Bellandur    | Swiggy Instamart | 30         | Premium  |
| 4 | Suresh Reddy  | Hyderabad  | Uppal        | Blinkit          | 18         | Standard |
| 5 | Anita Devi    | Mumbai     | Kurla        | Zepto            | 26         | Standard |
| 6 | Kiran Patel   | Bangalore  | HSR Layout   | Blinkit          | 35         | Standard |
| 7 | Raju Singh    | Delhi      | Laxmi Nagar  | Multiple         | 20         | Standard |
| 8 | Deepa Nair    | Mumbai     | Bandra       | Swiggy Instamart | 24         | Basic    |
| 9 | Venkat Rao    | Hyderabad  | Kukatpally   | Swiggy Instamart | 16         | Basic    |
|10 | Fatima Begum  | Bangalore  | Whitefield   | Blinkit          | 29         | Basic    |

### Activity Generation Rules
- Mon–Thu: base × random(0.85, 1.15)
- Fri: base × random(0.90, 1.20)
- Sat: base × 1.22 × random(0.90, 1.10)
- Sun: base × 1.35 × random(0.90, 1.10)
- Disruption days (day 5, 12, 20 ago): base × random(0.15, 0.35) with is_disruption_day=True

### Past Disruptions
1. heavy_rain / severe / Hyderabad / 16 days ago → affects workers 1,2,4,9
2. severe_pollution / extreme / Delhi / 10 days ago → affects worker 7
3. flood / severe / Bangalore / 7 days ago → affects workers 3,6,10
4. extreme_heat / severe / Mumbai / 4 days ago → affects workers 5,8
