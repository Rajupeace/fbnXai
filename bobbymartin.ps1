# FBN-XAI Complete System Launcher
# This script starts all services: Frontend, Backend, Database, and AI Agent

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "FBN-XAI FULL-STACK SYSTEM LAUNCHER" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 0. Verify MongoDB Service
Write-Host "Checking MongoDB Service..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "[OK] MongoDB is running on port 27017" -ForegroundColor Green
} else {
    Write-Host "[WARN] MongoDB is NOT running. Starting..." -ForegroundColor Yellow
    try {
        Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "[OK] MongoDB started" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Could not start MongoDB" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Starting all services in separate windows..." -ForegroundColor Cyan
Write-Host ""

# 1. Start Backend Server (Node.js)
Write-Host "Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
try {
    $backendDir = Join-Path $root "backend"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$backendDir`" && title Backend_Server && node index.js" -WindowStyle Normal
    Write-Host "[OK] Backend window launched" -ForegroundColor Green
    Start-Sleep -Seconds 1
} catch {
    Write-Host "[ERROR] Failed to start backend: $_" -ForegroundColor Red
}

# 2. Start AI Agent (Python)
Write-Host "Starting AI Agent (Port 8000)..." -ForegroundColor Yellow
try {
    $aiDir = Join-Path $root "backend\ai_agent"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$aiDir`" && title AI_Agent_VuAI && python main.py" -WindowStyle Normal
    Write-Host "[OK] AI Agent window launched" -ForegroundColor Green
    Start-Sleep -Seconds 1
} catch {
    Write-Host "[ERROR] Failed to start AI Agent: $_" -ForegroundColor Red
}

# 3. Start Frontend (React)
Write-Host "Starting Frontend App (Port 3000)..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$root`" && title Frontend_React && npm start" -WindowStyle Normal
    Write-Host "[OK] Frontend window launched" -ForegroundColor Green
    Start-Sleep -Seconds 1
} catch {
    Write-Host "[ERROR] Failed to start frontend: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "ALL SERVICES LAUNCHING IN SEPARATE WINDOWS" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "SERVICE ENDPOINTS:" -ForegroundColor Cyan
Write-Host "  Frontend Dashboard:   http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend API Server:   http://localhost:5000" -ForegroundColor Yellow
Write-Host "  AI Agent VuAI:        http://localhost:8000" -ForegroundColor Yellow
Write-Host "  Database MongoDB:     mongodb://localhost:27017" -ForegroundColor Yellow

Write-Host ""
Write-Host "Services may take 30-60 seconds to fully initialize" -ForegroundColor Cyan
Write-Host "Monitor logs in each window for startup messages" -ForegroundColor Cyan
Write-Host "If services fail, check error messages in their respective windows" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this launcher window" -ForegroundColor Yellow
Write-Host ""

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
