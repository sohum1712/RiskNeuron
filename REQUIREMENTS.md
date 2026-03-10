# SwiftCover — Product Requirements
## Guidewire DEVTrails 2026 | Q-Commerce Parametric Micro-Insurance

---

## Product Vision

SwiftCover is an AI-powered parametric micro-insurance platform for Grocery &
Q-Commerce delivery workers (Zepto, Blinkit, Swiggy Instamart) in India.

When disruptions (rain, flood, pollution, heat, traffic, dark store closures)
reduce a delivery worker's income below their normal level, SwiftCover
automatically detects the disruption, evaluates their claim using AI, checks
for fraud, and credits money to their UPI account — zero manual steps required.

---

## Personas

**Primary User: Q-Commerce Delivery Partner**
- Works for Zepto, Blinkit, or Swiggy Instamart
- Earns ₹400–800/day based purely on order count (no base salary)
- Operates from a dark store within a 500m–2km delivery radius
- Is uniquely vulnerable: one flooded road = zero orders = zero income
- Pays weekly premiums (aligned with weekly platform payouts)

**Secondary User: Insurance Admin**
- Monitors claims, disruptions, and fraud across all cities
- Uses the simulator to run demo disruption scenarios
- Reviews fraud-flagged claims manually

---

## Coverage Rules (NON-NEGOTIABLE)

- Coverage = **income loss ONLY**
- NO health, life, accident, vehicle repair, or phone damage coverage
- **Weekly pricing** — policies last exactly 7 days, renewed weekly
- Fully automated — zero manual claim filing by workers

---

## Weekly Plans

| Plan     | Weekly Premium | Max Payout/Week | Max Payout/Day |
|----------|---------------|-----------------|----------------|
| Basic    | ₹49 (adjusted)| ₹1,500          | ₹250           |
| Standard | ₹89 (adjusted)| ₹2,500          | ₹400           |
| Premium  | ₹149 (adjusted)| ₹4,000         | ₹650           |

Premiums are AI-adjusted by: risk score (±28%), city multiplier, zone multiplier.

---

## Disruption Types & Parametric Triggers

| Disruption           | Basic Threshold | Standard | Premium |
|----------------------|-----------------|----------|---------|
| Heavy Rain           | 60mm/hr         | 50mm/hr  | 40mm/hr |
| Flood                | 100mm/hr        | 100mm/hr | 100mm/hr|
| Severe Pollution     | AQI 250         | AQI 200  | AQI 180 |
| Extreme Heat         | —               | 43°C     | 42°C    |
| Traffic Shutdown     | —               | 7.0/10   | 6.5/10  |
| Dark Store Closure   | —               | —        | ✓       |
| Curfew / Strike      | —               | —        | ✓       |
| App Outage           | —               | —        | ✓       |

---

## Fraud Detection Rules (all 8 must be implemented)

1. NEW_ACCOUNT_CLAIM — registered < 7 days ago → +0.30 score
2. DUPLICATE_CLAIM_SAME_DAY — already claimed same date → +0.90 score
3. LOSS_EXCEEDS_HISTORICAL_2_5X — loss > 2.5× daily average → +0.35 score
4. ZERO_EARNINGS_MILD_DISRUPTION — ₹0 actual during mild/moderate → +0.42 score
5. CLAIM_IMMEDIATELY_AFTER_POLICY — claim filed <2h after policy created → +0.48 score
6. HIGH_CLAIM_FREQUENCY_30_DAYS — >3 approved claims in 30 days → +0.20 score
7. DISRUPTION_CITY_MISMATCH — disruption city ≠ worker city → +0.72 score
8. EARNINGS_DURING_STORE_CLOSURE — earnings > ₹100 during dark store closure → +0.60 score

Thresholds: score < 0.40 → approve | 0.40–0.75 → flag for review | > 0.75 → auto-reject

---

## Day-of-Week Multipliers (Q-Commerce specific)

Monday: 1.00 | Tuesday: 0.95 | Wednesday: 0.97 | Thursday: 1.00
Friday: 1.05 | Saturday: 1.22 | **Sunday: 1.35** (peak grocery day)

---

## Functional Requirements

### FR-1: Worker Registration & Onboarding
- Worker registers with: name, phone (unique login), city, dark store name, zone, platform, avg daily orders, shift type, experience
- System computes risk_score (0–1) and risk_tier (low/medium/high) via AI model
- System returns 3 plan options with AI-adjusted premiums
- Worker selects plan → policy created → coverage active immediately

### FR-2: Policy Management
- Policies last exactly 7 days from creation date
- Worker can renew or upgrade plan
- At most one active policy per worker at any time
- Premium payment recorded on policy creation

### FR-3: Parametric Claim Processing (fully automated)
- When a disruption event is created for a city:
  1. Find all workers in that city with active policies covering that disruption type
  2. For each worker: predict expected earnings (AI model using 14-day history)
  3. Get actual earnings from WorkerActivity table
  4. Calculate income_loss = expected - actual
  5. Run fraud detection (8 rules + score)
  6. If score > 0.75 → flag; if loss < ₹50 → reject; else → approve
  7. Approved claims: trigger mock UPI payout immediately
- End-to-end processing in < 5 seconds for 10 workers

### FR-4: Disruption Simulator (Admin)
- Admin selects: city, disruption type, severity, duration
- System auto-fills expected metric values (rainfall mm, AQI, etc.)
- On trigger: processes all eligible claims and returns live results
- Results show: each worker's name, expected/actual earnings, payout, fraud status, UPI ref

### FR-5: Worker Dashboard
- Real-time coverage status
- 14-day earnings chart (actual vs expected)
- Active disruption alerts with claim status
- Recent claims with payout details

### FR-6: Admin Dashboard
- KPIs: workers, active policies, claims, payouts, loss ratio
- Claims management with fraud review workflow
- Disruption simulator tab
- Analytics: loss ratio trend, fraud detection stats, city breakdown

---

## Seed Data Requirements

Create on startup if DB is empty:
- 10 workers across 5 cities (Hyderabad: 4, Bangalore: 3, Mumbai: 2, Delhi: 1)
- All 3 platforms represented
- All 3 plan types (workers 1–3: premium, 4–7: standard, 8–10: basic)
- 30 days activity history per worker (with 3 disruption days marked)
- 4 past disruption events (all resolved, is_active=False)
- 14 paid claims, 2 rejected claims, 1 fraud-flagged claim from past events

---

## Non-Functional Requirements

- Backend must start with: `uvicorn main:app --reload`
- Frontend must start with: `npm run dev`
- Full stack must start with: `docker-compose up --build`
- API docs auto-generated at: `http://localhost:8000/docs`
- All API routes prefixed with `/api/`
- CORS enabled for `http://localhost:5173`
