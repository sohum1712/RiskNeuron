# 🚀 SwiftCover Quick Start (5 Minutes)

## Before You Begin

You have:
- ✅ Python 3.13.11
- ✅ Node.js v22.19.0
- ❌ PostgreSQL (needs installation)

---

## Step 1: Install PostgreSQL (5 minutes)

1. **Download**: https://www.postgresql.org/download/windows/
2. **Install** with password: `swiftcover123`
3. **Create database**:
   ```powershell
   psql -U postgres
   # Password: swiftcover123
   CREATE DATABASE swiftcover;
   \q
   ```

---

## Step 2: Setup (2 minutes)

Open PowerShell in the project folder:

```powershell
# Setup backend
.\setup-backend.ps1

# Setup frontend (in new terminal)
.\setup-frontend.ps1
```

---

## Step 3: Run (30 seconds)

**Terminal 1:**
```powershell
.\start-backend.ps1
```

Wait for: `✅ SwiftCover API ready!`

**Terminal 2:**
```powershell
.\start-frontend.ps1
```

---

## Step 4: Open Browser

Visit: **http://localhost:5173**

---

## 🎯 Try This First

1. Click **"Admin Console"**
2. Go to **"Simulator"** tab
3. Select:
   - City: Hyderabad
   - Disruption: Heavy Rain
   - Severity: Severe
4. Click **"🔴 TRIGGER DISRUPTION"**
5. Watch the magic happen! ✨

You'll see:
- Workers being evaluated
- Fraud detection running
- Claims approved/rejected
- UPI payouts processed
- All in real-time!

---

## 🆘 Problems?

### PostgreSQL won't connect
```powershell
# Check if running
Get-Service postgresql*

# Start if needed
Start-Service postgresql-x64-15
```

### Port already in use
```powershell
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <number> /F
```

### Execution policy error
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📚 Full Documentation

See **README.md** for complete details.

---

That's it! You're ready to explore SwiftCover! 🎉
