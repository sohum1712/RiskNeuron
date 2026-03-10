"""
Income prediction model for Q-Commerce delivery workers.
Predicts expected earnings based on historical activity and day-of-week patterns.
"""

from datetime import date
from typing import List, Optional


# Day-of-week multipliers (0=Monday, 6=Sunday)
DAY_MULTIPLIERS = {
    0: 1.00,   # Monday
    1: 0.95,   # Tuesday
    2: 0.97,   # Wednesday
    3: 1.00,   # Thursday
    4: 1.05,   # Friday
    5: 1.22,   # Saturday
    6: 1.35    # Sunday (peak grocery day)
}

# Disruption impact factors: (disruption_type, severity) -> impact factor
# Impact factor represents the percentage reduction in earnings
IMPACT_FACTORS = {
    # Heavy Rain
    ("heavy_rain", "mild"): 0.20,
    ("heavy_rain", "moderate"): 0.45,
    ("heavy_rain", "severe"): 0.70,
    ("heavy_rain", "extreme"): 0.88,
    
    # Flood
    ("flood", "mild"): 0.50,
    ("flood", "moderate"): 0.68,
    ("flood", "severe"): 0.85,
    ("flood", "extreme"): 0.96,
    
    # Severe Pollution
    ("severe_pollution", "mild"): 0.15,
    ("severe_pollution", "moderate"): 0.32,
    ("severe_pollution", "severe"): 0.55,
    ("severe_pollution", "extreme"): 0.73,
    
    # Extreme Heat
    ("extreme_heat", "mild"): 0.15,
    ("extreme_heat", "moderate"): 0.25,
    ("extreme_heat", "severe"): 0.48,
    ("extreme_heat", "extreme"): 0.68,
    
    # Traffic Shutdown
    ("traffic_shutdown", "mild"): 0.20,
    ("traffic_shutdown", "moderate"): 0.42,
    ("traffic_shutdown", "severe"): 0.63,
    ("traffic_shutdown", "extreme"): 0.80,
    
    # Curfew
    ("curfew", "mild"): 0.60,
    ("curfew", "moderate"): 0.75,
    ("curfew", "severe"): 0.90,
    ("curfew", "extreme"): 0.97,
    
    # Dark Store Closure
    ("dark_store_closure", "mild"): 0.50,
    ("dark_store_closure", "moderate"): 0.75,
    ("dark_store_closure", "severe"): 0.88,
    ("dark_store_closure", "extreme"): 0.95,
    
    # Local Strike
    ("local_strike", "mild"): 0.30,
    ("local_strike", "moderate"): 0.52,
    ("local_strike", "severe"): 0.78,
    ("local_strike", "extreme"): 0.90,
    
    # App Outage
    ("app_outage", "mild"): 0.35,
    ("app_outage", "moderate"): 0.60,
    ("app_outage", "severe"): 0.82,
    ("app_outage", "extreme"): 0.95,
}


def predict_expected_earnings(worker, activity_history: List, target_date: date) -> float:
    """
    Predict expected earnings for a worker on a specific date.
    
    Algorithm:
    1. Get day-of-week multiplier for target date
    2. Find same-weekday normal (non-disruption) days from history
    3. If >= 3 same-weekday samples: use average of last 8
    4. Else if history exists: use average of all normal days × multiplier
    5. Else: use worker's avg_daily_earnings × multiplier
    
    Args:
        worker: Worker ORM object with avg_daily_earnings attribute
        activity_history: List of WorkerActivity ORM objects
        target_date: Date to predict earnings for
    
    Returns:
        Predicted earnings (float)
    """
    weekday = target_date.weekday()
    multiplier = DAY_MULTIPLIERS.get(weekday, 1.0)
    
    # Filter normal (non-disruption) days
    normal_days = [a for a in activity_history if not a.is_disruption_day]
    
    # Strategy 1: Same weekday normal days
    same_weekday_normal = [
        a.earnings for a in normal_days 
        if a.date.weekday() == weekday
    ]
    
    if len(same_weekday_normal) >= 3:
        # Use average of last 8 same-weekday samples
        recent_same_weekday = same_weekday_normal[-8:]
        base = sum(recent_same_weekday) / len(recent_same_weekday)
        return round(base, 2)
    
    # Strategy 2: All normal days with multiplier
    if normal_days:
        # Get last 14 normal days
        recent_normal = normal_days[-14:]
        avg_normal = sum(a.earnings for a in recent_normal) / len(recent_normal)
        base = avg_normal * multiplier
        return round(base, 2)
    
    # Strategy 3: Worker's average with multiplier
    base = worker.avg_daily_earnings * multiplier
    return round(base, 2)


def get_impact_factor(disruption_type: str, severity: str) -> float:
    """
    Get the income impact factor for a disruption type and severity.
    
    Args:
        disruption_type: Type of disruption
        severity: Severity level (mild, moderate, severe, extreme)
    
    Returns:
        Impact factor (0.0 to 1.0), defaults to 0.50 if not found
    """
    return IMPACT_FACTORS.get((disruption_type, severity), 0.50)
