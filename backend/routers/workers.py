"""Workers router - registration, dashboard, and worker management."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database.connection import get_db
from database.models import Worker, Policy, Claim, DisruptionEvent, WorkerActivity
from schemas.worker import WorkerCreate, WorkerResponse, WorkerOnboardingResponse, RiskProfile
from ml.risk_model import RiskModel
from services.premium_engine import compute_plans

router = APIRouter(prefix="/api/workers", tags=["workers"])


@router.post("/register", response_model=WorkerOnboardingResponse)
def register_worker(worker_data: WorkerCreate, db: Session = Depends(get_db)):
    """
    Register a new worker and return onboarding data with risk profile and plan options.
    
    Steps:
    1. Validate phone is unique
    2. Compute risk score and tier using RiskModel
    3. Save worker to database
    4. Generate 3 plan options with AI-adjusted premiums
    5. Return complete onboarding response
    """
    # Check if phone already exists
    existing = db.query(Worker).filter(Worker.phone == worker_data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Compute risk profile
    risk_model = RiskModel()
    risk_score, risk_tier, risk_factors = risk_model.compute({
        "city": worker_data.city,
        "zone_name": worker_data.zone_name,
        "experience_months": worker_data.experience_months,
        "platform": worker_data.platform,
        "avg_daily_orders": worker_data.avg_daily_orders,
        "shift_type": worker_data.shift_type
    })
    
    # Get zone-specific risks
    zone_risks = risk_model.get_zone_risks(worker_data.city, worker_data.zone_name)
    
    # Calculate avg daily earnings (orders × ₹18 per order)
    avg_daily_earnings = worker_data.avg_daily_orders * 18
    
    # Create worker
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
    
    # Generate plan options
    plans = compute_plans(worker)
    
    # Build response
    worker_response = WorkerResponse(
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
    
    risk_profile = RiskProfile(
        risk_score=risk_score,
        risk_tier=risk_tier,
        risk_factors=risk_factors,
        zone_flood_risk=zone_risks["zone_flood_risk"],
        zone_heat_risk=zone_risks["zone_heat_risk"],
        zone_pollution_risk=zone_risks["zone_pollution_risk"]
    )
    
    message = f"Welcome {worker.name}! Your risk profile has been analyzed."
    
    return WorkerOnboardingResponse(
        worker=worker_response,
        risk_profile=risk_profile,
        recommended_plans=plans,
        message=message
    )


@router.get("/{worker_id}/dashboard")
def get_worker_dashboard(worker_id: int, db: Session = Depends(get_db)):
    """
    Get complete dashboard data for a worker in a single request.
    
    Returns:
    - Worker details
    - Active policy (if any)
    - Active disruptions in worker's city
    - This week's stats (earnings, coverage used)
    - 14-day earnings chart data
    - Recent claims (last 5)
    """
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Get active policy
    active_policy = db.query(Policy).filter(
        Policy.worker_id == worker_id,
        Policy.status == "active",
        Policy.end_date >= datetime.utcnow().date()
    ).first()
    
    # Get active disruptions in worker's city
    active_disruptions = db.query(DisruptionEvent).filter(
        DisruptionEvent.city == worker.city,
        DisruptionEvent.is_active == True
    ).all()
    
    # Calculate this week's stats
    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())  # Monday
    
    this_week_activities = db.query(WorkerActivity).filter(
        WorkerActivity.worker_id == worker_id,
        WorkerActivity.date >= week_start,
        WorkerActivity.date <= today
    ).all()
    
    this_week_earnings = sum(a.earnings for a in this_week_activities)
    this_week_orders = sum(a.orders_completed for a in this_week_activities)
    
    # Calculate coverage used this week
    coverage_used = 0
    if active_policy:
        this_week_claims = db.query(Claim).filter(
            Claim.worker_id == worker_id,
            Claim.policy_id == active_policy.id,
            Claim.claim_date >= week_start,
            Claim.status.in_(["approved", "paid"])
        ).all()
        coverage_used = sum(c.payout_amount for c in this_week_claims)
    
    # Get 14-day earnings chart data
    fourteen_days_ago = today - timedelta(days=13)
    earnings_data = db.query(WorkerActivity).filter(
        WorkerActivity.worker_id == worker_id,
        WorkerActivity.date >= fourteen_days_ago,
        WorkerActivity.date <= today
    ).order_by(WorkerActivity.date).all()
    
    earnings_chart = []
    for activity in earnings_data:
        earnings_chart.append({
            "date": activity.date.isoformat(),
            "actual_earnings": activity.earnings,
            "expected_earnings": worker.avg_daily_earnings,  # Simplified
            "is_disruption_day": activity.is_disruption_day
        })
    
    # Get recent claims (last 5)
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
            "disruption_type": disruption.disruption_type.value if disruption else None,
            "expected_earnings": claim.expected_earnings,
            "actual_earnings": claim.actual_earnings,
            "payout_amount": claim.payout_amount,
            "status": claim.status.value,
            "upi_transaction_id": claim.upi_transaction_id
        })
    
    # Build policy response
    policy_data = None
    if active_policy:
        days_remaining = (active_policy.end_date - today).days
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
            "coverage_used_this_week": coverage_used
        }
    
    # Build disruptions data
    disruptions_data = []
    for disruption in active_disruptions:
        disruptions_data.append({
            "id": disruption.id,
            "disruption_type": disruption.disruption_type.value,
            "severity": disruption.severity.value,
            "started_at": disruption.started_at.isoformat()
        })
    
    return {
        "worker": {
            "id": worker.id,
            "name": worker.name,
            "phone": worker.phone,
            "city": worker.city,
            "zone_name": worker.zone_name,
            "platform": worker.platform.value,
            "risk_tier": worker.risk_tier.value
        },
        "active_policy": policy_data,
        "active_disruptions": disruptions_data,
        "this_week_stats": {
            "earnings": this_week_earnings,
            "orders": this_week_orders,
            "coverage_used": coverage_used
        },
        "earnings_chart": earnings_chart,
        "recent_claims": claims_data
    }


@router.get("/", response_model=List[WorkerResponse])
def get_all_workers(db: Session = Depends(get_db)):
    """Get all active workers (admin endpoint)."""
    workers = db.query(Worker).filter(Worker.is_active == True).all()
    
    return [
        WorkerResponse(
            id=w.id,
            name=w.name,
            phone=w.phone,
            city=w.city,
            dark_store_name=w.dark_store_name,
            zone_name=w.zone_name,
            platform=w.platform.value,
            avg_daily_orders=w.avg_daily_orders,
            avg_daily_earnings=w.avg_daily_earnings,
            shift_type=w.shift_type.value,
            experience_months=w.experience_months,
            risk_score=w.risk_score,
            risk_tier=w.risk_tier.value,
            zone_flood_risk=w.zone_flood_risk,
            zone_heat_risk=w.zone_heat_risk,
            zone_pollution_risk=w.zone_pollution_risk,
            upi_id=w.upi_id,
            created_at=w.created_at.isoformat(),
            is_active=w.is_active
        )
        for w in workers
    ]


@router.get("/{worker_id}", response_model=WorkerResponse)
def get_worker(worker_id: int, db: Session = Depends(get_db)):
    """Get a single worker by ID."""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
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
