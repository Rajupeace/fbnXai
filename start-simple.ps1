#!/usr/bin/env pwsh
# Simple Direct Startup - Runs all services in separate terminals
# This is more reliable than background jobs

param([switch]$StopAll)

if ($StopAll) {
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ All services stopped" -ForegroundColor Green
    exit
}

Write-Host @"

🚀 Starting VuAiAgent Services
================================

This will open 3 terminal windows:
  1. Backend (Node.js) - Port 5000
  2. AI Agent (Python) - Port 8000  
  3. Frontend (React) - Port 3000

"@ -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "✗ Not in project root directory" -ForegroundColor Red
    exit 1
}

# 1. Start Backend
Write-Host "→ Starting Backend..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend Starting...' -ForegroundColor Cyan; npm start"

Start-Sleep -Seconds 5

# 2. Start AI Agent  
Write-Host "→ Starting AI Agent..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend\ai_agent'; Write-Host '🤖 AI Agent Starting...' -ForegroundColor Cyan; python main.py"

Start-Sleep -Seconds 5

# 3. Start Frontend
Write-Host "→ Starting Frontend..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🌐 Frontend Starting...' -ForegroundColor Cyan; npm start"

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "✓ All services starting in separate windows" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White  
Write-Host "  AI Agent:  http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  ./start-simple.ps1 -StopAll" -ForegroundColor White
Write-Host ""
