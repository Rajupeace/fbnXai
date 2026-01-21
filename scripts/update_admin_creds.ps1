# Admin Credentials Update Script
# Updates all admin credentials to: BobbyFNB@09= / Martin@FNB09

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "ADMIN CREDENTIALS UPDATE SCRIPT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$backendDir = Join-Path $PSScriptRoot "backend"

Write-Host "📝 New Admin Credentials:" -ForegroundColor Yellow
Write-Host "   Username (adminId): BobbyFNB@09=" -ForegroundColor Green
Write-Host "   Password: Martin@FNB09" -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB Service..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB is NOT running. Starting..." -ForegroundColor Yellow
    try {
        Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        Write-Host "✅ MongoDB started" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not start MongoDB" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Running admin credential update..." -ForegroundColor Cyan
Write-Host ""

# Run the update script
try {
    Push-Location $backendDir
    
    # Run the update admin credentials script
    node scripts/update_admin_credentials.js
    
    Pop-Location
    
    Write-Host ""
    Write-Host "✅ Admin credentials have been updated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start the backend: cd backend && node index.js" -ForegroundColor Cyan
    Write-Host "2. Login with:" -ForegroundColor Cyan
    Write-Host "   - Username: BobbyFNB@09=" -ForegroundColor Green
    Write-Host "   - Password: Martin@FNB09" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error updating credentials: $_" -ForegroundColor Red
    Pop-Location
}

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
