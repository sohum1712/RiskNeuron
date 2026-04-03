"""Workers router - registration, login, dashboard, and worker management."""

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database.connection import get_db
from database.models import Worker, Policy, Claim, DisruptionEvent, WorkerActivity
from schemas.worker import WorkerCreate, WorkerResponse, WorkerOnboardingResponse, RiskProfile
from ml.risk_model import RiskModel
from services.premium_engine import compute_plans

router = APIRouter(prefix="/api/workers", tags=["workers"])


# ─── IMPORTANT: specific string routes MUST come before /{worker_id} ─────────

@router.post("/login", response_model=WorkerResponse)
def login_worker(phone: str, db: Session = Depends(get_db)):
    """Login by phone number. Returns full worker profile."""
    worker = db.query(Worker).filter(
        Worker.phone == phone,
        Worker.is_active == True
    ).first()
    if not worker:
        raise HTTPException(
            status_code=404,
            detail="No account found with this phone number. Please register first."
        )
    return _worker_to_response(worker)


@router.post("/register", response_model=WorkerOnboardingResponse)
def register_worker(worker_data: WorkerCreate, db: Session = Depends(get_db)):
    """
    Register a new worker and return onboarding data with risk profile and plan options.
    """
    existing = db.query(Worker).filter(Worker.phone == worker_data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    risk_model = RiskModel()
    risk_score, risk_tier, risk_factors = risk_model.compute({
        "city": worker_data.city,
        "zone_name": worker_data.zone_name,
        "experience_months": worker_data.experience_months,
        "platform": worker_data.platform,
        "avg_daily_orders": worker_data.avg_daily_orders,
        "shift_type": worker_data.shift_type
    })

    zone_risks = risk_model.get_zone_risks(worker_data.city, worker_data.zone_name)
    avg_daily_earnings = worker_data.avg_daily_orders * 18

    worker = Worker(
        name=worker_data.name,
        phone=worker_data.phone,
        city=worker_data.city,
        dark_store_name=worker_data.dark_store_name,
        zone_name=worker_data.zone_name,
        platform=worker_data.platform,
        avg_daily_orders=worker_data.avg_daily_orders,
        avg_daily_earnings=avg_daily_earnings,
        shift_type=worker_data.shift_type,
        experience_months=worker_data.experience_months,
        risk_score=risk_score,
        risk_tier=risk_tier,
        zone_flood_risk=zone_risks["zone_flood_risk"],
        zone_heat_risk=zone_risks["zone_heat_risk"],
        zone_pollution_risk=zone_risks["zone_pollution_risk"],
        upi_id=worker_data.upi_id
    )

    db.add(worker)
    db.commit()
    db.refresh(worker)

    plans = compute_plans(worker)

    risk_profile = RiskProfile(
        risk_score=risk_score,
        risk_tier=risk_tier,
        risk_factors=risk_factors,
        zone_flood_risk=zone_risks["zone_flood_risk"],
        zone_heat_risk=zone_risks["zone_heat_risk"],
        zone_pollution_risk=zone_risks["zone_pollution_risk"]
    )

    return WorkerOnboardingResponse(
        worker=_worker_to_response(worker),
        risk_profile=risk_profile,
        recommended_plans=plans,
        message=f"Welcome {worker.name}! Your risk profile has been analyzed."
    )


@router.get("/", response_model=List[WorkerResponse])
def get_all_workers(db: Session = Depends(get_db)):
    """Get all active workers (admin endpoint)."""
    workers = db.query(Worker).filter(Worker.is_active == True).all()
    return [_worker_to_response(w) for w in workers]


# ─── Routes with path params come LAST ───────────────────────────────────────

@router.get("/{worker_id}/dashboard")
def get_worker_dashboard(worker_id: int, db: Session = Depends(get_db)):
    """Get complete dashboard data for a worker in a single request."""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    active_policy = db.query(Policy).filter(
        Policy.worker_id == worker_id,
        Policy.status == "active",
        Policy.end_date >= datetime.utcnow().date()
    ).first()

    active_disruptions = db.query(DisruptionEvent).filter(
        DisruptionEvent.city == worker.city,
        DisruptionEvent.is_active == True
    ).all()

    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())

    this_week_activities = db.query(WorkerActivity).filter(
        WorkerActivity.worker_id == worker_id,
        WorkerActivity.date >= week_start,
        WorkerActivity.date <= today
    ).all()

    this_week_earnings = sum(a.earnings for a in this_week_activities)
    this_week_orders = sum(a.orders_completed for a in this_week_activities)

    coverage_used = 0.0
    if active_policy:
        this_week_claims = db.query(Claim).filter(
            Claim.worker_id == worker_id,
            Claim.policy_id == active_policy.id,
            Claim.claim_date >= week_start,
            Claim.status.in_(["approved", "paid"])
        ).all()
        coverage_used = sum(c.payout_amount for c in this_week_claims)

    fourteen_days_ago = today - timedelta(days=13)
    earnings_data = db.query(WorkerActivity).filter(
        WorkerActivity.worker_id == worker_id,
        WorkerActivity.date >= fourteen_days_ago,
        WorkerActivity.date <= today
    ).order_by(WorkerActivity.date).all()

    earnings_chart = [
        {
            "date": a.date.isoformat(),
            "actual": a.earnings,
            "expected": worker.avg_daily_earnings,
            "actual_earnings": a.earnings,
            "expected_earnings": worker.avg_daily_earnings,
            "isDisruption": a.is_disruption_day,
            "is_disruption_day": a.is_disruption_day,
        }
        for a in earnings_data
    ]

    recent_claims = db.query(Claim).filter(
        Claim.worker_id == worker_id
    ).order_by(Claim.claim_date.desc()).limit(5).all()

    claims_data = []
    for claim in recent_claims:
        disruption = db.query(DisruptionEvent).filter(
            DisruptionEvent.id == claim.disruption_event_id
        ).first()
        claims_data.append({
            "id": claim.id,
            "claim_date": claim.claim_date.isoformat(),
            "disruption_type": disruption.disruption_type.value if disruption else "unknown",
            "expected_earnings": claim.expected_earnings,
            "actual_earnings": claim.actual_earnings,
            "payout_amount": claim.payout_amount,
            "status": claim.status.value,
            "upi_transaction_id": claim.upi_transaction_id,
        })

    policy_data = None
    if active_policy:
        days_remaining = max((active_policy.end_date - today).days, 0)
        policy_data = {
            "id": active_policy.id,
            "plan_type": active_policy.plan_type.value,
            "weekly_premium": active_policy.weekly_premium,
            "weekly_coverage_limit": active_policy.weekly_coverage_limit,
            "daily_coverage_limit": active_policy.daily_coverage_limit,
            "covered_disruptions": active_policy.covered_disruptions,
            "start_date": active_policy.start_date.isoformat(),
            "end_date": active_policy.end_date.isoformat(),
            "days_remaining": days_remaining,
            "auto_renew": active_policy.auto_renew,
            "coverage_used_this_week": coverage_used,
        }

    return {
        "worker": {
            "id": worker.id,
            "name": worker.name,
            "phone": worker.phone,
            "city": worker.city,
            "dark_store_name": worker.dark_store_name,
            "zone_name": worker.zone_name,
            "platform": worker.platform.value,
            "shift_type": worker.shift_type.value,
            "avg_daily_orders": worker.avg_daily_orders,
            "avg_daily_earnings": worker.avg_daily_earnings,
            "experience_months": worker.experience_months,
            "risk_score": worker.risk_score,
            "risk_tier": worker.risk_tier.value,
            "upi_id": worker.upi_id,
        },
        "active_policy": policy_data,
        "active_disruptions": [
            {
                "id": d.id,
                "disruption_type": d.disruption_type.value,
                "severity": d.severity.value,
                "city": d.city,
                "started_at": d.started_at.isoformat(),
            }
            for d in active_disruptions
        ],
        "this_week_stats": {
            "earnings": this_week_earnings,
            "orders": this_week_orders,
            "coverage_used": coverage_used,
        },
        "earnings_chart": earnings_chart,
        "recent_claims": claims_data,
    }


@router.get("/{worker_id}", response_model=WorkerResponse)
def get_worker(worker_id: int, db: Session = Depends(get_db)):
    """Get a single worker by ID."""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return _worker_to_response(worker)


# ─── Helper ───────────────────────────────────────────────────────────────────

def _worker_to_response(worker: Worker) -> WorkerResponse:
    return WorkerResponse(
        id=worker.id,
        name=worker.name,
        phone=worker.phone,
        city=worker.city,
        dark_store_name=worker.dark_store_name,
        zone_name=worker.zone_name,
        platform=worker.platform.value,
        avg_daily_orders=worker.avg_daily_orders,
        avg_daily_earnings=worker.avg_daily_earnings,
        shift_type=worker.shift_type.value,
        experience_months=worker.experience_months,
        risk_score=worker.risk_score,
        risk_tier=worker.risk_tier.value,
        zone_flood_risk=worker.zone_flood_risk,
        zone_heat_risk=worker.zone_heat_risk,
        zone_pollution_risk=worker.zone_pollution_risk,
        upi_id=worker.upi_id,
        created_at=worker.created_at.isoformat(),
        is_active=worker.is_active
    )
