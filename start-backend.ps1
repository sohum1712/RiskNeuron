# Start SwiftCover Backend
Write-Host "[START] Starting SwiftCover Backend..." -ForegroundColor Cyan

# Navigate to backend
Set-Location backend

# Activate virtual environment
Write-Host "[ACTIVATE] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Set environment variables
$env:DATABASE_URL = "postgresql://postgres:swiftcover123@localhost:5432/swiftcover"
$env:CORS_ORIGINS = "http://localhost:5173"

Write-Host "`n[SUCCESS] Starting backend server..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Run the application
python main.py
