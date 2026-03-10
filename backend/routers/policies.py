"""Policies router - policy creation, renewal, and management."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database.connection import get_db
from database.models import Worker, Policy, PremiumPayment, Claim
from schemas.policy import PolicyCreate, PolicyResponse
from services.premium_engine import (
    PLAN_CONFIG, COVERED_DISRUPTIONS, PARAMETRIC_TRIGGERS,
    get_risk_multiplier, CITY_MULTIPLIER, HIGH_RISK_ZONES
)

router = APIRouter(prefix="/api/policies", tags=["policies"])


@router.post("/create", response_model=PolicyResponse)
def create_policy(policy_data: PolicyCreate, db: Session = Depends(get_db)):
    """
    Create a new insurance policy for a worker.
    
    Steps:
    1. Validate worker exists
    2. Check no existing active policy
    3. Compute AI-adjusted premium
    4. Set parametric triggers and covered disruptions by plan type
    5. Set end_date = start_date + 7 days
    6. Create premium payment record
    7. Return policy with computed fields
    """
    # Get worker
    worker = db.query(Worker).filter(Worker.id == policy_data.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Check for existing active policy
    existing_policy = db.query(Policy).filter(
        Policy.worker_id == policy_data.worker_id,
        Policy.status == "active",
        Policy.end_date >= datetime.utcnow().date()
    ).first()
    
    if existing_policy:
        raise HTTPException(
            status_code=400,
            detail="Worker already has an active policy. Please wait for it to expire or cancel it first."
        )
    
    # Get plan configuration
    plan_config = PLAN_CONFIG[policy_data.plan_type]
    
    # Compute adjusted premium
    risk_mult = get_risk_multiplier(worker.risk_score)
    city_mult = CITY_MULTIPLIER.get(worker.city, 1.00)
    
    zone_mult = 1.00
    if worker.city in HIGH_RISK_ZONES:
        if worker.zone_name in HIGH_RISK_ZONES[worker.city]:
            zone_mult = 1.12
    
    adjusted_premium = round(plan_config["weekly"] * risk_mult * city_mult * zone_mult)
    
    # Get parametric triggers and covered disruptions
    triggers = PARAMETRIC_TRIGGERS[policy_data.plan_type]
    covered = COVERED_DISRUPTIONS[policy_data.plan_type]
    
    # Set dates
    start_date = datetime.utcnow().date()
    end_date = start_date + timedelta(days=7)
    
    # Create policy
    policy = Policy(
        worker_id=policy_data.worker_id,
        plan_type=policy_data.plan_type,
        weekly_premium=adjusted_premium,
        weekly_coverage_limit=plan_config["coverage_weekly"],
        daily_coverage_limit=plan_config["coverage_daily"],
        min_orders_threshold=plan_config["min_orders_threshold"],
        parametric_triggers=triggers,
        covered_disruptions=covered,
        status="active",
        start_date=start_date,
        end_date=end_date,
        auto_renew=policy_data.auto_renew
    )
    
    db.add(policy)
    db.commit()
    db.refresh(policy)
    
    # Create premium payment record
    payment = PremiumPayment(
        worker_id=policy_data.worker_id,
        policy_id=policy.id,
        amount=adjusted_premium,
        week_start=start_date,
        week_end=end_date,
        status="paid",
        payment_reference=f"PAY_{policy.id}_{int(datetime.utcnow().timestamp())}",
        paid_at=datetime.utcnow()
    )
    
    db.add(payment)
    db.commit()
    
    # Calculate computed fields
    days_remaining = (end_date - datetime.utcnow().date()).days
    is_valid_today = start_date <= datetime.utcnow().date() <= end_date
    
    # Calculate coverage used this week
    week_start = start_date
    claims = db.query(Claim).filter(
        Claim.worker_id == policy_data.worker_id,
        Claim.policy_id == policy.id,
        Claim.claim_date >= week_start,
        Claim.status.in_(["approved", "paid"])
    ).all()
    coverage_used = sum(c.payout_amount for c in claims)
    
    return PolicyResponse(
        id=policy.id,
        worker_id=policy.worker_id,
        plan_type=policy.plan_type.value,
        weekly_premium=policy.weekly_premium,
        weekly_coverage_limit=policy.weekly_coverage_limit,
        daily_coverage_limit=policy.daily_coverage_limit,
        min_orders_threshold=policy.min_orders_threshold,
        parametric_triggers=policy.parametric_triggers,
        covered_disruptions=policy.covered_disruptions,
        status=policy.status.value,
        start_date=policy.start_date,
        end_date=policy.end_date,
        auto_renew=policy.auto_renew,
        created_at=policy.created_at.isoformat(),
        days_remaining=days_remaining,
        is_valid_today=is_valid_today,
        coverage_used_this_week=coverage_used
    )


@router.get("/worker/{worker_id}", response_model=List[PolicyResponse])
def get_worker_policies(worker_id: int, db: Session = Depends(get_db)):
    """Get all policies for a worker with computed fields."""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    policies = db.query(Policy).filter(
        Policy.worker_id == worker_id
    ).order_by(Policy.created_at.desc()).all()
    
    result = []
    today = datetime.utcnow().date()
    
    for policy in policies:
        # Calculate days remaining
        days_remaining = (policy.end_date - today).days
        is_valid_today = policy.start_date <= today <= policy.end_date
        
        # Calculate coverage used this week
        week_start = policy.start_date
        claims = db.query(Claim).filter(
            Claim.worker_id == worker_id,
            Claim.policy_id == policy.id,
            Claim.claim_date >= week_start,
            Claim.status.in_(["approved", "paid"])
        ).all()
        coverage_used = sum(c.payout_amount for c in claims)
        
        result.append(PolicyResponse(
            id=policy.id,
            worker_id=policy.worker_id,
            plan_type=policy.plan_type.value,
            weekly_premium=policy.weekly_premium,
            weekly_coverage_limit=policy.weekly_coverage_limit,
            daily_coverage_limit=policy.daily_coverage_limit,
            min_orders_threshold=policy.min_orders_threshold,
            parametric_triggers=policy.parametric_triggers,
            covered_disruptions=policy.covered_disruptions,
            status=policy.status.value,
            start_date=policy.start_date,
            end_date=policy.end_date,
            auto_renew=policy.auto_renew,
            created_at=policy.created_at.isoformat(),
            days_remaining=days_remaining,
            is_valid_today=is_valid_today,
            coverage_used_this_week=coverage_used
        ))
    
    return result


@router.post("/{policy_id}/renew", response_model=PolicyResponse)
def renew_policy(policy_id: int, db: Session = Depends(get_db)):
    """
    Renew a policy by extending end_date by 7 days.
    Creates a new premium payment record.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Extend end date by 7 days
    new_end_date = policy.end_date + timedelta(days=7)
    policy.end_date = new_end_date
    policy.status = "active"
    
    # Create new premium payment
    payment = PremiumPayment(
        worker_id=policy.worker_id,
        policy_id=policy.id,
        amount=policy.weekly_premium,
        week_start=policy.end_date - timedelta(days=7),
        week_end=new_end_date,
        status="paid",
        payment_reference=f"RENEW_{policy.id}_{int(datetime.utcnow().timestamp())}",
        paid_at=datetime.utcnow()
    )
    
    db.add(payment)
    db.commit()
    db.refresh(policy)
    
    # Calculate computed fields
    today = datetime.utcnow().date()
    days_remaining = (policy.end_date - today).days
    is_valid_today = policy.start_date <= today <= policy.end_date
    
    # Calculate coverage used this week
    week_start = policy.start_date
    claims = db.query(Claim).filter(
        Claim.worker_id == policy.worker_id,
        Claim.policy_id == policy.id,
        Claim.claim_date >= week_start,
        Claim.status.in_(["approved", "paid"])
    ).all()
    coverage_used = sum(c.payout_amount for c in claims)
    
    return PolicyResponse(
        id=policy.id,
        worker_id=policy.worker_id,
        plan_type=policy.plan_type.value,
        weekly_premium=policy.weekly_premium,
        weekly_coverage_limit=policy.weekly_coverage_limit,
        daily_coverage_limit=policy.daily_coverage_limit,
        min_orders_threshold=policy.min_orders_threshold,
        parametric_triggers=policy.parametric_triggers,
        covered_disruptions=policy.covered_disruptions,
        status=policy.status.value,
        start_date=policy.start_date,
        end_date=policy.end_date,
        auto_renew=policy.auto_renew,
        created_at=policy.created_at.isoformat(),
        days_remaining=days_remaining,
        is_valid_today=is_valid_today,
        coverage_used_this_week=coverage_used
    )
