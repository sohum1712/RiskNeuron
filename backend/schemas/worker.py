from pydantic import BaseModel, Field, field_validator
from typing import List, Literal, Optional


class WorkerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=10)
    city: Literal["Mumbai", "Delhi", "Chennai", "Hyderabad", "Pune", "Bangalore"]
    dark_store_name: str = Field(..., min_length=1, max_length=100)
    zone_name: str = Field(..., min_length=1, max_length=100)
    platform: Literal["zepto", "blinkit", "swiggy_instamart", "multiple"]
    avg_daily_orders: float = Field(..., gt=0)
    shift_type: Literal["morning", "evening", "night", "flexible"]
    experience_months: int = Field(..., ge=0)
    upi_id: Optional[str] = Field(None, max_length=100)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("Phone must contain only digits")
        if len(v) != 10:
            raise ValueError("Phone must be exactly 10 digits")
        return v


class RiskProfile(BaseModel):
    risk_score: float = Field(..., ge=0.0, le=1.0)
    risk_tier: Literal["low", "medium", "high"]
    risk_factors: List[str]
    zone_flood_risk: float = Field(..., ge=0.0, le=1.0)
    zone_heat_risk: float = Field(..., ge=0.0, le=1.0)
    zone_pollution_risk: float = Field(..., ge=0.0, le=1.0)


class PlanOption(BaseModel):
    plan_type: Literal["basic", "standard", "premium"]
    weekly_premium: float = Field(..., gt=0)
    weekly_coverage_limit: float = Field(..., gt=0)
    daily_coverage_limit: float = Field(..., gt=0)
    min_orders_threshold: int = Field(default=5, ge=0)
    covered_disruptions: List[str]
    recommended: bool = False
    savings_potential_monthly: float = Field(..., ge=0)


class WorkerResponse(BaseModel):
    id: int
    name: str
    phone: str
    city: str
    dark_store_name: str
    zone_name: str
    platform: str
    avg_daily_orders: float
    avg_daily_earnings: float
    shift_type: str
    experience_months: int
    risk_score: float
    risk_tier: str
    zone_flood_risk: float
    zone_heat_risk: float
    zone_pollution_risk: float
    upi_id: Optional[str]
    created_at: str
    is_active: bool

    class Config:
        from_attributes = True


class WorkerOnboardingResponse(BaseModel):
    worker: WorkerResponse
    risk_profile: RiskProfile
    recommended_plans: List[PlanOption]
    message: str
