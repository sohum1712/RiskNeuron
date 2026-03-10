"""
Mock payout service for UPI/Razorpay payments.
Simulates payment processing with 96% success rate.
"""

import random
import string
from datetime import datetime
from typing import Dict


def process_payout(claim, worker, db) -> Dict:
    """
    Process mock UPI payout for an approved claim.
    
    Args:
        claim: Claim ORM object
        worker: Worker ORM object
        db: Database session
    
    Returns:
        Dictionary with payment result:
        {
            "success": bool,
            "transaction_id": str,
            "upi_reference": str,
            "amount": float,
            "message": str
        }
    """
    # Generate mock transaction ID (Razorpay format)
    txn_id = "RZP_" + "".join(
        random.choices(string.ascii_uppercase + string.digits, k=12)
    )
    
    # Generate UPI reference ID
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    phone_suffix = (worker.phone or '0000')[-4:]
    upi_ref = f"UPI{timestamp}{phone_suffix}"
    
    # Simulate 96% success rate
    success = random.random() > 0.04
    
    if success:
        # Update claim status to paid
        claim.status = "paid"
        claim.paid_at = datetime.utcnow()
        claim.payment_reference = txn_id
        claim.upi_transaction_id = upi_ref
        db.commit()
        
        return {
            "success": True,
            "transaction_id": txn_id,
            "upi_reference": upi_ref,
            "amount": claim.payout_amount,
            "message": f"₹{claim.payout_amount:.2f} credited to {worker.upi_id or 'UPI account'}"
        }
    else:
        # Payment failed
        return {
            "success": False,
            "transaction_id": txn_id,
            "upi_reference": upi_ref,
            "amount": claim.payout_amount,
            "message": "Payment processing failed. Please retry."
        }
