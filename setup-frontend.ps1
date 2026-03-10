# SwiftCover Frontend Setup Script
Write-Host "[SETUP] Setting up SwiftCover Frontend..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "frontend")) {
    Write-Host "[ERROR] frontend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Navigate to frontend
Set-Location frontend

# Check Node version
Write-Host "`n[CHECK] Checking Node.js version..." -ForegroundColor Yellow
node --version
npm --version

# Install dependencies
Write-Host "`n[INSTALL] Installing npm dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install

Write-Host "`n[SUCCESS] Frontend setup complete!" -ForegroundColor Green
Write-Host "`nTo start the frontend, run:" -ForegroundColor Cyan
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "`nFrontend will be available at: http://localhost:5173" -ForegroundColor Cyan

# Return to root
Set-Location ..
