# Clear Vite cache and node_modules cache
Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "✓ Vite cache cleared" -ForegroundColor Green
}

Write-Host "Clearing browser cache instructions:" -ForegroundColor Yellow
Write-Host "1. Open DevTools (F12)" -ForegroundColor Cyan
Write-Host "2. Right-click on Refresh button" -ForegroundColor Cyan
Write-Host "3. Select 'Empty Cache and Hard Reload'" -ForegroundColor Cyan
Write-Host "Or press CTRL + SHIFT + R" -ForegroundColor Cyan

Write-Host "`nRestarting dev server..." -ForegroundColor Yellow
Write-Host "Run: npm run dev" -ForegroundColor Green

