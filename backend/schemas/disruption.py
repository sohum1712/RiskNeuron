from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime
from schemas.claim import ClaimSummary


class DisruptionSimulateRequest(BaseModel):
    city: Literal["Mumbai", "Delhi", "Chennai", "Hyderabad", "Pune", "Bangalore"]
    zone_name: Optional[str] = None
    disruption_type: Literal[
        "heavy_rain",
        "flood",
        "extreme_heat",
        "severe_pollution",
        "traffic_shutdown",
        "curfew",
        "local_strike",
        "dark_store_closure",
        "app_outage"
    ]
    severity: Literal["mild", "moderate", "severe", "extreme"]
    duration_hours: float = Field(default=4.0, gt=0)
    rainfall_mm: Optional[float] = Field(None, ge=0)
    aqi: Optional[float] = Field(None, ge=0)
    traffic_index: Optional[float] = Field(None, ge=0, le=10)
    temperature_celsius: Optional[float] = Field(None, ge=0)


class DisruptionResponse(BaseModel):
    id: int
    city: str
    zone_name: Optional[str]
    disruption_type: str
    severity: str
    rainfall_mm: Optional[float]
    aqi: Optional[float]
    traffic_index: Optional[float]
    temperature_celsius: Optional[float]
    started_at: datetime
    ended_at: Optional[datetime]
    duration_hours: Optional[float]
    is_active: bool
    source: str
    dark_stores_closed: int
    estimated_order_drop_pct: float
    affected_workers_count: int
    total_claims_triggered: int
    total_payout_amount: float
    created_at: datetime

    class Config:
        from_attributes = True


class SimulationResult(BaseModel):
    disruption_event: DisruptionResponse
    affected_workers: int
    policies_evaluated: int
    claims_approved: int
    claims_rejected: int
    claims_fraud_flagged: int
    total_payout: float
    processing_time_seconds: float
    claim_details: List[ClaimSummary]
