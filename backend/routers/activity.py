"""Activity router - worker activity logging and retrieval."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from database.connection import get_db
from database.models import WorkerActivity, Worker

router = APIRouter(prefix="/api/activity", tags=["activity"])


class ActivityLogRequest(BaseModel):
    """Request model for logging daily activity."""
    worker_id: int = Field(..., gt=0)
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    orders_completed: int = Field(default=0, ge=0)
    working_hours: float = Field(default=0, ge=0)
    earnings: float = Field(default=0, ge=0)
    online_hours: float = Field(default=0, ge=0)
    peak_hour_orders: int = Field(default=0, ge=0)
    platform: str = Field(default="")
    is_disruption_day: bool = Field(default=False)
    disruption_event_id: int = Field(default=None)


class ActivityResponse(BaseModel):
    """Response model for activity data."""
    id: int
    worker_id: int
    date: str
    orders_completed: int
    working_hours: float
    earnings: float
    online_hours: float
    peak_hour_orders: int
    platform: str
    is_disruption_day: bool
    disruption_event_id: int = None
    
    class Config:
        from_attributes = True


@router.post("/log")
def log_activity(activity: ActivityLogRequest, db: Session = Depends(get_db)):
    """
    Log or update daily activity for a worker.
    Uses upsert logic: updates if record exists for worker+date, creates if not.
    """
    # Verify worker exists
    worker = db.query(Worker).filter(Worker.id == activity.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Parse date
    try:
        activity_date = datetime.strptime(activity.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Check if activity already exists
    existing = db.query(WorkerActivity).filter(
        WorkerActivity.worker_id == activity.worker_id,
        WorkerActivity.date == activity_date
    ).first()
    
    if existing:
        # Update existing record
        existing.orders_completed = activity.orders_completed
        existing.working_hours = activity.working_hours
        existing.earnings = activity.earnings
        existing.online_hours = activity.online_hours
        existing.peak_hour_orders = activity.peak_hour_orders
        existing.platform = activity.platform
        existing.is_disruption_day = activity.is_disruption_day
        existing.disruption_event_id = activity.disruption_event_id
        
        db.commit()
        db.refresh(existing)
        
        return {
            "success": True,
            "message": "Activity updated",
            "activity": ActivityResponse(
                id=existing.id,
                worker_id=existing.worker_id,
                date=existing.date.isoformat(),
                orders_completed=existing.orders_completed,
                working_hours=existing.working_hours,
                earnings=existing.earnings,
                online_hours=existing.online_hours,
                peak_hour_orders=existing.peak_hour_orders,
                platform=existing.platform,
                is_disruption_day=existing.is_disruption_day,
                disruption_event_id=existing.disruption_event_id
            )
        }
    else:
        # Create new record
        new_activity = WorkerActivity(
            worker_id=activity.worker_id,
            date=activity_date,
            orders_completed=activity.orders_completed,
            working_hours=activity.working_hours,
            earnings=activity.earnings,
            online_hours=activity.online_hours,
            peak_hour_orders=activity.peak_hour_orders,
            platform=activity.platform,
            is_disruption_day=activity.is_disruption_day,
            disruption_event_id=activity.disruption_event_id
        )
        
        db.add(new_activity)
        db.commit()
        db.refresh(new_activity)
        
        return {
            "success": True,
            "message": "Activity logged",
            "activity": ActivityResponse(
                id=new_activity.id,
                worker_id=new_activity.worker_id,
                date=new_activity.date.isoformat(),
                orders_completed=new_activity.orders_completed,
                working_hours=new_activity.working_hours,
                earnings=new_activity.earnings,
                online_hours=new_activity.online_hours,
                peak_hour_orders=new_activity.peak_hour_orders,
                platform=new_activity.platform,
                is_disruption_day=new_activity.is_disruption_day,
                disruption_event_id=new_activity.disruption_event_id
            )
        }


@router.get("/worker/{worker_id}", response_model=List[ActivityResponse])
def get_worker_activity(
    worker_id: int,
    days: int = Query(30, ge=1, le=365, description="Number of days to retrieve"),
    db: Session = Depends(get_db)
):
    """
    Get activity history for a worker.
    Returns last N days of activity, ordered by date descending.
    """
    # Verify worker exists
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Calculate date range
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1)
    
    # Query activities
    activities = db.query(WorkerActivity).filter(
        WorkerActivity.worker_id == worker_id,
        WorkerActivity.date >= start_date,
        WorkerActivity.date <= end_date
    ).order_by(WorkerActivity.date.desc()).all()
    
    return [
        ActivityResponse(
            id=a.id,
            worker_id=a.worker_id,
            date=a.date.isoformat(),
            orders_completed=a.orders_completed,
            working_hours=a.working_hours,
            earnings=a.earnings,
            online_hours=a.online_hours,
            peak_hour_orders=a.peak_hour_orders,
            platform=a.platform or "",
            is_disruption_day=a.is_disruption_day,
            disruption_event_id=a.disruption_event_id
        )
        for a in activities
    ]
