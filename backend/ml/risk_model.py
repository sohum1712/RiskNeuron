"""
Risk scoring model for Q-Commerce delivery workers.
Computes risk_score, risk_tier, and zone-specific risks.
"""

from typing import Dict, List, Tuple


class RiskModel:
    """Rule-based risk assessment model for delivery workers."""
    
    CITY_BASE_RISK = {
        "Mumbai": 0.72,
        "Delhi": 0.68,
        "Chennai": 0.60,
        "Hyderabad": 0.55,
        "Pune": 0.48,
        "Bangalore": 0.42
    }
    
    HIGH_RISK_ZONES = {
        "Hyderabad": ["LB Nagar", "Uppal", "Kapra", "Malkajgiri", "Dilsukhnagar"],
        "Mumbai": ["Kurla", "Dharavi", "Sion", "Andheri East", "Powai"],
        "Delhi": ["Laxmi Nagar", "Yamuna Bank", "Kashmiri Gate", "Rohini"],
        "Bangalore": ["Bellandur", "Varthur", "HSR Layout", "KR Puram"],
        "Chennai": ["Velachery", "Tambaram", "Adyar"],
        "Pune": ["Hadapsar", "Kharadi", "Wagholi"],
    }
    
    def compute(self, data: dict) -> Tuple[float, str, List[str]]:
        """
        Compute risk score, tier, and contributing factors.
        
        Args:
            data: Dictionary with keys:
                - city: str
                - zone_name: str
                - experience_months: int
                - platform: str
                - avg_daily_orders: float
                - shift_type: str
        
        Returns:
            Tuple of (risk_score: float, risk_tier: str, factors: List[str])
        """
        factors = []
        
        # 1. City base risk (30%)
        city = data.get("city", "Bangalore")
        city_risk = self.CITY_BASE_RISK.get(city, 0.50)
        city_component = city_risk * 0.30
        factors.append(f"City risk: {city} ({city_risk:.2f})")
        
        # 2. Zone risk (15%)
        zone_name = data.get("zone_name", "")
        zone_risk = 0.0
        if city in self.HIGH_RISK_ZONES:
            if zone_name in self.HIGH_RISK_ZONES[city]:
                zone_risk = 0.18
                factors.append(f"High-risk flood zone: {zone_name}")
        zone_component = zone_risk * 0.15
        
        # 3. Experience risk (20%)
        experience_months = data.get("experience_months", 4)
        if experience_months < 3:
            exp_risk = 0.80
            factors.append("New worker (<3 months)")
        elif experience_months < 8:
            exp_risk = 0.60
            factors.append("Limited experience (<8 months)")
        elif experience_months < 18:
            exp_risk = 0.40
        else:
            exp_risk = 0.25
        exp_component = exp_risk * 0.20
        
        # 4. Platform risk (10%)
        platform = data.get("platform", "zepto")
        if platform == "multiple":
            platform_risk = -0.05  # Bonus for diversification
            factors.append("Multi-platform diversification bonus")
        else:
            platform_risk = 0.0
        platform_component = platform_risk * 0.10
        
        # 5. Order volume risk (15%)
        avg_daily_orders = data.get("avg_daily_orders", 25)
        if avg_daily_orders > 35:
            volume_risk = 0.25
        elif avg_daily_orders > 22:
            volume_risk = 0.45
        elif avg_daily_orders > 15:
            volume_risk = 0.60
        else:
            volume_risk = 0.75
            factors.append("Low order volume (<15/day)")
        volume_component = volume_risk * 0.15
        
        # 6. Shift risk (10%)
        shift_type = data.get("shift_type", "flexible")
        shift_risks = {
            "morning": 0.45,
            "evening": 0.50,
            "night": 0.65,
            "flexible": 0.40
        }
        shift_risk = shift_risks.get(shift_type, 0.50)
        if shift_type == "night":
            factors.append("Night shift (higher risk)")
        shift_component = shift_risk * 0.10
        
        # Calculate total risk score
        risk_score = (
            city_component +
            zone_component +
            exp_component +
            platform_component +
            volume_component +
            shift_component
        )
        
        # Clamp to [0, 1]
        risk_score = max(0.0, min(1.0, risk_score))
        
        # Determine risk tier
        if risk_score < 0.35:
            risk_tier = "low"
        elif risk_score < 0.65:
            risk_tier = "medium"
        else:
            risk_tier = "high"
            factors.append("High overall risk score")
        
        return round(risk_score, 3), risk_tier, factors
    
    def get_zone_risks(self, city: str, zone: str) -> Dict[str, float]:
        """
        Get zone-specific risk factors.
        
        Args:
            city: City name
            zone: Zone name
        
        Returns:
            Dictionary with zone_flood_risk, zone_heat_risk, zone_pollution_risk
        """
        # Flood risk
        flood_risk = 0.3  # Base
        if city in self.HIGH_RISK_ZONES and zone in self.HIGH_RISK_ZONES[city]:
            flood_risk = 0.75  # High flood-prone zone
        
        # Heat risk (higher for certain cities)
        heat_risk_by_city = {
            "Delhi": 0.70,
            "Chennai": 0.65,
            "Hyderabad": 0.60,
            "Mumbai": 0.45,
            "Pune": 0.50,
            "Bangalore": 0.35
        }
        heat_risk = heat_risk_by_city.get(city, 0.40)
        
        # Pollution risk (higher for Delhi and Mumbai)
        pollution_risk_by_city = {
            "Delhi": 0.85,
            "Mumbai": 0.70,
            "Hyderabad": 0.55,
            "Chennai": 0.50,
            "Pune": 0.45,
            "Bangalore": 0.40
        }
        pollution_risk = pollution_risk_by_city.get(city, 0.50)
        
        return {
            "zone_flood_risk": round(flood_risk, 2),
            "zone_heat_risk": round(heat_risk, 2),
            "zone_pollution_risk": round(pollution_risk, 2)
        }
