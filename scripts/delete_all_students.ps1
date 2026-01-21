# Delete All Student Data from MongoDB and File Database
# This script removes ALL student data from both databases

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        DELETE ALL STUDENT DATA - CONFIRMATION DIALOG      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  WARNING!" -ForegroundColor Yellow
Write-Host ""
Write-Host "This script will PERMANENTLY DELETE all student data from:" -ForegroundColor Yellow
Write-Host "  • MongoDB database (Students collection)" -ForegroundColor Red
Write-Host "  • File-based database" -ForegroundColor Red
Write-Host "  • Student-Faculty relationships" -ForegroundColor Red
Write-Host ""
Write-Host "This action CANNOT be undone!" -ForegroundColor Yellow
Write-Host ""

# Confirmation prompt
$confirmation = Read-Host "Are you absolutely sure? Type 'DELETE ALL STUDENTS' to confirm"

if ($confirmation -ne "DELETE ALL STUDENTS") {
    Write-Host ""
    Write-Host "❌ Deletion cancelled. No data was removed." -ForegroundColor Red
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "🔄 Starting deletion process..." -ForegroundColor Green
Write-Host ""

$backendDir = Join-Path $PSScriptRoot "backend"

try {
    Push-Location $backendDir
    
    # Run the deletion script
    Write-Host "Executing deletion script..." -ForegroundColor Cyan
    node scripts/delete_all_students.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║          ✅ ALL STUDENT DATA DELETED SUCCESSFULLY          ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Database Status:" -ForegroundColor Yellow
        Write-Host "  ✅ MongoDB: All students removed" -ForegroundColor Green
        Write-Host "  ✅ File Database: All students removed" -ForegroundColor Green
        Write-Host "  ✅ Relationships: All cleaned up" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next Steps:" -ForegroundColor Cyan
        Write-Host "  1. Restart your backend: node index.js" -ForegroundColor White
        Write-Host "  2. Refresh your frontend dashboard" -ForegroundColor White
        Write-Host "  3. Student list will be empty" -ForegroundColor White
        Write-Host "  4. Ready to register new students" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Deletion process encountered errors" -ForegroundColor Red
        Write-Host "Check the output above for details" -ForegroundColor Red
        Write-Host ""
    }
    
    Pop-Location
} catch {
    Write-Host "❌ Error executing deletion script: $_" -ForegroundColor Red
    Pop-Location
}

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
