from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import date


class PolicyCreate(BaseModel):
    worker_id: int = Field(..., gt=0)
    plan_type: Literal["basic", "standard", "premium"]
    auto_renew: bool = Field(default=False)


class PolicyResponse(BaseModel):
    id: int
    worker_id: int
    plan_type: str
    weekly_premium: float
    weekly_coverage_limit: float
    daily_coverage_limit: float
    min_orders_threshold: int
    parametric_triggers: dict
    covered_disruptions: list
    status: str
    start_date: date
    end_date: date
    auto_renew: bool
    created_at: str
    days_remaining: int
    is_valid_today: bool
    coverage_used_this_week: float

    class Config:
        from_attributes = True
