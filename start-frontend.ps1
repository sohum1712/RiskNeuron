# Start SwiftCover Frontend
Write-Host "[START] Starting SwiftCover Frontend..." -ForegroundColor Cyan

# Navigate to frontend
Set-Location frontend

Write-Host "`n[SUCCESS] Starting development server..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Run the development server
npm run dev
