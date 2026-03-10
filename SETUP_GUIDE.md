# SwiftCover Local Setup Guide (Windows)

## Prerequisites Status
✅ Python 3.13.11 - Installed
✅ Node.js v22.19.0 - Installed
❌ Docker - Not installed (we'll run locally instead)
⚠️ PostgreSQL - Needs to be installed

## Option 1: Full Setup with PostgreSQL (Recommended)

### Step 1: Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer, set password: `swiftcover123`
3. Keep default port: 5432

### Step 2: Setup Backend
```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Set environment variables
$env:DATABASE_URL="postgresql://postgres:swiftcover123@localhost:5432/swiftcover"
$env:CORS_ORIGINS="http://localhost:5173"

# Create database (run in PostgreSQL)
# psql -U postgres
# CREATE DATABASE swiftcover;
# \q

# Run the backend
python main.py
```

Backend will start at: http://localhost:8000

### Step 3: Setup Frontend (New Terminal)
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the frontend
npm run dev
```

Frontend will start at: http://localhost:5173

---

## Option 2: Quick Setup with SQLite (Easier)

If you don't want to install PostgreSQL, I can modify the project to use SQLite (file-based database).

Would you like me to:
1. Continue with PostgreSQL setup (more production-like)
2. Switch to SQLite (simpler, no installation needed)

---

## What Happens on First Run?

When you start the backend, it will automatically:
1. ✅ Create all database tables
2. ✅ Train ML models (fraud detection)
3. ✅ Seed demo data:
   - 10 workers across 5 cities
   - Active policies for each worker
   - 30 days of activity history
   - 4 past disruption events with claims

This takes about 10-15 seconds on first run.

---

## Troubleshooting

### If you get "execution policy" error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### If PostgreSQL connection fails:
Check that PostgreSQL service is running:
```powershell
Get-Service -Name postgresql*
```

### If port 8000 or 5173 is already in use:
Find and kill the process:
```powershell
# Find process on port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

---

## Next Steps

Once both servers are running:
1. Open browser: http://localhost:5173
2. Click "Get Protected" to start onboarding
3. Or click "Admin Console" to access the simulator

The simulator is the key demo feature - you can trigger disruptions and watch claims process in real-time!
