"""
Claim evaluation engine for parametric insurance.
Implements the full 10-step automated claim processing algorithm.
"""

from datetime import datetime
from typing import List

from ml.income_model import predict_expected_earnings, get_impact_factor, DAY_MULTIPLIERS
from ml.fraud_model import FraudDetector
from services.payout_service import process_payout


def evaluate_claim(worker, disruption, policy, db):
    """
    Evaluate and process a parametric insurance claim.
    
    Implements the full 10-step algorithm from DESIGN.md:
    1. Get worker's activity history (last 30 days)
    2. Predict expected earnings using AI model
    3. Calculate expected orders based on day-of-week
    4. Get actual earnings from WorkerActivity (or estimate from impact factor)
    5. Calculate income loss
    6. Calculate payout amount (capped by daily limit)
    7. Run fraud detection (8 rules)
    8. Determine claim status based on fraud score and loss amount
    9. Save claim to database
    10. If approved, trigger payout service
    
    Args:
        worker: Worker ORM object
        disruption: DisruptionEvent ORM object
        policy: Policy ORM object
        db: Database session
    
    Returns:
        Claim ORM object (saved to database)
    """
    from database.models import Claim, WorkerActivity
    
    # Step 1: Get activity history (last 30 days)
    claim_date = disruption.started_at.date()
    activity_history = db.query(WorkerActivity).filter(
        WorkerActivity.worker_id == worker.id
    ).order_by(WorkerActivity.date.desc()).limit(30).all()
    
    # Step 2: Predict expected earnings
    expected_earnings = predict_expected_earnings(worker, activity_history, claim_date)
    
    # Step 3: Calculate expected orders based on day-of-week multiplier
    weekday = claim_date.weekday()
    day_multiplier = DAY_MULTIPLIERS.get(weekday, 1.0)
    expected_orders = int(worker.avg_daily_orders * day_multiplier)
    
    # Step 4: Get actual earnings from WorkerActivity
    actual_activity = db.query(WorkerActivity).filter(
        WorkerActivity.worker_id == worker.id,
        WorkerActivity.date == claim_date
    ).first()
    
    if actual_activity:
        actual_earnings = actual_activity.earnings
        actual_orders = actual_activity.orders_completed
    else:
        # No activity record - estimate using impact factor
        impact_factor = get_impact_factor(
            disruption.disruption_type,
            disruption.severity
        )
        actual_earnings = expected_earnings * (1 - impact_factor)
        actual_orders = int(expected_orders * (1 - impact_factor))
    
    # Step 5: Calculate income loss
    income_loss = max(0, expected_earnings - actual_earnings)
    
    # Step 6: Calculate payout amount (capped by daily coverage limit)
    payout_amount = min(income_loss, policy.daily_coverage_limit)
    
    # Step 7: Run fraud detection
    fraud_detector = FraudDetector()
    fraud_result = fraud_detector.detect(
        worker=worker,
        claim_date=claim_date,
        income_loss=income_loss,
        actual_earnings=actual_earnings,
        disruption=disruption,
        db=db
    )
    
    # Step 8: Determine claim status
    if fraud_result.fraud_score > 0.75:
        # Auto-reject high fraud score
        status = "flagged_fraud"
        payout_amount = 0
        rejection_reason = "High fraud score: " + "; ".join(fraud_result.flags)
    elif income_loss < 50:
        # Reject claims with minimal loss
        status = "rejected"
        payout_amount = 0
        rejection_reason = f"Income loss ₹{income_loss:.2f} below ₹50 minimum threshold"
    elif fraud_result.fraud_score > 0.40:
        # Flag for manual review
        status = "flagged_fraud"
        payout_amount = 0  # Hold payout until review
        rejection_reason = None
    else:
        # Approve claim
        status = "approved"
        rejection_reason = None
    
    # Step 9: Create and save claim
    claim = Claim(
        worker_id=worker.id,
        policy_id=policy.id,
        disruption_event_id=disruption.id,
        claim_date=claim_date,
        expected_orders=expected_orders,
        actual_orders=actual_orders,
        expected_earnings=round(expected_earnings, 2),
        actual_earnings=round(actual_earnings, 2),
        income_loss=round(income_loss, 2),
        disruption_impact_factor=get_impact_factor(
            disruption.disruption_type,
            disruption.severity
        ),
        payout_amount=round(payout_amount, 2),
        status=status,
        fraud_score=fraud_result.fraud_score,
        fraud_flags=fraud_result.flags,
        auto_processed=True,
        rejection_reason=rejection_reason,
        processed_at=datetime.utcnow()
    )
    
    db.add(claim)
    db.commit()
    db.refresh(claim)
    
    # Step 10: If approved, trigger payout
    if status == "approved" and payout_amount > 0:
        payout_result = process_payout(claim, worker, db)
        
        # If payout fails, we keep the claim as "approved" but without payment details
        # The payout can be retried later via the /claims/{id}/payout endpoint
        if not payout_result["success"]:
            # Log the failure but don't change claim status
            print(f"Payout failed for claim {claim.id}: {payout_result['message']}")
    
    return claim
