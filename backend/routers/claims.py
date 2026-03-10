"""Claims router - claim management, payout, and review."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database.connection import get_db
from database.models import Claim, Worker, DisruptionEvent
from schemas.claim import ClaimResponse
from services.payout_service import process_payout

router = APIRouter(prefix="/api/claims", tags=["claims"])


@router.get("/", response_model=List[ClaimResponse])
def get_claims(
    status: Optional[str] = Query(None),
    worker_id: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Get claims with optional filters.
    Includes worker_name and disruption_type in response.
    """
    query = db.query(Claim)
    
    if status:
        query = query.filter(Claim.status == status)
    
    if worker_id:
        query = query.filter(Claim.worker_id == worker_id)
    
    claims = query.order_by(Claim.claim_date.desc()).limit(limit).all()
    
    result = []
    for claim in claims:
        # Get worker name
        worker = db.query(Worker).filter(Worker.id == claim.worker_id).first()
        worker_name = worker.name if worker else None
        
        # Get disruption type
        disruption = db.query(DisruptionEvent).filter(
            DisruptionEvent.id == claim.disruption_event_id
        ).first()
        disruption_type = disruption.disruption_type.value if disruption else None
        
        result.append(ClaimResponse(
            id=claim.id,
            worker_id=claim.worker_id,
            policy_id=claim.policy_id,
            disruption_event_id=claim.disruption_event_id,
            claim_date=claim.claim_date,
            expected_orders=claim.expected_orders,
            actual_orders=claim.actual_orders,
            expected_earnings=claim.expected_earnings,
            actual_earnings=claim.actual_earnings,
            income_loss=claim.income_loss,
            disruption_impact_factor=claim.disruption_impact_factor,
            payout_amount=claim.payout_amount,
            status=claim.status.value,
            fraud_score=claim.fraud_score,
            fraud_flags=claim.fraud_flags,
            auto_processed=claim.auto_processed,
            rejection_reason=claim.rejection_reason,
            processed_at=claim.processed_at.isoformat(),
            paid_at=claim.paid_at.isoformat() if claim.paid_at else None,
            payment_reference=claim.payment_reference,
            upi_transaction_id=claim.upi_transaction_id,
            worker_name=worker_name,
            disruption_type=disruption_type
        ))
    
    return result


@router.get("/worker/{worker_id}", response_model=List[ClaimResponse])
def get_worker_claims(worker_id: int, db: Session = Depends(get_db)):
    """Get all claims for a specific worker."""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    claims = db.query(Claim).filter(
        Claim.worker_id == worker_id
    ).order_by(Claim.claim_date.desc()).all()
    
    result = []
    for claim in claims:
        # Get disruption type
        disruption = db.query(DisruptionEvent).filter(
            DisruptionEvent.id == claim.disruption_event_id
        ).first()
        disruption_type = disruption.disruption_type.value if disruption else None
        
        result.append(ClaimResponse(
            id=claim.id,
            worker_id=claim.worker_id,
            policy_id=claim.policy_id,
            disruption_event_id=claim.disruption_event_id,
            claim_date=claim.claim_date,
            expected_orders=claim.expected_orders,
            actual_orders=claim.actual_orders,
            expected_earnings=claim.expected_earnings,
            actual_earnings=claim.actual_earnings,
            income_loss=claim.income_loss,
            disruption_impact_factor=claim.disruption_impact_factor,
            payout_amount=claim.payout_amount,
            status=claim.status.value,
            fraud_score=claim.fraud_score,
            fraud_flags=claim.fraud_flags,
            auto_processed=claim.auto_processed,
            rejection_reason=claim.rejection_reason,
            processed_at=claim.processed_at.isoformat(),
            paid_at=claim.paid_at.isoformat() if claim.paid_at else None,
            payment_reference=claim.payment_reference,
            upi_transaction_id=claim.upi_transaction_id,
            worker_name=worker.name,
            disruption_type=disruption_type
        ))
    
    return result


@router.post("/{claim_id}/payout")
def trigger_payout(claim_id: int, db: Session = Depends(get_db)):
    """
    Trigger payout for an approved claim.
    Used for manual payout retry or processing claims that were approved but not paid.
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if claim.status.value not in ["approved", "paid"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot process payout for claim with status: {claim.status.value}"
        )
    
    if claim.status.value == "paid" and claim.upi_transaction_id:
        raise HTTPException(
            status_code=400,
            detail="Claim has already been paid"
        )
    
    # Get worker
    worker = db.query(Worker).filter(Worker.id == claim.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Process payout
    payout_result = process_payout(claim, worker, db)
    
    if not payout_result["success"]:
        raise HTTPException(status_code=500, detail=payout_result["message"])
    
    return {
        "success": True,
        "message": f"Payout of ₹{payout_result['amount']} processed successfully",
        "transaction_id": payout_result["transaction_id"],
        "upi_reference": payout_result["upi_reference"],
        "claim_id": claim.id
    }


@router.post("/{claim_id}/review")
def review_claim(
    claim_id: int,
    action: str = Query(..., pattern="^(approve|reject)$"),
    reason: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint to manually approve or reject a fraud-flagged claim.
    
    Args:
        claim_id: ID of the claim to review
        action: "approve" or "reject"
        reason: Optional reason for the decision
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if claim.status.value not in ["flagged_fraud", "pending"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot review claim with status: {claim.status.value}"
        )
    
    if action == "approve":
        claim.status = "approved"
        claim.auto_processed = False
        
        # Restore payout amount if it was zeroed
        if claim.payout_amount == 0 and claim.income_loss > 0:
            # Get policy to check daily limit
            from database.models import Policy
            policy = db.query(Policy).filter(Policy.id == claim.policy_id).first()
            if policy:
                claim.payout_amount = min(claim.income_loss, policy.daily_coverage_limit)
        
        db.commit()
        
        # Trigger payout
        worker = db.query(Worker).filter(Worker.id == claim.worker_id).first()
        if worker and claim.payout_amount > 0:
            payout_result = process_payout(claim, worker, db)
            
            return {
                "success": True,
                "message": "Claim approved and payout processed",
                "claim_id": claim.id,
                "payout_amount": claim.payout_amount,
                "transaction_id": payout_result.get("transaction_id"),
                "upi_reference": payout_result.get("upi_reference")
            }
        
        return {
            "success": True,
            "message": "Claim approved",
            "claim_id": claim.id,
            "payout_amount": claim.payout_amount
        }
    
    else:  # reject
        claim.status = "rejected"
        claim.payout_amount = 0
        claim.auto_processed = False
        claim.rejection_reason = reason or "Manually rejected by admin after fraud review"
        db.commit()
        
        return {
            "success": True,
            "message": "Claim rejected",
            "claim_id": claim.id,
            "reason": claim.rejection_reason
        }
