"""
ML model training script.
Trains IsolationForest for anomaly-based fraud detection.
"""

import os
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest


def train_and_save_models():
    """
    Train and save ML models for fraud detection.
    
    Creates synthetic training data and trains an IsolationForest model
    for anomaly-based fraud detection. Model is saved to backend/ml/models/
    """
    # Create models directory if it doesn't exist
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "fraud_isolation.joblib")
    
    # Check if model already exists
    if os.path.exists(model_path):
        print(f"✓ Fraud detection model already exists at {model_path}")
        return
    
    print("Training fraud detection model...")
    
    # Generate synthetic training data
    # Features: [days_since_reg, claim_to_avg_ratio, claim_count_30d, zero_earnings_mild_flag]
    
    # Normal samples (800)
    normal_samples = []
    for _ in range(800):
        days_since_reg = np.random.uniform(30, 365)  # Established workers
        claim_to_avg_ratio = np.random.uniform(0.5, 2.0)  # Reasonable loss ratios
        claim_count_30d = np.random.choice([0, 1, 2, 3], p=[0.4, 0.3, 0.2, 0.1])  # Few claims
        zero_earnings_mild = 0  # Normal workers don't have zero earnings in mild disruptions
        normal_samples.append([days_since_reg, claim_to_avg_ratio, claim_count_30d, zero_earnings_mild])
    
    # Fraud samples (200)
    fraud_samples = []
    for _ in range(200):
        # Fraudulent patterns
        if np.random.random() < 0.3:
            # Pattern 1: New account with high claims
            days_since_reg = np.random.uniform(1, 10)
            claim_to_avg_ratio = np.random.uniform(2.0, 4.0)
            claim_count_30d = np.random.choice([3, 4, 5, 6])
            zero_earnings_mild = np.random.choice([0, 1])
        elif np.random.random() < 0.5:
            # Pattern 2: Excessive loss claims
            days_since_reg = np.random.uniform(10, 100)
            claim_to_avg_ratio = np.random.uniform(2.5, 5.0)
            claim_count_30d = np.random.choice([2, 3, 4, 5])
            zero_earnings_mild = np.random.choice([0, 1])
        else:
            # Pattern 3: Suspicious zero earnings
            days_since_reg = np.random.uniform(5, 60)
            claim_to_avg_ratio = np.random.uniform(1.5, 3.0)
            claim_count_30d = np.random.choice([1, 2, 3, 4])
            zero_earnings_mild = 1  # Zero earnings during mild disruption
        
        fraud_samples.append([days_since_reg, claim_to_avg_ratio, claim_count_30d, zero_earnings_mild])
    
    # Combine all samples
    X_train = np.array(normal_samples + fraud_samples)
    
    # Train IsolationForest
    # contamination=0.2 means we expect ~20% of data to be anomalies (fraud)
    model = IsolationForest(
        n_estimators=100,
        contamination=0.2,
        random_state=42,
        max_samples='auto',
        max_features=1.0
    )
    
    model.fit(X_train)
    
    # Save model
    joblib.dump(model, model_path)
    
    print(f"✓ Fraud detection model trained and saved to {model_path}")
    print(f"  - Training samples: {len(X_train)} (800 normal + 200 fraud)")
    print(f"  - Model: IsolationForest (n_estimators=100, contamination=0.2)")
    print(f"  - Features: days_since_reg, claim_to_avg_ratio, claim_count_30d, zero_earnings_mild_flag")


if __name__ == "__main__":
    train_and_save_models()
