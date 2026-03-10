# SwiftCover Backend Setup Script
Write-Host "[SETUP] Setting up SwiftCover Backend..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "backend")) {
    Write-Host "[ERROR] backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Navigate to backend
Set-Location backend

# Check Python version
Write-Host "`n[CHECK] Checking Python version..." -ForegroundColor Yellow
python --version

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "`n[CREATE] Creating virtual environment..." -ForegroundColor Yellow
    +
} else {
    Write-Host "`n[OK] Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "`n[ACTIVATE] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "`n[INSTALL] Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Set environment variables
Write-Host "`n[CONFIG] Setting environment variables..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://postgres:swiftcover123@localhost:5432/swiftcover"
$env:CORS_ORIGINS = "http://localhost:5173"

Write-Host "`n[SUCCESS] Backend setup complete!" -ForegroundColor Green
Write-Host "`nTo start the backend, run:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python main.py" -ForegroundColor White
Write-Host "`nBackend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API docs will be at: http://localhost:8000/docs" -ForegroundColor Cyan

# Return to root
Set-Location ..
