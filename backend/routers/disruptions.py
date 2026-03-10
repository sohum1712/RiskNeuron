"""Disruptions router - simulation, active disruptions, and history."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import time

from database.connection import get_db
from database.models import DisruptionEvent, Worker, Policy
from schemas.disruption import (
    DisruptionSimulateRequest,
    DisruptionResponse,
    SimulationResult
)
from schemas.claim import ClaimSummary
from services.claim_engine import evaluate_claim

router = APIRouter(prefix="/api/disruptions", tags=["disruptions"])


@router.post("/simulate", response_model=SimulationResult)
def simulate_disruption(request: DisruptionSimulateRequest, db: Session = Depends(get_db)):
    """
    Main demo endpoint: Simulate a disruption and process all eligible claims.
    
    Algorithm:
    1. Create DisruptionEvent (is_active=True)
    2. Find all workers in the city (optionally filtered by zone)
    3. For each worker with active policy covering this disruption type:
       a. Call claim_engine.evaluate_claim()
       b. Claim engine handles fraud detection and payout
    4. Aggregate statistics
    5. Update disruption event with totals
    6. Return SimulationResult with all claim details
    """
    start_time = time.time()
    
    # Create disruption event
    disruption = DisruptionEvent(
        city=request.city,
        zone_name=request.zone_name,
        disruption_type=request.disruption_type,
        severity=request.severity,
        rainfall_mm=request.rainfall_mm,
        aqi=request.aqi,
        traffic_index=request.traffic_index,
        temperature_celsius=request.temperature_celsius,
        started_at=datetime.utcnow(),
        duration_hours=request.duration_hours,
        is_active=True,
        source="simulated"
    )
    
    db.add(disruption)
    db.commit()
    db.refresh(disruption)
    
    # Find workers in the city
    workers_query = db.query(Worker).filter(
        Worker.city == request.city,
        Worker.is_active == True
    )
    
    # Filter by zone if specified
    if request.zone_name:
        workers_query = workers_query.filter(Worker.zone_name == request.zone_name)
    
    workers = workers_query.all()
    
    # Track statistics
    affected_workers = 0
    policies_evaluated = 0
    claims_approved = 0
    claims_rejected = 0
    claims_fraud_flagged = 0
    total_payout = 0.0
    claim_details = []
    
    # Process each worker
    for worker in workers:
        # Get active policy
        active_policy = db.query(Policy).filter(
            Policy.worker_id == worker.id,
            Policy.status == "active",
            Policy.end_date >= datetime.utcnow().date()
        ).first()
        
        if not active_policy:
            continue
        
        # Check if policy covers this disruption type
        disruption_type_str = request.disruption_type
        if disruption_type_str not in active_policy.covered_disruptions:
            continue
        
        # Worker is affected and has coverage
        affected_workers += 1
        policies_evaluated += 1
        
        # Evaluate claim using claim engine
        claim = evaluate_claim(worker, disruption, active_policy, db)
        
        # Update statistics
        if claim.status.value == "approved" or claim.status.value == "paid":
            claims_approved += 1
            total_payout += claim.payout_amount
        elif claim.status.value == "flagged_fraud":
            claims_fraud_flagged += 1
        elif claim.status.value == "rejected":
            claims_rejected += 1
        
        # Add to claim details
        claim_summary = ClaimSummary(
            worker_name=worker.name,
            platform=worker.platform.value,
            zone=worker.zone_name,
            expected_earnings=claim.expected_earnings,
            actual_earnings=claim.actual_earnings,
            payout=claim.payout_amount,
            status=claim.status.value,
            fraud_flags=claim.fraud_flags,
            upi_transaction_id=claim.upi_transaction_id
        )
        claim_details.append(claim_summary)
    
    # Update disruption event with totals
    disruption.affected_workers_count = affected_workers
    disruption.total_claims_triggered = policies_evaluated
    disruption.total_payout_amount = total_payout
    db.commit()
    db.refresh(disruption)
    
    # Calculate processing time
    processing_time = time.time() - start_time
    
    # Build response
    disruption_response = DisruptionResponse(
        id=disruption.id,
        city=disruption.city,
        zone_name=disruption.zone_name,
        disruption_type=disruption.disruption_type.value,
        severity=disruption.severity.value,
        rainfall_mm=disruption.rainfall_mm,
        aqi=disruption.aqi,
        traffic_index=disruption.traffic_index,
        temperature_celsius=disruption.temperature_celsius,
        started_at=disruption.started_at,
        ended_at=disruption.ended_at,
        duration_hours=disruption.duration_hours,
        is_active=disruption.is_active,
        source=disruption.source,
        dark_stores_closed=disruption.dark_stores_closed,
        estimated_order_drop_pct=disruption.estimated_order_drop_pct,
        affected_workers_count=disruption.affected_workers_count,
        total_claims_triggered=disruption.total_claims_triggered,
        total_payout_amount=disruption.total_payout_amount,
        created_at=disruption.created_at
    )
    
    return SimulationResult(
        disruption_event=disruption_response,
        affected_workers=affected_workers,
        policies_evaluated=policies_evaluated,
        claims_approved=claims_approved,
        claims_rejected=claims_rejected,
        claims_fraud_flagged=claims_fraud_flagged,
        total_payout=round(total_payout, 2),
        processing_time_seconds=round(processing_time, 2),
        claim_details=claim_details
    )


@router.get("/active", response_model=List[DisruptionResponse])
def get_active_disruptions(
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all active disruptions, optionally filtered by city."""
    query = db.query(DisruptionEvent).filter(DisruptionEvent.is_active == True)
    
    if city:
        query = query.filter(DisruptionEvent.city == city)
    
    disruptions = query.order_by(DisruptionEvent.started_at.desc()).all()
    
    return [
        DisruptionResponse(
            id=d.id,
            city=d.city,
            zone_name=d.zone_name,
            disruption_type=d.disruption_type.value,
            severity=d.severity.value,
            rainfall_mm=d.rainfall_mm,
            aqi=d.aqi,
            traffic_index=d.traffic_index,
            temperature_celsius=d.temperature_celsius,
            started_at=d.started_at,
            ended_at=d.ended_at,
            duration_hours=d.duration_hours,
            is_active=d.is_active,
            source=d.source,
            dark_stores_closed=d.dark_stores_closed,
            estimated_order_drop_pct=d.estimated_order_drop_pct,
            affected_workers_count=d.affected_workers_count,
            total_claims_triggered=d.total_claims_triggered,
            total_payout_amount=d.total_payout_amount,
            created_at=d.created_at
        )
        for d in disruptions
    ]


@router.get("/history", response_model=List[DisruptionResponse])
def get_disruption_history(
    city: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get historical disruptions, optionally filtered by city."""
    query = db.query(DisruptionEvent)
    
    if city:
        query = query.filter(DisruptionEvent.city == city)
    
    disruptions = query.order_by(
        DisruptionEvent.created_at.desc()
    ).limit(limit).all()
    
    return [
        DisruptionResponse(
            id=d.id,
            city=d.city,
            zone_name=d.zone_name,
            disruption_type=d.disruption_type.value,
            severity=d.severity.value,
            rainfall_mm=d.rainfall_mm,
            aqi=d.aqi,
            traffic_index=d.traffic_index,
            temperature_celsius=d.temperature_celsius,
            started_at=d.started_at,
            ended_at=d.ended_at,
            duration_hours=d.duration_hours,
            is_active=d.is_active,
            source=d.source,
            dark_stores_closed=d.dark_stores_closed,
            estimated_order_drop_pct=d.estimated_order_drop_pct,
            affected_workers_count=d.affected_workers_count,
            total_claims_triggered=d.total_claims_triggered,
            total_payout_amount=d.total_payout_amount,
            created_at=d.created_at
        )
        for d in disruptions
    ]
