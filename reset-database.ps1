# Reset Axio database — deletes SQLite file so demo data re-seeds on next startup
$dbPath = "backend\axio.db"
$legacyPath = "backend\swiftcover.db"

if (Test-Path $dbPath) {
    Remove-Item $dbPath -Force
    Write-Host "✓ Deleted $dbPath" -ForegroundColor Green
} elseif (Test-Path $legacyPath) {
    Remove-Item $legacyPath -Force
    Write-Host "✓ Deleted $legacyPath" -ForegroundColor Green
} else {
    Write-Host "No database file found — nothing to reset." -ForegroundColor Yellow
}

Write-Host "Restart the backend to re-seed demo data." -ForegroundColor Cyan
