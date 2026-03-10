"""Analytics router - KPIs and business intelligence."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict

from database.connection import get_db
from database.models import (
    Worker, Policy, Claim, DisruptionEvent, PremiumPayment
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Get comprehensive analytics overview for admin dashboard.
    
    Returns:
    - Total workers, active policies, active disruptions
    - Claims and payouts this week
    - Premiums collected this week
    - Loss ratio (payouts / premiums)
    - Fraud detection stats
    - City breakdown
    - 8-week trend data
    """
    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())  # Monday
    
    # Basic counts
    total_workers = db.query(func.count(Worker.id)).filter(
        Worker.is_active == True
    ).scalar()
    
    active_policies = db.query(func.count(Policy.id)).filter(
        Policy.status == "active",
        Policy.end_date >= today
    ).scalar()
    
    active_disruptions = db.query(func.count(DisruptionEvent.id)).filter(
        DisruptionEvent.is_active == True
    ).scalar()
    
    # This week's claims
    claims_this_week = db.query(Claim).filter(
        Claim.claim_date >= week_start
    ).all()
    
    claims_count = len(claims_this_week)
    payouts_this_week = sum(
        c.payout_amount for c in claims_this_week
        if c.status.value in ["approved", "paid"]
    )
    
    # This week's premiums
    premiums_this_week = db.query(func.sum(PremiumPayment.amount)).filter(
        PremiumPayment.week_start >= week_start
    ).scalar() or 0
    
    # Loss ratio
    loss_ratio = 0
    if premiums_this_week > 0:
        loss_ratio = round((payouts_this_week / premiums_this_week) * 100, 2)
    
    # Fraud detection stats
    fraud_caught_this_week = len([
        c for c in claims_this_week
        if c.status.value == "flagged_fraud"
    ])
    
    fraud_amount_saved = sum(
        c.income_loss for c in claims_this_week
        if c.status.value == "flagged_fraud"
    )
    
    # City breakdown
    cities = ["Hyderabad", "Bangalore", "Mumbai", "Delhi", "Chennai", "Pune"]
    city_stats = []
    
    for city in cities:
        city_workers = db.query(Worker).filter(
            Worker.city == city,
            Worker.is_active == True
        ).all()
        
        city_claims = db.query(Claim).join(Worker).filter(
            Worker.city == city,
            Claim.claim_date >= week_start
        ).all()
        
        # Calculate average risk
        avg_risk = 0
        if city_workers:
            avg_risk = sum(w.risk_score for w in city_workers) / len(city_workers)
        
        # Determine risk tier
        if avg_risk < 0.35:
            risk_tier = "low"
        elif avg_risk < 0.65:
            risk_tier = "medium"
        else:
            risk_tier = "high"
        
        city_stats.append({
            "city": city,
            "workers": len(city_workers),
            "claims_this_week": len(city_claims),
            "avg_risk_score": round(avg_risk, 2),
            "risk_tier": risk_tier
        })
    
    # 8-week trend
    weekly_trend = []
    for i in range(8):
        week_end = today - timedelta(weeks=i)
        week_start_date = week_end - timedelta(days=6)
        
        week_premiums = db.query(func.sum(PremiumPayment.amount)).filter(
            PremiumPayment.week_start >= week_start_date,
            PremiumPayment.week_start <= week_end
        ).scalar() or 0
        
        week_claims = db.query(Claim).filter(
            Claim.claim_date >= week_start_date,
            Claim.claim_date <= week_end,
            Claim.status.in_(["approved", "paid"])
        ).all()
        
        week_payouts = sum(c.payout_amount for c in week_claims)
        
        weekly_trend.append({
            "week_start": week_start_date.isoformat(),
            "week_end": week_end.isoformat(),
            "premiums": round(week_premiums, 2),
            "payouts": round(week_payouts, 2),
            "claims": len(week_claims)
        })
    
    # Reverse to show oldest to newest
    weekly_trend.reverse()
    
    return {
        "total_workers": total_workers,
        "active_policies": active_policies,
        "active_disruptions": active_disruptions,
        "claims_this_week": claims_count,
        "payouts_this_week": round(payouts_this_week, 2),
        "premiums_this_week": round(premiums_this_week, 2),
        "loss_ratio": loss_ratio,
        "fraud_caught_this_week": fraud_caught_this_week,
        "fraud_amount_saved": round(fraud_amount_saved, 2),
        "city_stats": city_stats,
        "weekly_trend": weekly_trend
    }
