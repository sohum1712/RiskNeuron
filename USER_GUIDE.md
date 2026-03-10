# SwiftCover User Guide

## Step-by-Step Guide to Using SwiftCover

### Prerequisites Check

Before starting, ensure:
1. ✅ Backend is running on http://localhost:8000
2. ✅ Frontend is running on http://localhost:5173
3. ✅ PostgreSQL database is running with `swiftcover` database created

---

## Part 1: Starting the Application

### Step 1: Start Backend (Terminal 1)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

**Expected Output:**
```
[START] Starting SwiftCover API...
[DB] Creating database tables...
[ML] Training ML models...
[SEED] Seeding demo data...
[SUCCESS] SwiftCover API ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Verify Backend:**
- Open browser: http://localhost:8000/docs
- You should see the API documentation (Swagger UI)

### Step 2: Start Frontend (Terminal 2)

```powershell
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Verify Frontend:**
- Open browser: http://localhost:5173
- You should see the SwiftCover landing page

---

## Part 2: Worker Onboarding Flow

### Step 3: Navigate to Onboarding

1. Open http://localhost:5173 in your browser
2. Click the "Get Started" or "Register Now" button
3. You'll be redirected to the onboarding page

### Step 4: Fill Worker Registration Form

**Page 1: Personal Information**

Fill in the following details:
- **Name**: Your full name (e.g., "Rahul Kumar")
- **Phone**: 10-digit mobile number (e.g., "9876543210")
- **City**: Select from dropdown
  - Hyderabad
  - Bangalore
  - Mumbai
  - Delhi
  - Pune
- **Zone**: Enter your delivery zone (e.g., "Kondapur", "Bellandur")
- **Dark Store Name**: Your pickup location (e.g., "Blinkit Dark Store - Kondapur")

Click "Next" to continue.

**Page 2: Work Details**

Fill in:
- **Platform**: Select your delivery platform
  - Blinkit
  - Zepto
  - Swiggy Instamart
  - Multiple Platforms
- **Average Daily Orders**: Number of orders you complete per day (e.g., 25)
- **Shift Type**: Your typical work shift
  - Morning (6 AM - 2 PM)
  - Evening (2 PM - 10 PM)
  - Night (10 PM - 6 AM)
  - Flexible
- **Experience (Months)**: How long you've been working (e.g., 12)

Click "Analyze Risk" button.

### Step 5: View Risk Assessment

After clicking "Analyze Risk", you'll see:

**Risk Profile Card:**
- Risk Score: 0-100 (lower is better)
- Risk Tier: Low / Medium / High / Very High
- Risk Factors breakdown:
  - Zone Flood Risk
  - Zone Heat Risk
  - Zone Pollution Risk

**What the scores mean:**
- 0-30: Low Risk (green) - Best rates
- 31-60: Medium Risk (yellow) - Standard rates
- 61-80: High Risk (orange) - Higher premiums
- 81-100: Very High Risk (red) - Highest premiums

### Step 6: Select Insurance Plan

You'll see 3 plan options:

**Basic Plan**
- Weekly Premium: ₹15-25 (varies by risk)
- Daily Coverage: ₹200
- Weekly Coverage: ₹1,000
- Covers: Floods, Heavy Rain
- Min Orders: 8/day

**Standard Plan** (Recommended)
- Weekly Premium: ₹25-40
- Daily Coverage: ₹400
- Weekly Coverage: ₹2,000
- Covers: Floods, Heavy Rain, Extreme Heat
- Min Orders: 10/day

**Premium Plan**
- Weekly Premium: ₹40-60
- Daily Coverage: ₹600
- Weekly Coverage: ₹3,500
- Covers: All disruptions (Floods, Heat, Pollution, Strikes)
- Min Orders: 12/day

**How to choose:**
- High-risk zones (Mumbai floods, Delhi pollution) → Premium
- Medium risk, regular income → Standard
- Low risk, budget-conscious → Basic

Click "Select Plan" on your chosen option.

### Step 7: Confirm and Create Policy

Review your selection:
- Worker details
- Selected plan
- Premium amount
- Coverage details

Click "Create Policy" to complete registration.

**Success!** You'll be redirected to your Worker Dashboard.

---

## Part 3: Worker Dashboard

### Step 8: Explore Your Dashboard

Your dashboard shows:

**1. Policy Status Card**
- Current plan (Basic/Standard/Premium)
- Coverage limits
- Policy validity dates
- Renewal status

**2. Weekly Premium Card**
- Amount due this week
- Payment status
- Due date
- Pay button

**3. Earnings Chart**
- Last 30 days earnings visualization
- Daily breakdown
- Trend analysis

**4. Active Disruptions**
- Current weather/environmental alerts in your city
- Severity levels
- Potential impact on earnings

**5. Recent Claims**
- Your claim history
- Status (Pending/Approved/Paid/Rejected)
- Payout amounts

### Step 9: View Policy Details

Click "View Policy" to see:
- Full policy terms
- Coverage breakdown
- Parametric triggers (what events are covered)
- Payment history
- Renewal options

---

## Part 4: Claims Process (Automatic)

### Step 10: Understanding Automatic Claims

**How it works:**
1. A disruption event occurs (flood, heat wave, pollution)
2. System automatically detects affected workers
3. Claims are evaluated based on:
   - Your expected earnings (AI prediction)
   - Your actual earnings on disruption day
   - Income loss calculation
4. Fraud detection runs automatically
5. Approved claims are paid instantly to your UPI ID

**You don't need to file claims manually!**

### Step 11: Check Claim Status

Go to "Claims" page to see:
- All your claims
- Disruption details
- Expected vs Actual earnings
- Payout amount
- Payment status
- Transaction ID (for paid claims)

**Claim Statuses:**
- ✅ **Paid**: Money sent to your UPI
- ⏳ **Approved**: Awaiting payout processing
- 🔍 **Under Review**: Fraud check in progress
- ❌ **Rejected**: Did not meet criteria
- 🚩 **Flagged**: Manual review required

---

## Part 5: Admin Dashboard (Demo)

### Step 12: Access Admin Dashboard

Navigate to: http://localhost:5173/admin

**Platform Overview:**
- Total active policies
- Total claims processed
- Total payouts made
- Active disruptions

**Recent Claims Table:**
- All claims across all workers
- Fraud scores
- Review actions

**Analytics Charts:**
- Claims by status
- Payouts over time
- Risk distribution

### Step 13: Simulate a Disruption (Demo Feature)

**Purpose:** Test the entire claim flow

1. Go to Admin Dashboard
2. Find "Simulate Disruption" section
3. Fill in:
   - **City**: Select city with active workers
   - **Disruption Type**: Flood / Heat / Pollution / Strike
   - **Severity**: Moderate / Severe / Extreme
   - **Rainfall/Temperature/AQI**: Based on type
4. Click "Simulate Disruption"

**What happens:**
- System creates a disruption event
- Finds all affected workers in that city
- Evaluates claims for each worker
- Processes payouts automatically
- Shows results summary

**Results show:**
- Number of workers affected
- Claims triggered
- Claims approved
- Total payout amount
- Individual claim details

---

## Part 6: Testing the Complete Flow

### Step 14: End-to-End Test

**Test Scenario: Flood in Hyderabad**

1. **Register a worker** in Hyderabad (Kondapur zone)
2. **Select Standard plan**
3. **View dashboard** - note your worker ID
4. **Go to Admin Dashboard**
5. **Simulate disruption:**
   - City: Hyderabad
   - Type: Heavy Rain
   - Severity: Severe
   - Rainfall: 85mm
6. **Check results** - you should see your claim auto-processed
7. **Go back to Worker Dashboard** - see the claim in your history
8. **Check claim details** - see payout amount and status

---

## Troubleshooting

### Backend Not Starting

**Error: Database connection failed**
```
Solution: Check PostgreSQL is running and password is correct
$env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/swiftcover"
```

**Error: Port 8000 already in use**
```
Solution: Kill the process or change port in main.py
```

### Frontend Not Connecting

**Error: Network Error**
```
Solution: 
1. Verify backend is running on http://localhost:8000
2. Check browser console for CORS errors
3. Ensure frontend is on http://localhost:5173
```

**Error: 404 Not Found**
```
Solution: Backend routes might not be registered
Check backend terminal for startup errors
```

### No Demo Data

**Error: No workers found**
```
Solution: Backend seeds demo data on first run
Restart backend to trigger seeding
```

---

## API Testing (Optional)

### Step 15: Test APIs Directly

Open http://localhost:8000/docs

**Try these endpoints:**

1. **Health Check**
   - GET /health
   - Should return: `{"status": "ok", "service": "SwiftCover"}`

2. **Get All Workers**
   - GET /api/workers
   - Returns list of 10 demo workers

3. **Get Analytics**
   - GET /api/analytics/dashboard
   - Returns platform metrics

4. **Get Active Disruptions**
   - GET /api/disruptions/active
   - Returns current disruptions

---

## Key Features to Explore

### 1. Risk-Based Pricing
- Register workers from different cities
- Compare premium differences
- See how experience affects rates

### 2. AI Fraud Detection
- Simulate multiple claims for same worker
- See fraud scores increase
- Claims get flagged for review

### 3. Parametric Triggers
- Different plans cover different events
- Basic: Only floods
- Standard: Floods + heat
- Premium: All events

### 4. Real-time Analytics
- Dashboard updates instantly
- Charts show trends
- Metrics calculated live

---

## Demo Data Included

The system comes with:
- **10 demo workers** across 5 cities
- **10 policies** (3 premium, 4 standard, 3 basic)
- **30 days of activity** per worker
- **4 past disruption events** with claims
- **Payment history** for all workers

You can use these to explore the platform without creating new data.

---

## Next Steps

1. ✅ Complete worker onboarding
2. ✅ Explore dashboard features
3. ✅ Simulate a disruption
4. ✅ Check claim processing
5. ✅ Review admin analytics
6. ✅ Test different scenarios

---

## Support

If you encounter issues:
1. Check both terminals for error messages
2. Verify database connection
3. Clear browser cache and reload
4. Check API docs at /docs endpoint
5. Review logs in terminal

**Happy Testing! 🚀**
