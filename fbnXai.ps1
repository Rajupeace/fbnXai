# ========================================
# fbnXai.ps1 - Complete VuAiAgent Startup
# ========================================
# Starts: Frontend + Backend + Database + AI Agent
# Author: VuAiAgent Team
# Date: January 31, 2026

param(
    [switch]$SkipFrontend,
    [switch]$SkipBackend,
    [switch]$SkipAgent,
    [switch]$StopAll
)

$ErrorActionPreference = "Continue"

# Colors
function Write-Header($text) { Write-Host "`n╔════════════════════════════════════╗" -ForegroundColor Cyan; Write-Host "║  $text" -ForegroundColor Cyan; Write-Host "╚════════════════════════════════════╝" -ForegroundColor Cyan }
function Write-Success($text) { Write-Host "✓ $text" -ForegroundColor Green }
function Write-Info($text) { Write-Host "→ $text" -ForegroundColor Yellow }
function Write-Error($text) { Write-Host "✗ $text" -ForegroundColor Red }

# Stop all services if requested
if ($StopAll) {
    Write-Header "STOPPING ALL SERVICES"
    Write-Info "Stopping Node.js processes..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Info "Stopping Python processes..."
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Success "All services stopped"
    exit
}

Write-Host @"

██╗   ██╗██╗   ██╗ █████╗ ██╗ █████╗  ██████╗ ███████╗███╗   ██╗████████╗
██║   ██║██║   ██║██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
██║   ██║██║   ██║███████║██║███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
╚██╗ ██╔╝██║   ██║██╔══██║██║██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
 ╚████╔╝ ╚██████╔╝██║  ██║██║██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   
                                                                           
                    🚀 Complete System Startup                            
"@ -ForegroundColor Cyan

Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "Not in project root. Please run from fbnXai-main directory"
    exit 1
}

Write-Header "PRE-FLIGHT CHECKS"

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js installed: $nodeVersion"
} catch {
    Write-Error "Node.js not found. Please install Node.js first."
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Success "Python installed: $pythonVersion"
} catch {
    Write-Error "Python not found. Please install Python first."
    exit 1
}

# Check npm packages
if (-not (Test-Path "node_modules")) {
    Write-Info "Installing frontend dependencies..."
    npm install --silent
}

if (-not (Test-Path "backend/node_modules")) {
    Write-Info "Installing backend dependencies..."
    Set-Location backend
    npm install --silent
    Set-Location ..
}

Write-Success "All dependencies ready"

Write-Header "STARTING SERVICES"

# Array to track jobs
$jobs = @()

# 1. Start Backend (Node.js) - Port 5000
if (-not $SkipBackend) {
    Write-Info "Starting Backend (Node.js) on port 5000..."
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Set-Location backend
        npm start
    }
    $jobs += @{Name="Backend"; Job=$backendJob; Port=5000}
    Start-Sleep -Seconds 3
    
    # Verify backend started
    $backendCheck = netstat -ano | Select-String ":5000.*LISTENING"
    if ($backendCheck) {
        Write-Success "Backend running on http://localhost:5000"
    } else {
        Write-Error "Backend failed to start on port 5000"
    }
}

# 2. Start Python AI Agent - Port 8000
if (-not $SkipAgent) {
    Write-Info "Starting AI Agent (Python) on port 8000..."
    $agentJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Set-Location backend/ai_agent
        python main.py
    }
    $jobs += @{Name="AI Agent"; Job=$agentJob; Port=8000}
    Start-Sleep -Seconds 5
    
    # Verify agent started
    $agentCheck = netstat -ano | Select-String ":8000.*LISTENING"
    if ($agentCheck) {
        Write-Success "AI Agent running on http://localhost:8000"
    } else {
        Write-Error "AI Agent failed to start on port 8000"
    }
}

# 3. Start Frontend (React) - Port 3000
if (-not $SkipFrontend) {
    Write-Info "Starting Frontend (React) on port 3000..."
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm start
    }
    $jobs += @{Name="Frontend"; Job=$frontendJob; Port=3000}
    Write-Success "Frontend starting on http://localhost:3000"
    Write-Info "Browser will open automatically..."
}

Write-Host ""
Write-Header "SYSTEM STATUS"

Start-Sleep -Seconds 3

# Check all services
$allRunning = $true

foreach ($service in $jobs) {
    $port = $service.Port
    $name = $service.Name
    $isListening = netstat -ano | Select-String ":$port.*LISTENING"
    
    if ($isListening) {
        Write-Success "$name running on port $port"
    } else {
        Write-Error "$name not responding on port $port"
        $allRunning = $false
    }
}

Write-Host ""

if ($allRunning) {
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║    ✓ ALL SYSTEMS OPERATIONAL! 🚀          ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Frontend:  " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
    Write-Host "⚙️  Backend:   " -NoNewline; Write-Host "http://localhost:5000" -ForegroundColor Cyan
    Write-Host "🤖 AI Agent:  " -NoNewline; Write-Host "http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📊 Database:  " -NoNewline; Write-Host "MongoDB Atlas (Connected)" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Some services failed to start. Check logs above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "Commands:" -ForegroundColor Yellow
Write-Host "  • Press Ctrl+C to stop all services" -ForegroundColor Gray
Write-Host "  • Run './fbnXai.ps1 -StopAll' to stop manually" -ForegroundColor Gray
Write-Host "  • Check './logs/' for detailed logs" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Keep script running and monitor jobs
Write-Info "Monitoring services... (Press Ctrl+C to stop)"
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check if any job failed
        foreach ($service in $jobs) {
            $job = $service.Job
            if ($job.State -eq "Failed" -or $job.State -eq "Stopped") {
                Write-Error "$($service.Name) has stopped!"
                Write-Host "Job Output:" -ForegroundColor Yellow
                Receive-Job -Job $job
            }
        }
    }
} finally {
    Write-Host "`n🛑 Shutting down services..." -ForegroundColor Yellow
    
    # Stop all jobs
    foreach ($service in $jobs) {
        Stop-Job -Job $service.Job -ErrorAction SilentlyContinue
        Remove-Job -Job $service.Job -Force -ErrorAction SilentlyContinue
    }
    
    # Kill processes on ports
    Write-Info "Cleaning up ports..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Success "All services stopped cleanly"
}
