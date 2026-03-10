"""
Fraud detection service.
Re-exports FraudDetector from ml/fraud_model.py for clean imports.
"""

from ml.fraud_model import FraudDetector, FraudResult

__all__ = ["FraudDetector", "FraudResult"]
