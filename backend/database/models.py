"""SQLAlchemy ORM models for SwiftCover."""
import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime,
    Enum, ForeignKey, JSON, UniqueConstraint, Text
)
from sqlalchemy.orm import relationship
from database.connection import Base


# ============================================================================
# Python Enum Classes
# ============================================================================

class PlatformEnum(enum.Enum):
    """Q-Commerce platforms."""
    zepto = "zepto"
    blinkit = "blinkit"
    swiggy_instamart = "swiggy_instamart"
    multiple = "multiple"


class RiskTierEnum(enum.Enum):
    """Risk tier classification."""
    low = "low"
    medium = "medium"
    high = "high"


class PlanEnum(enum.Enum):
    """Insurance plan types."""
    basic = "basic"
    standard = "standard"
    premium = "premium"


class PolicyStatusEnum(enum.Enum):
    """Policy status."""
    active = "active"
    expired = "expired"
    cancelled = "cancelled"


class ClaimStatusEnum(enum.Enum):
    """Claim processing status."""
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    paid = "paid"
    flagged_fraud = "flagged_fraud"


class DisruptionTypeEnum(enum.Enum):
    """Types of disruptions covered."""
    heavy_rain = "heavy_rain"
    flood = "flood"
    extreme_heat = "extreme_heat"
    severe_pollution = "severe_pollution"
    traffic_shutdown = "traffic_shutdown"
    curfew = "curfew"
    local_strike = "local_strike"
    dark_store_closure = "dark_store_closure"
    app_outage = "app_outage"


class SeverityEnum(enum.Enum):
    """Disruption severity levels."""
    mild = "mild"
    moderate = "moderate"
    severe = "severe"
    extreme = "extreme"


class ShiftEnum(enum.Enum):
    """Worker shift types."""
    morning = "morning"
    evening = "evening"
    night = "night"
    flexible = "flexible"


# ============================================================================
# ORM Models
# ============================================================================

class Worker(Base):
    """Q-Commerce delivery worker."""
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    city = Column(String(50), nullable=False)
    dark_store_name = Column(String(100))
    zone_name = Column(String(100))
    platform = Column(Enum(PlatformEnum), nullable=False)
    avg_daily_orders = Column(Float, default=25)
    avg_daily_earnings = Column(Float, default=550)
    shift_type = Column(Enum(ShiftEnum), default=ShiftEnum.flexible)
    experience_months = Column(Integer, default=4)
    risk_score = Column(Float, default=0.5)
    risk_tier = Column(Enum(RiskTierEnum), default=RiskTierEnum.medium)
    zone_flood_risk = Column(Float, default=0.3)
    zone_heat_risk = Column(Float, default=0.4)
    zone_pollution_risk = Column(Float, default=0.5)
    upi_id = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    policies = relationship("Policy", back_populates="worker")
    activities = relationship("WorkerActivity", back_populates="worker")
    claims = relationship("Claim", back_populates="worker")
    premium_payments = relationship("PremiumPayment", back_populates="worker")


class Policy(Base):
    """Insurance policy for a worker."""
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    plan_type = Column(Enum(PlanEnum), nullable=False)
    weekly_premium = Column(Float, nullable=False)
    weekly_coverage_limit = Column(Float, nullable=False)
    daily_coverage_limit = Column(Float, nullable=False)
    min_orders_threshold = Column(Integer, default=5)
    parametric_triggers = Column(JSON)  # {rainfall_mm: 50, aqi: 200, ...}
    covered_disruptions = Column(JSON)  # ["heavy_rain", "flood", ...]
    status = Column(Enum(PolicyStatusEnum), default=PolicyStatusEnum.active)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)  # always start_date + 7 days
    auto_renew = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    worker = relationship("Worker", back_populates="policies")
    claims = relationship("Claim", back_populates="policy")
    premium_payments = relationship("PremiumPayment", back_populates="policy")


class WorkerActivity(Base):
    """Daily activity log for a worker."""
    __tablename__ = "worker_activity"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    date = Column(Date, nullable=False)
    orders_completed = Column(Integer, default=0)
    working_hours = Column(Float, default=0)
    earnings = Column(Float, default=0)
    online_hours = Column(Float, default=0)
    peak_hour_orders = Column(Integer, default=0)
    platform = Column(String(20))
    is_disruption_day = Column(Boolean, default=False)
    disruption_event_id = Column(Integer, ForeignKey("disruption_events.id"), nullable=True)

    # Unique constraint: one record per worker per day
    __table_args__ = (UniqueConstraint("worker_id", "date", name="uq_worker_date"),)

    # Relationships
    worker = relationship("Worker", back_populates="activities")
    disruption_event = relationship("DisruptionEvent", back_populates="activities")


class DisruptionEvent(Base):
    """Disruption event affecting a city/zone."""
    __tablename__ = "disruption_events"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(50), nullable=False)
    zone_name = Column(String(100))
    disruption_type = Column(Enum(DisruptionTypeEnum), nullable=False)
    severity = Column(Enum(SeverityEnum), nullable=False)
    rainfall_mm = Column(Float)
    aqi = Column(Float)
    traffic_index = Column(Float)
    temperature_celsius = Column(Float)
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    ended_at = Column(DateTime)
    duration_hours = Column(Float)
    is_active = Column(Boolean, default=True)
    source = Column(String(50), default="simulated")
    dark_stores_closed = Column(Integer, default=0)
    estimated_order_drop_pct = Column(Float, default=0)
    affected_workers_count = Column(Integer, default=0)
    total_claims_triggered = Column(Integer, default=0)
    total_payout_amount = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    activities = relationship("WorkerActivity", back_populates="disruption_event")
    claims = relationship("Claim", back_populates="disruption_event")


class Claim(Base):
    """Insurance claim for income loss."""
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    disruption_event_id = Column(Integer, ForeignKey("disruption_events.id"), nullable=False)
    claim_date = Column(Date, nullable=False)
    expected_orders = Column(Integer)
    actual_orders = Column(Integer)
    expected_earnings = Column(Float)
    actual_earnings = Column(Float)
    income_loss = Column(Float)
    disruption_impact_factor = Column(Float)  # 0.0-1.0
    payout_amount = Column(Float, default=0)
    status = Column(Enum(ClaimStatusEnum), default=ClaimStatusEnum.pending)
    fraud_score = Column(Float, default=0)
    fraud_flags = Column(JSON, default=list)  # List of fraud flag strings
    auto_processed = Column(Boolean, default=True)
    rejection_reason = Column(String(500))
    processed_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime)
    payment_reference = Column(String(100))  # RZP_XXXXXXXXXXXX
    upi_transaction_id = Column(String(100))  # UPIYYYYMMDDHHMMSS####

    # Relationships
    worker = relationship("Worker", back_populates="claims")
    policy = relationship("Policy", back_populates="claims")
    disruption_event = relationship("DisruptionEvent", back_populates="claims")


class PremiumPayment(Base):
    """Premium payment record."""
    __tablename__ = "premium_payments"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    amount = Column(Float, nullable=False)
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)
    status = Column(String(20), default="paid")
    payment_reference = Column(String(100))
    paid_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    worker = relationship("Worker", back_populates="premium_payments")
    policy = relationship("Policy", back_populates="premium_payments")
