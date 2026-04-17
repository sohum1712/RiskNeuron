# Start SwiftCover Backend
Write-Host "[START] Starting SwiftCover Backend..." -ForegroundColor Cyan

# Navigate to backend
Set-Location backend

# Activate virtual environment
Write-Host "[ACTIVATE] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Environment variables are loaded from .env file via python-dotenv in the app

Write-Host "`n[SUCCESS] Starting backend server..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Run the application
python main.py
