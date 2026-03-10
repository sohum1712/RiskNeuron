"""
Fraud detection model for insurance claims.
Implements 8 rule-based fraud detection checks.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List


@dataclass
class FraudResult:
    """Result of fraud detection analysis."""
    fraud_score: float
    flags: List[str] = field(default_factory=list)
    recommendation: str = "approve"


class FraudDetector:
    """Rule-based fraud detection system for insurance claims."""
    
    def detect(self, worker, claim_date, income_loss, actual_earnings, disruption, db) -> FraudResult:
        """
        Detect potential fraud using 8 rule-based checks.
        
        Args:
            worker: Worker ORM object
            claim_date: Date of the claim
            income_loss: Calculated income loss amount
            actual_earnings: Actual earnings on claim date
            disruption: DisruptionEvent ORM object
            db: Database session
        
        Returns:
            FraudResult with score, flags, and recommendation
        """
        from database.models import Claim, Policy
        
        fraud_score = 0.0
        flags = []
        
        # Rule 1: NEW_ACCOUNT_CLAIM
        # Worker registered < 7 days ago → +0.30
        days_since_registration = (claim_date - worker.created_at.date()).days
        if days_since_registration < 7:
            fraud_score += 0.30
            flags.append(f"NEW_ACCOUNT_CLAIM: Registered only {days_since_registration} days ago")
        
        # Rule 2: DUPLICATE_CLAIM_SAME_DAY
        # Already claimed for the same date → +0.90
        existing_claim = db.query(Claim).filter(
            Claim.worker_id == worker.id,
            Claim.claim_date == claim_date,
            Claim.id != getattr(self, '_current_claim_id', None)  # Exclude current claim if updating
        ).first()
        
        if existing_claim:
            fraud_score += 0.90
            flags.append("DUPLICATE_CLAIM_SAME_DAY: Multiple claims for same date")
        
        # Rule 3: LOSS_EXCEEDS_HISTORICAL_2_5X
        # Loss > 2.5× worker's daily average → +0.35
        if income_loss > (worker.avg_daily_earnings * 2.5):
            fraud_score += 0.35
            flags.append(f"LOSS_EXCEEDS_HISTORICAL_2_5X: Loss ₹{income_loss:.0f} > 2.5× avg ₹{worker.avg_daily_earnings:.0f}")
        
        # Rule 4: ZERO_EARNINGS_MILD_DISRUPTION
        # ₹0 actual earnings during mild/moderate disruption → +0.42
        if actual_earnings == 0 and disruption.severity in ["mild", "moderate"]:
            fraud_score += 0.42
            flags.append(f"ZERO_EARNINGS_MILD_DISRUPTION: ₹0 earnings during {disruption.severity} disruption")
        
        # Rule 5: CLAIM_IMMEDIATELY_AFTER_POLICY
        # Claim filed < 2 hours after policy created → +0.48
        active_policy = db.query(Policy).filter(
            Policy.worker_id == worker.id,
            Policy.status == "active"
        ).order_by(Policy.created_at.desc()).first()
        
        if active_policy:
            claim_datetime = datetime.combine(claim_date, datetime.min.time())
            hours_since_policy = (claim_datetime - active_policy.created_at).total_seconds() / 3600
            if hours_since_policy < 2:
                fraud_score += 0.48
                flags.append(f"CLAIM_IMMEDIATELY_AFTER_POLICY: Claimed {hours_since_policy:.1f}h after policy activation")
        
        # Rule 6: HIGH_CLAIM_FREQUENCY_30_DAYS
        # > 3 approved claims in last 30 days → +0.20
        thirty_days_ago = claim_date - timedelta(days=30)
        recent_approved_claims = db.query(Claim).filter(
            Claim.worker_id == worker.id,
            Claim.claim_date >= thirty_days_ago,
            Claim.claim_date < claim_date,
            Claim.status.in_(["approved", "paid"])
        ).count()
        
        if recent_approved_claims > 3:
            fraud_score += 0.20
            flags.append(f"HIGH_CLAIM_FREQUENCY_30_DAYS: {recent_approved_claims} approved claims in last 30 days")
        
        # Rule 7: DISRUPTION_CITY_MISMATCH
        # Disruption city ≠ worker city → +0.72
        if disruption.city != worker.city:
            fraud_score += 0.72
            flags.append(f"DISRUPTION_CITY_MISMATCH: Disruption in {disruption.city}, worker in {worker.city}")
        
        # Rule 8: EARNINGS_DURING_STORE_CLOSURE
        # Earnings > ₹100 during dark store closure → +0.60
        if disruption.disruption_type == "dark_store_closure" and actual_earnings > 100:
            fraud_score += 0.60
            flags.append(f"EARNINGS_DURING_STORE_CLOSURE: ₹{actual_earnings:.0f} earnings during store closure")
        
        # Cap fraud score at 1.0
        fraud_score = min(1.0, fraud_score)
        
        # Determine recommendation
        if fraud_score > 0.75:
            recommendation = "reject"
        elif fraud_score > 0.40:
            recommendation = "review"
        else:
            recommendation = "approve"
        
        return FraudResult(
            fraud_score=round(fraud_score, 3),
            flags=flags,
            recommendation=recommendation
        )
