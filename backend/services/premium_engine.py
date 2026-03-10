"""
Premium calculation engine for SwiftCover insurance plans.
Computes AI-adjusted premiums based on risk, city, and zone factors.
"""

from typing import List, Dict


# Base plan configuration
PLAN_CONFIG = {
    "basic": {
        "weekly": 49,
        "coverage_weekly": 1500,
        "coverage_daily": 250,
        "min_orders_threshold": 5
    },
    "standard": {
        "weekly": 89,
        "coverage_weekly": 2500,
        "coverage_daily": 400,
        "min_orders_threshold": 5
    },
    "premium": {
        "weekly": 149,
        "coverage_weekly": 4000,
        "coverage_daily": 650,
        "min_orders_threshold": 5
    }
}

# Covered disruptions by plan type
COVERED_DISRUPTIONS = {
    "basic": [
        "heavy_rain",
        "flood",
        "severe_pollution"
    ],
    "standard": [
        "heavy_rain",
        "flood",
        "severe_pollution",
        "traffic_shutdown",
        "extreme_heat"
    ],
    "premium": [
        "heavy_rain",
        "flood",
        "severe_pollution",
        "traffic_shutdown",
        "extreme_heat",
        "dark_store_closure",
        "curfew",
        "local_strike",
        "app_outage"
    ]
}

# Parametric triggers by plan type
PARAMETRIC_TRIGGERS = {
    "basic": {
        "rainfall_mm": 60,
        "aqi": 250,
        "traffic_index": 8.0
    },
    "standard": {
        "rainfall_mm": 50,
        "aqi": 200,
        "traffic_index": 7.0,
        "temp_celsius": 43
    },
    "premium": {
        "rainfall_mm": 40,
        "aqi": 180,
        "traffic_index": 6.5,
        "temp_celsius": 42
    }
}

# City premium multipliers
CITY_MULTIPLIER = {
    "Mumbai": 1.20,
    "Delhi": 1.15,
    "Chennai": 1.12,
    "Hyderabad": 1.08,
    "Pune": 1.00,
    "Bangalore": 0.95
}

# High-risk zones (for zone multiplier)
HIGH_RISK_ZONES = {
    "Hyderabad": ["LB Nagar", "Uppal", "Kapra", "Malkajgiri", "Dilsukhnagar"],
    "Mumbai": ["Kurla", "Dharavi", "Sion", "Andheri East", "Powai"],
    "Delhi": ["Laxmi Nagar", "Yamuna Bank", "Kashmiri Gate", "Rohini"],
    "Bangalore": ["Bellandur", "Varthur", "HSR Layout", "KR Puram"],
    "Chennai": ["Velachery", "Tambaram", "Adyar"],
    "Pune": ["Hadapsar", "Kharadi", "Wagholi"],
}


def get_risk_multiplier(risk_score: float) -> float:
    """
    Get premium multiplier based on risk score.
    
    Args:
        risk_score: Worker's risk score (0.0 to 1.0)
    
    Returns:
        Premium multiplier
    """
    if risk_score < 0.30:
        return 0.82  # -18% discount
    elif risk_score < 0.50:
        return 0.93  # -7% discount
    elif risk_score < 0.70:
        return 1.00  # Base rate
    elif risk_score < 0.85:
        return 1.15  # +15% premium
    else:
        return 1.28  # +28% premium


def compute_plans(worker) -> List[Dict]:
    """
    Compute all three plan options with AI-adjusted premiums for a worker.
    
    Args:
        worker: Worker ORM object with risk_score, city, zone_name, avg_daily_earnings
    
    Returns:
        List of 3 PlanOption dictionaries with adjusted premiums
    """
    from schemas.worker import PlanOption
    
    # Get multipliers
    risk_mult = get_risk_multiplier(worker.risk_score)
    city_mult = CITY_MULTIPLIER.get(worker.city, 1.00)
    
    # Zone multiplier: +12% for high-risk zones
    zone_mult = 1.00
    if worker.city in HIGH_RISK_ZONES:
        if worker.zone_name in HIGH_RISK_ZONES[worker.city]:
            zone_mult = 1.12
    
    # Determine recommended plan based on risk score
    if worker.risk_score >= 0.65:
        recommended_plan = "premium"
    elif worker.risk_score >= 0.35:
        recommended_plan = "standard"
    else:
        recommended_plan = "basic"
    
    plans = []
    
    for plan_type in ["basic", "standard", "premium"]:
        config = PLAN_CONFIG[plan_type]
        
        # Calculate adjusted premium
        base_weekly = config["weekly"]
        adjusted_premium = round(base_weekly * risk_mult * city_mult * zone_mult)
        
        # Calculate estimated monthly savings
        # Assumes worker would lose income on disruption days
        # Savings = avg_daily_earnings × disruption_days_per_month × coverage_multiplier
        if plan_type == "basic":
            savings_multiplier = 1.5
        elif plan_type == "standard":
            savings_multiplier = 2.5
        else:  # premium
            savings_multiplier = 3.5
        
        estimated_monthly_savings = round(
            worker.avg_daily_earnings * 0.6 * savings_multiplier
        )
        
        plan_option = PlanOption(
            plan_type=plan_type,
            weekly_premium=adjusted_premium,
            weekly_coverage_limit=config["coverage_weekly"],
            daily_coverage_limit=config["coverage_daily"],
            min_orders_threshold=config["min_orders_threshold"],
            covered_disruptions=COVERED_DISRUPTIONS[plan_type],
            recommended=(plan_type == recommended_plan),
            savings_potential_monthly=estimated_monthly_savings
        )
        
        plans.append(plan_option.model_dump())
    
    return plans
