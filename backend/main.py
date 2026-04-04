"""
Axio FastAPI Application
Main entry point with lifespan management, CORS, and routing.
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, date
import random

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.connection import create_tables, SessionLocal
from database.models import (
    Worker, Policy, WorkerActivity, DisruptionEvent, Claim, PremiumPayment,
    PlatformEnum, ShiftEnum, PlanEnum, DisruptionTypeEnum, SeverityEnum
)
from ml.train_models import train_and_save_models
from ml.risk_model import RiskModel
from services.premium_engine import PLAN_CONFIG, COVERED_DISRUPTIONS, PARAMETRIC_TRIGGERS


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    On startup: create tables → train models → seed demo data
    """
    print("[START] Starting Axio API...")
    
    # Create database tables
    print("[DB] Creating database tables...")
    create_tables()
    
    # Train and save ML models
    print("[ML] Training ML models...")
    train_and_save_models()
    
    # Seed demo data
    print("[SEED] Seeding demo data...")
    seed_demo_data()
    
    print("[SUCCESS] Axio API ready!")
    
    yield
    
    print("[SHUTDOWN] Shutting down Axio API...")


# Create FastAPI app with lifespan
app = FastAPI(
    title="Axio API",
    description="AI-powered parametric micro-insurance for Q-Commerce workers",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Axio"
    }


# Test endpoint to verify routing
@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify API routing."""
    return {"message": "API routing works!"}


# Register routers (they already have /api/ prefixes defined)
from routers import workers, policies, disruptions, claims, activity, analytics

app.include_router(workers.router)
app.include_router(policies.router)
app.include_router(disruptions.router)
app.include_router(claims.router)
app.include_router(activity.router)
app.include_router(analytics.router)


def seed_demo_data():
    """
    Seed demo data for development and testing.
    Only runs if workers table is empty.
    
    Creates:
    - 10 workers across 5 cities with correct risk scores
    - Policies for each worker (1-3: premium, 4-7: standard, 8-10: basic)
    - 30 days of WorkerActivity per worker with day-of-week multipliers
    - 4 past DisruptionEvents (is_active=False)
    - Claims for affected workers from past disruptions
    - PremiumPayment records
    """
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_workers = db.query(Worker).count()
        if existing_workers > 0:
            print(f"  [INFO] Demo data already exists ({existing_workers} workers found)")
            return
        
        print("  [CREATE] Creating 10 demo workers...")
        
        # Seed data from DESIGN.md
        workers_data = [
            # Workers 1-3: Premium plan
            {
                "name": "Rahul Kumar",
                "phone": "9876543210",
                "city": "Hyderabad",
                "zone_name": "LB Nagar",
                "dark_store_name": "Blinkit Dark Store - LB Nagar",
                "platform": PlatformEnum.blinkit,
                "avg_daily_orders": 28,
                "shift_type": ShiftEnum.morning,
                "experience_months": 18,
                "plan": "premium"
            },
            {
                "name": "Priya Sharma",
                "phone": "9876543211",
                "city": "Hyderabad",
                "zone_name": "Kondapur",
                "dark_store_name": "Zepto Dark Store - Kondapur",
                "platform": PlatformEnum.zepto,
                "avg_daily_orders": 22,
                "shift_type": ShiftEnum.evening,
                "experience_months": 12,
                "plan": "premium"
            },
            {
                "name": "Mohammed Ali",
                "phone": "9876543212",
                "city": "Bangalore",
                "zone_name": "Bellandur",
                "dark_store_name": "Swiggy Instamart - Bellandur",
                "platform": PlatformEnum.swiggy_instamart,
                "avg_daily_orders": 30,
                "shift_type": ShiftEnum.flexible,
                "experience_months": 24,
                "plan": "premium"
            },
            # Workers 4-7: Standard plan
            {
                "name": "Suresh Reddy",
                "phone": "9876543213",
                "city": "Hyderabad",
                "zone_name": "Uppal",
                "dark_store_name": "Blinkit Dark Store - Uppal",
                "platform": PlatformEnum.blinkit,
                "avg_daily_orders": 18,
                "shift_type": ShiftEnum.morning,
                "experience_months": 8,
                "plan": "standard"
            },
            {
                "name": "Anita Devi",
                "phone": "9876543214",
                "city": "Mumbai",
                "zone_name": "Kurla",
                "dark_store_name": "Zepto Dark Store - Kurla",
                "platform": PlatformEnum.zepto,
                "avg_daily_orders": 26,
                "shift_type": ShiftEnum.evening,
                "experience_months": 15,
                "plan": "standard"
            },
            {
                "name": "Kiran Patel",
                "phone": "9876543215",
                "city": "Bangalore",
                "zone_name": "HSR Layout",
                "dark_store_name": "Blinkit Dark Store - HSR Layout",
                "platform": PlatformEnum.blinkit,
                "avg_daily_orders": 35,
                "shift_type": ShiftEnum.flexible,
                "experience_months": 20,
                "plan": "standard"
            },
            {
                "name": "Raju Singh",
                "phone": "9876543216",
                "city": "Delhi",
                "zone_name": "Laxmi Nagar",
                "dark_store_name": "Multiple Platforms - Laxmi Nagar",
                "platform": PlatformEnum.multiple,
                "avg_daily_orders": 20,
                "shift_type": ShiftEnum.evening,
                "experience_months": 10,
                "plan": "standard"
            },
            # Workers 8-10: Basic plan
            {
                "name": "Deepa Nair",
                "phone": "9876543217",
                "city": "Mumbai",
                "zone_name": "Bandra",
                "dark_store_name": "Swiggy Instamart - Bandra",
                "platform": PlatformEnum.swiggy_instamart,
                "avg_daily_orders": 24,
                "shift_type": ShiftEnum.morning,
                "experience_months": 6,
                "plan": "basic"
            },
            {
                "name": "Venkat Rao",
                "phone": "9876543218",
                "city": "Hyderabad",
                "zone_name": "Kukatpally",
                "dark_store_name": "Swiggy Instamart - Kukatpally",
                "platform": PlatformEnum.swiggy_instamart,
                "avg_daily_orders": 16,
                "shift_type": ShiftEnum.night,
                "experience_months": 4,
                "plan": "basic"
            },
            {
                "name": "Fatima Begum",
                "phone": "9876543219",
                "city": "Bangalore",
                "zone_name": "Whitefield",
                "dark_store_name": "Blinkit Dark Store - Whitefield",
                "platform": PlatformEnum.blinkit,
                "avg_daily_orders": 29,
                "shift_type": ShiftEnum.flexible,
                "experience_months": 14,
                "plan": "basic"
            }
        ]
        
        risk_model = RiskModel()
        created_workers = []
        
        # Create workers with risk scores
        for worker_data in workers_data:
            plan_type = worker_data.pop("plan")
            
            # Calculate risk score
            risk_score, risk_tier, _ = risk_model.compute({
                "city": worker_data["city"],
                "zone_name": worker_data["zone_name"],
                "experience_months": worker_data["experience_months"],
                "platform": worker_data["platform"].value,
                "avg_daily_orders": worker_data["avg_daily_orders"],
                "shift_type": worker_data["shift_type"].value
            })
            
            # Get zone risks
            zone_risks = risk_model.get_zone_risks(
                worker_data["city"],
                worker_data["zone_name"]
            )
            
            # Calculate avg daily earnings
            avg_daily_earnings = worker_data["avg_daily_orders"] * 18
            
            # Create worker
            worker = Worker(
                **worker_data,
                avg_daily_earnings=avg_daily_earnings,
                risk_score=risk_score,
                risk_tier=risk_tier,
                zone_flood_risk=zone_risks["zone_flood_risk"],
                zone_heat_risk=zone_risks["zone_heat_risk"],
                zone_pollution_risk=zone_risks["zone_pollution_risk"],
                upi_id=f"{worker_data['name'].replace(' ', '').lower()}@upi"
            )
            
            db.add(worker)
            db.flush()  # Get worker.id
            
            created_workers.append((worker, plan_type))
        
        db.commit()
        print(f"  [SUCCESS] Created {len(created_workers)} workers")
        
        # Create policies for each worker
        print("  [CREATE] Creating policies...")
        today = date.today()
        
        for worker, plan_type in created_workers:
            plan_config = PLAN_CONFIG[plan_type]
            
            # Calculate adjusted premium (simplified for seed data)
            from services.premium_engine import get_risk_multiplier, CITY_MULTIPLIER, HIGH_RISK_ZONES
            
            risk_mult = get_risk_multiplier(worker.risk_score)
            city_mult = CITY_MULTIPLIER.get(worker.city, 1.00)
            zone_mult = 1.12 if (worker.city in HIGH_RISK_ZONES and 
                                worker.zone_name in HIGH_RISK_ZONES[worker.city]) else 1.00
            
            adjusted_premium = round(plan_config["weekly"] * risk_mult * city_mult * zone_mult)
            
            policy = Policy(
                worker_id=worker.id,
                plan_type=PlanEnum[plan_type],
                weekly_premium=adjusted_premium,
                weekly_coverage_limit=plan_config["coverage_weekly"],
                daily_coverage_limit=plan_config["coverage_daily"],
                min_orders_threshold=plan_config["min_orders_threshold"],
                parametric_triggers=PARAMETRIC_TRIGGERS[plan_type],
                covered_disruptions=COVERED_DISRUPTIONS[plan_type],
                start_date=today,
                end_date=today + timedelta(days=7),
                auto_renew=False
            )
            
            db.add(policy)
            db.flush()
            
            # Create premium payment record
            payment = PremiumPayment(
                worker_id=worker.id,
                policy_id=policy.id,
                amount=adjusted_premium,
                week_start=today,
                week_end=today + timedelta(days=7),
                status="paid",
                payment_reference=f"RZP_{random.randint(100000000000, 999999999999)}",
                paid_at=datetime.utcnow()
            )
            
            db.add(payment)
        
        db.commit()
        print(f"  [SUCCESS] Created policies and payment records")
        
        # Generate 30 days of activity for each worker
        print("  [CREATE] Generating 30 days of activity...")
        
        # Day-of-week multipliers
        day_multipliers = {
            0: 1.00,   # Monday
            1: 0.95,   # Tuesday
            2: 0.97,   # Wednesday
            3: 1.00,   # Thursday
            4: 1.05,   # Friday
            5: 1.22,   # Saturday
            6: 1.35    # Sunday
        }
        
        # Disruption days (days ago)
        disruption_days = [5, 12, 20]
        
        for worker, _ in created_workers:
            for days_ago in range(30, 0, -1):
                activity_date = today - timedelta(days=days_ago)
                weekday = activity_date.weekday()
                multiplier = day_multipliers[weekday]
                
                # Check if this is a disruption day
                is_disruption = days_ago in disruption_days
                
                if is_disruption:
                    # Reduced activity on disruption days
                    orders = int(worker.avg_daily_orders * random.uniform(0.15, 0.35))
                    earnings = orders * 18
                    working_hours = random.uniform(2, 4)
                else:
                    # Normal activity with day-of-week variation
                    orders = int(worker.avg_daily_orders * multiplier * random.uniform(0.85, 1.15))
                    earnings = orders * 18
                    working_hours = random.uniform(6, 9)
                
                activity = WorkerActivity(
                    worker_id=worker.id,
                    date=activity_date,
                    orders_completed=orders,
                    working_hours=working_hours,
                    earnings=earnings,
                    online_hours=working_hours + random.uniform(0.5, 1.5),
                    peak_hour_orders=int(orders * random.uniform(0.3, 0.5)),
                    platform=worker.platform.value,
                    is_disruption_day=is_disruption,
                    disruption_event_id=None  # Will be set when we create disruptions
                )
                
                db.add(activity)
        
        db.commit()
        print(f"  [SUCCESS] Generated activity records")
        
        # Create 4 past disruption events
        print("  [CREATE] Creating past disruption events...")
        
        disruptions_data = [
            {
                "city": "Hyderabad",
                "disruption_type": DisruptionTypeEnum.heavy_rain,
                "severity": SeverityEnum.severe,
                "days_ago": 16,
                "rainfall_mm": 85.0,
                "affected_worker_indices": [0, 1, 3, 8]  # Rahul, Priya, Suresh, Venkat
            },
            {
                "city": "Delhi",
                "disruption_type": DisruptionTypeEnum.severe_pollution,
                "severity": SeverityEnum.extreme,
                "days_ago": 10,
                "aqi": 420.0,
                "affected_worker_indices": [6]  # Raju
            },
            {
                "city": "Bangalore",
                "disruption_type": DisruptionTypeEnum.flood,
                "severity": SeverityEnum.severe,
                "days_ago": 7,
                "rainfall_mm": 120.0,
                "affected_worker_indices": [2, 5, 9]  # Mohammed, Kiran, Fatima
            },
            {
                "city": "Mumbai",
                "disruption_type": DisruptionTypeEnum.extreme_heat,
                "severity": SeverityEnum.severe,
                "days_ago": 4,
                "temperature_celsius": 44.0,
                "affected_worker_indices": [4, 7]  # Anita, Deepa
            }
        ]
        
        for disruption_data in disruptions_data:
            days_ago = disruption_data.pop("days_ago")
            affected_indices = disruption_data.pop("affected_worker_indices")
            
            disruption_date = today - timedelta(days=days_ago)
            
            disruption = DisruptionEvent(
                **disruption_data,
                started_at=datetime.combine(disruption_date, datetime.min.time()),
                ended_at=datetime.combine(disruption_date, datetime.min.time()) + timedelta(hours=6),
                duration_hours=6.0,
                is_active=False,
                source="historical"
            )
            
            db.add(disruption)
            db.flush()
            
            # Update activity records to link to this disruption
            for idx in affected_indices:
                worker, plan_type = created_workers[idx]
                
                activity = db.query(WorkerActivity).filter(
                    WorkerActivity.worker_id == worker.id,
                    WorkerActivity.date == disruption_date
                ).first()
                
                if activity:
                    activity.disruption_event_id = disruption.id
                    activity.is_disruption_day = True
            
            db.commit()
            
            # Create claims for affected workers
            claims_approved = 0
            claims_rejected = 0
            claims_fraud = 0
            total_payout = 0.0
            
            for idx in affected_indices:
                worker, plan_type = created_workers[idx]
                
                # Get worker's active policy
                policy = db.query(Policy).filter(
                    Policy.worker_id == worker.id
                ).first()
                
                if not policy:
                    continue
                
                # Check if disruption is covered by policy
                if disruption.disruption_type.value not in policy.covered_disruptions:
                    continue
                
                # Get activity for this day
                activity = db.query(WorkerActivity).filter(
                    WorkerActivity.worker_id == worker.id,
                    WorkerActivity.date == disruption_date
                ).first()
                
                if not activity:
                    continue
                
                # Calculate expected earnings (simplified)
                weekday = disruption_date.weekday()
                multiplier = day_multipliers[weekday]
                expected_earnings = worker.avg_daily_earnings * multiplier
                expected_orders = int(worker.avg_daily_orders * multiplier)
                
                actual_earnings = activity.earnings
                actual_orders = activity.orders_completed
                income_loss = max(0, expected_earnings - actual_earnings)
                
                # Calculate payout
                payout_amount = min(income_loss, policy.daily_coverage_limit)
                
                # Determine status (most approved, some rejected, one fraud-flagged)
                if idx == 8 and disruption.city == "Hyderabad":
                    # Flag one claim as fraud (Venkat - new worker with high loss)
                    status = "flagged_fraud"
                    fraud_score = 0.82
                    fraud_flags = ["NEW_ACCOUNT_CLAIM", "LOSS_EXCEEDS_HISTORICAL_2_5X"]
                    payout_amount = 0
                    claims_fraud += 1
                elif income_loss < 50:
                    status = "rejected"
                    rejection_reason = f"Income loss ₹{income_loss:.2f} below ₹50 minimum"
                    payout_amount = 0
                    fraud_score = 0.15
                    fraud_flags = []
                    claims_rejected += 1
                else:
                    status = "paid"
                    rejection_reason = None
                    fraud_score = random.uniform(0.05, 0.35)
                    fraud_flags = []
                    claims_approved += 1
                    total_payout += payout_amount
                
                # Create claim
                claim = Claim(
                    worker_id=worker.id,
                    policy_id=policy.id,
                    disruption_event_id=disruption.id,
                    claim_date=disruption_date,
                    expected_orders=expected_orders,
                    actual_orders=actual_orders,
                    expected_earnings=round(expected_earnings, 2),
                    actual_earnings=round(actual_earnings, 2),
                    income_loss=round(income_loss, 2),
                    disruption_impact_factor=0.75,
                    payout_amount=round(payout_amount, 2),
                    status=status,
                    fraud_score=fraud_score,
                    fraud_flags=fraud_flags,
                    auto_processed=True,
                    rejection_reason=rejection_reason,
                    processed_at=datetime.combine(disruption_date, datetime.min.time()) + timedelta(hours=1),
                    paid_at=datetime.combine(disruption_date, datetime.min.time()) + timedelta(hours=2) if status == "paid" else None,
                    payment_reference=f"RZP_{random.randint(100000000000, 999999999999)}" if status == "paid" else None,
                    upi_transaction_id=f"UPI{disruption_date.strftime('%Y%m%d')}{random.randint(100000, 999999)}" if status == "paid" else None
                )
                
                db.add(claim)
            
            # Update disruption stats
            disruption.affected_workers_count = len(affected_indices)
            disruption.total_claims_triggered = claims_approved + claims_rejected + claims_fraud
            disruption.total_payout_amount = round(total_payout, 2)
            
            db.commit()
        
        print(f"  [SUCCESS] Created 4 past disruption events with claims")
        print("  [COMPLETE] Demo data seeded successfully!")
        
    except Exception as e:
        print(f"  [ERROR] Error seeding demo data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
