from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class ClaimResponse(BaseModel):
    id: int
    worker_id: int
    policy_id: int
    disruption_event_id: int
    claim_date: date
    expected_orders: Optional[int]
    actual_orders: Optional[int]
    expected_earnings: float
    actual_earnings: float
    income_loss: float
    disruption_impact_factor: float
    payout_amount: float
    status: str
    fraud_score: float
    fraud_flags: List[str]
    auto_processed: bool
    rejection_reason: Optional[str]
    processed_at: str
    paid_at: Optional[str]
    payment_reference: Optional[str]
    upi_transaction_id: Optional[str]
    worker_name: Optional[str] = None
    disruption_type: Optional[str] = None

    class Config:
        from_attributes = True


class ClaimSummary(BaseModel):
    worker_name: str
    platform: str
    zone: str
    expected_earnings: float
    actual_earnings: float
    payout: float
    status: str
    fraud_flags: List[str]
    upi_transaction_id: Optional[str] = None
