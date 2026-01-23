# FBN XAI STARTUP SCRIPT
# Launches all services: Backend and Frontend

Write-Host "Starting FBN XAI System..." -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command node -EA SilentlyContinue)) { 
    Write-Host "ERROR: Node.js not found. Please install Node.js" -ForegroundColor Red
    exit 1 
}
if (-not (Get-Command npm -EA SilentlyContinue)) { 
    Write-Host "ERROR: npm not found" -ForegroundColor Red
    exit 1 
}

Write-Host "OK: Node.js $(node --version), npm $(npm --version)" -ForegroundColor Green
Write-Host ""

# Kill any processes on ports 5000 and 3000
Write-Host "Clearing old processes..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Write-Host "Ports cleared" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "Starting Backend on port 5000..." -ForegroundColor Yellow
$backendDir = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", "cd '$backendDir'; npm start" -WindowStyle Normal
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", "cd '$PSScriptRoot'; npm start" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=============================================="  -ForegroundColor Green
Write-Host "System startup initiated!"  -ForegroundColor Green
Write-Host ""
Write-Host "Dashboard: http://localhost:3000"
Write-Host "Backend:   http://localhost:5000"
Write-Host ""
Write-Host "Credentials:"
Write-Host "  Admin: BobbyFNB@09= / Martin@FNB09"
Write-Host ""
Write-Host "Three Dashboards Ready:"
Write-Host "  - Admin Dashboard (10 sections)"
Write-Host "  - Faculty Dashboard (9 sections)"
Write-Host "  - Student Dashboard (10 sections)"
Write-Host ""
Write-Host "Press Ctrl+C in each terminal to stop services"
Write-Host "=============================================="  -ForegroundColor Green
Write-Host ""

Write-Host "Services are starting. Check the opened terminal windows." -ForegroundColor Cyan
