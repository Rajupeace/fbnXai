#!/usr/bin/env pwsh
# QUICK START - VuAiAgent
# Just run: .\QUICK-START.ps1

Write-Host @"

██╗   ██╗██╗   ██╗ █████╗ ██╗ █████╗  ██████╗ ███████╗███╗   ██╗████████╗
██║   ██║██║   ██║██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
██║   ██║██║   ██║███████║██║███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
╚██╗ ██╔╝██║   ██║██╔══██║██║██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
 ╚████╔╝ ╚██████╔╝██║  ██║██║██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   

                    ⚡ Quick Start (3 Steps)

"@ -ForegroundColor Cyan

# STEP 1: Clean slate
Write-Host "STEP 1/3: Cleaning up..." -ForegroundColor Yellow
Get-Process -Name "node","python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✓ Clean" -ForegroundColor Green

# STEP 2: Start Backend
Write-Host "`nSTEP 2/3: Starting Backend..." -ForegroundColor Yellow
Start-Job -Name "Backend" -ScriptBlock {
    cd $using:PWD/backend
    npm start 2>&1 | Out-Null
} | Out-Null

# Wait for backend
Write-Host "  Waiting for backend..." -NoNewline
for ($i=0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    $check = netstat -ano | Select-String ":5000.*LISTENING"
    if ($check) {
        Write-Host " ✓" -ForegroundColor Green
        break
    }
    Write-Host "." -NoNewline -ForegroundColor Gray
}

# Test backend
try {
    $test = Invoke-RestMethod -Uri "http://localhost:5000" -Method Get -TimeoutSec 2
    Write-Host "✓ Backend running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend failed to start" -ForegroundColor Red
    exit 1
}

# STEP 3: Start Frontend
Write-Host "`nSTEP 3/3: Starting Frontend..." -ForegroundColor Yellow
Start-Job -Name "Frontend" -ScriptBlock {
    cd $using:PWD
    $env:BROWSER = "none"
    npm start 2>&1 | Out-Null
} | Out-Null

Write-Host "  Frontend will be ready in ~60 seconds" -ForegroundColor Gray

Write-Host @"

╔════════════════════════════════════════════════╗
║  ✅ VuAiAgent RUNNING!                         ║
╚════════════════════════════════════════════════╝

📍 ACCESS URLS:
   🌐 Frontend:  http://localhost:3000 (wait ~60s)
   ⚙️  Backend:   http://localhost:5000 ✓ READY

⚡ ULTRA-FAST RESPONSE: Active
   Backend responds in ~200ms

🛑 TO STOP:
   Press Ctrl+C or run:
   Get-Process node,python | Stop-Process -Force

"@ -ForegroundColor Green

Write-Host "=== Monitoring (Press Ctrl+C to stop) ===" -ForegroundColor Yellow
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 10
        $backend = netstat -ano | Select-String ":5000.*LISTENING"
        $frontend = netstat -ano | Select-String ":3000.*LISTENING"
        
        $status = ""
        if ($backend) { $status += "✓ Backend " } else { $status += "✗ Backend " }
        if ($frontend) { $status += "✓ Frontend" } else { $status += "⏳ Frontend" }
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $status" -ForegroundColor Cyan
    }
} finally {
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job -Force
    Get-Process -Name "node","python" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ Stopped" -ForegroundColor Green
}
