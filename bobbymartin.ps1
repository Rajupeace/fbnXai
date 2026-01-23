# FBN XAI STARTUP SCRIPT v3.0
# Launches all services: MongoDB, Backend, Frontend

param([switch]$SkipMongo)

Write-Host "
Starting FBN XAI System...
"

function Test-Port {
    param([int]$Port)
    try {
        (Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue).TcpTestSucceeded
    }
    catch { $false }
}

function Kill-Port {
    param([int]$Port)
    Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

# Prerequisites
Write-Host "Checking prerequisites..."
if (-not (Get-Command node -EA SilentlyContinue)) { Write-Host "ERROR: Node.js not found"; exit 1 }
if (-not (Get-Command npm -EA SilentlyContinue)) { Write-Host "ERROR: npm not found"; exit 1 }
Write-Host "OK: Node.js $(node --version), npm $(npm --version)
"

# MongoDB
if (-not $SkipMongo) {
    Write-Host "Starting MongoDB..."
    if (Test-Port 27017) { Write-Host "Already running on port 27017
" }
    else {
        Start-Process mongod -WindowStyle Hidden -EA SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "MongoDB started
"
    }
}

# Clear ports
Write-Host "Clearing old processes..."
Kill-Port 5000
Kill-Port 3000
Write-Host "Ports cleared
"

# Backend
Write-Host "Starting Backend..."
Push-Location backend
$backendProcess = Start-Process powershell -ArgumentList '-NoExit -NoProfile -Command "npm start"' -PassThru
Write-Host "Backend started (PID: $($backendProcess.Id))"
Pop-Location
Start-Sleep -Seconds 3

# Frontend
Write-Host "Starting Frontend...
"
$frontendProcess = Start-Process powershell -ArgumentList '-NoExit -NoProfile -Command "npm start"' -PassThru
Write-Host "Frontend started (PID: $($frontendProcess.Id))
"
Start-Sleep -Seconds 5

# Verify
Write-Host "Verifying services...
"
Write-Host "MongoDB:  $(if (Test-Port 27017) { 'RUNNING' } else { 'checking...' }) port 27017"
Write-Host "Backend:  $(if (Test-Port 5000) { 'RUNNING' } else { 'starting...' }) port 5000"
Write-Host "Frontend: $(if (Test-Port 3000) { 'RUNNING' } else { 'starting...' }) port 3000
"

# Status
Write-Host "=============================================="
Write-Host "System startup initiated!"
Write-Host ""
Write-Host "Dashboard: http://localhost:3000"
Write-Host "Backend:   http://localhost:5000"
Write-Host "Login: BobbyFNB@09= / Martin@FNB09"
Write-Host ""
Write-Host "Three Dashboards Ready:"
Write-Host "  - Admin Dashboard (10 sections)"
Write-Host "  - Faculty Dashboard (9 sections)"
Write-Host "  - Student Dashboard (10 sections)"
Write-Host ""
Write-Host "Press Ctrl+C to stop all services"
Write-Host "=============================================="
Write-Host ""

# Keep running
while ($true) { Start-Sleep 1 }
