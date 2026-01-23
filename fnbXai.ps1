# ========================================
# FBN XAI - UNIFIED SYSTEM LAUNCHER
# ========================================
# Single master script for all operations
# Usage: .\fnbXai.ps1 [command] [options]

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'setup', 'frontend', 'backend', 'agent', 'help')]
    [string]$Command = 'start',
    
    [switch]$SkipMongo,
    [switch]$SkipAgent,
    [switch]$CleanStart
)

$ErrorActionPreference = "SilentlyContinue"

# ========================================
# CONFIGURATION
# ========================================
$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = $projectRoot
$aiAgentPath = Join-Path $backendPath "ai_agent"

# ========================================
# HELPER FUNCTIONS
# ========================================
function Test-Port {
    param([int]$Port)
    try {
        $tcp = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        return $tcp.TcpTestSucceeded
    }
    catch { return $false }
}

function Kill-Port {
    param([int]$Port)
    $procs = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue 
    if ($procs) {
        Write-Host "   Freeing port $Port..." -ForegroundColor Yellow
        $procs | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Milliseconds 500
    }
}

function Check-Command {
    param([string]$Command, [string]$Name)
    if (-not (Get-Command $Command -EA SilentlyContinue)) {
        Write-Host "ERROR: $Name is not installed or not in PATH" -ForegroundColor Red
        return $false
    }
    return $true
}

function Check-Directory {
    param([string]$Path, [string]$Name)
    if (-not (Test-Path $Path)) {
        Write-Host "ERROR: $Name not found at $Path" -ForegroundColor Red
        return $false
    }
    return $true
}

function Show-Help {
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║         FBN XAI SYSTEM - UNIFIED LAUNCHER HELP            ║
╚════════════════════════════════════════════════════════════╝

USAGE:  .\fnbXai.ps1 [command] [options]

COMMANDS:
  setup              Install all dependencies (first time only)
  start              Start all services (DEFAULT)
  frontend           Start frontend only
  backend            Start backend only
  agent              Start AI Agent only
  stop               Stop all services
  help               Show this help message

OPTIONS (with 'start' command):
  -CleanStart        Kill old processes before starting
  -SkipMongo         Start without MongoDB database
  -SkipAgent         Start without AI Agent
  
EXAMPLES:
  .\fnbXai.ps1                           # Start all services
  .\fnbXai.ps1 start -CleanStart          # Clean start
  .\fnbXai.ps1 start -SkipMongo           # Start without database
  .\fnbXai.ps1 frontend                   # Frontend only
  .\fnbXai.ps1 backend                    # Backend only
  .\fnbXai.ps1 agent                      # AI Agent only
  .\fnbXai.ps1 stop                       # Stop everything
  .\fnbXai.ps1 setup                      # Install dependencies

AFTER STARTUP:
  Frontend:   http://localhost:3000
  Backend:    http://localhost:5000
  Database:   localhost:27017 (MongoDB)
  
"@ -ForegroundColor Green
}

# ========================================
# COMMAND ROUTING
# ========================================

if ($Command -eq 'help') {
    Show-Help
    exit 0
}

if ($Command -eq 'setup') {
    Clear-Host
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║              FBN XAI SYSTEM - SETUP WIZARD                ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

    Write-Host "`nChecking prerequisites..." -ForegroundColor Green
    
    $setupOK = $true
    $setupOK = (Check-Command "node" "Node.js") -and $setupOK
    $setupOK = (Check-Command "npm" "npm") -and $setupOK
    $setupOK = (Check-Directory $projectRoot "Project Root") -and $setupOK
    $setupOK = (Check-Directory $backendPath "Backend") -and $setupOK
    $setupOK = (Check-Directory $frontendPath "Frontend") -and $setupOK

    if (-not $setupOK) {
        Write-Host "`nERROR: Setup failed!" -ForegroundColor Red
        exit 1
    }

    Write-Host "✓ Node.js $(node --version)" -ForegroundColor Green
    Write-Host "✓ npm $(npm --version)" -ForegroundColor Green
    Write-Host "✓ All directories found" -ForegroundColor Green

    Write-Host "`nInstalling Backend dependencies..." -ForegroundColor Green
    Push-Location $backendPath
    npm install
    Pop-Location

    Write-Host "`nInstalling Frontend dependencies..." -ForegroundColor Green
    Push-Location $frontendPath
    npm install
    Pop-Location

    if (Get-Command python -EA SilentlyContinue) {
        Write-Host "`nInstalling Python dependencies..." -ForegroundColor Green
        Push-Location $aiAgentPath
        if (Test-Path "requirements.txt") {
            python -m pip install -r requirements.txt
        }
        Pop-Location
    }

    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║              ✓ SETUP COMPLETE                             ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green
    exit 0
}

if ($Command -eq 'stop') {
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║              FBN XAI - STOPPING ALL SERVICES              ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Red

    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Kill-Port 3000
    Kill-Port 5000
    Kill-Port 27017
    Kill-Port 8000

    Write-Host "`nStopping Python processes..." -ForegroundColor Yellow
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║              ✓ ALL SERVICES STOPPED                       ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green
    exit 0
}

if ($Command -eq 'frontend') {
    Clear-Host
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║              FBN XAI FRONTEND LAUNCHER                     ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

    Write-Host "`nClearing port 3000..." -ForegroundColor Green
    Kill-Port 3000

    Write-Host "Checking dependencies..." -ForegroundColor Green
    Push-Location $frontendPath
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Cyan
        npm install --silent
    }
    Pop-Location

    Write-Host "`nStarting Frontend Server..." -ForegroundColor Green
    Write-Host "URL: http://localhost:3000`n" -ForegroundColor Cyan
    Push-Location $frontendPath
    npm start
    Pop-Location
}

if ($Command -eq 'backend') {
    Clear-Host
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║              FBN XAI BACKEND LAUNCHER                      ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

    Write-Host "`nClearing port 5000..." -ForegroundColor Green
    Kill-Port 5000

    Write-Host "Checking dependencies..." -ForegroundColor Green
    Push-Location $backendPath
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Cyan
        npm install --silent
    }
    Pop-Location

    Write-Host "`nStarting Backend Server..." -ForegroundColor Green
    Write-Host "URL: http://localhost:5000`n" -ForegroundColor Cyan
    Push-Location $backendPath
    npm start
    Pop-Location
}

if ($Command -eq 'agent') {
    Clear-Host
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║              FBN XAI AI AGENT LAUNCHER                     ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

    Write-Host "`nChecking Python installation..." -ForegroundColor Green
    if (-not (Get-Command python -EA SilentlyContinue)) {
        Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Python $(python --version)" -ForegroundColor Green

    Write-Host "`nChecking Python dependencies..." -ForegroundColor Green
    Push-Location $aiAgentPath
    if (Test-Path "requirements.txt") {
        python -m pip install -r requirements.txt --quiet 2>$null
        Write-Host "✓ Dependencies ready" -ForegroundColor Green
    }
    Pop-Location

    Write-Host "`nStarting AI Agent..." -ForegroundColor Green
    Write-Host "Run directory: $aiAgentPath`n" -ForegroundColor Cyan
    Push-Location $aiAgentPath
    python main.py
    Pop-Location
}

if ($Command -eq 'start') {
    Clear-Host
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║                 FBN XAI SYSTEM LAUNCHER                    ║
║                   Starting All Services                    ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

    # Prerequisites Check
    Write-Host "`n[1/5] Checking prerequisites..." -ForegroundColor Green

    $prereqsOK = $true
    $prereqsOK = (Check-Command "node" "Node.js") -and $prereqsOK
    $prereqsOK = (Check-Command "npm" "npm") -and $prereqsOK
    $prereqsOK = (Check-Directory $projectRoot "Project Root") -and $prereqsOK
    $prereqsOK = (Check-Directory $backendPath "Backend") -and $prereqsOK
    $prereqsOK = (Check-Directory $frontendPath "Frontend") -and $prereqsOK

    if (-not $SkipAgent) {
        if (-not (Check-Command "python" "Python")) {
            Write-Host "  WARNING: Python not found. AI Agent will be skipped." -ForegroundColor Yellow
            $SkipAgent = $true
        }
    }

    if (-not $prereqsOK) {
        Write-Host "`nERROR: Prerequisites check failed!" -ForegroundColor Red
        exit 1
    }

    Write-Host "  ✓ Node.js $(node --version)" -ForegroundColor Green
    Write-Host "  ✓ npm $(npm --version)" -ForegroundColor Green
    Write-Host "  ✓ All directories found" -ForegroundColor Green

    # Always clear ports to prevent EADDRINUSE errors
    Write-Host "`n[2/5] Clearing ports..." -ForegroundColor Green
    Write-Host "  Clearing port 5000 (Backend)..." -ForegroundColor Cyan
    Kill-Port 5000
    Write-Host "  Clearing port 3000 (Frontend)..." -ForegroundColor Cyan
    Kill-Port 3000
    
    if ($CleanStart) {
        Write-Host "  Clearing port 27017 (MongoDB)..." -ForegroundColor Cyan
        Kill-Port 27017
        Write-Host "  Clearing port 8000 (AI Agent)..." -ForegroundColor Cyan
        Kill-Port 8000
        Write-Host "  Clearing Python processes..." -ForegroundColor Cyan
        Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "  ✓ Ports cleared" -ForegroundColor Green
    Start-Sleep -Milliseconds 500

    # Install Dependencies
    Write-Host "`n[3/5] Installing dependencies..." -ForegroundColor Green

    Write-Host "  Installing backend dependencies..." -ForegroundColor Cyan
    Push-Location $backendPath
    if (-not (Test-Path "node_modules")) {
        npm install --silent
        Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  ✓ Backend dependencies already installed" -ForegroundColor Green
    }
    Pop-Location

    Write-Host "  Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location $frontendPath
    if (-not (Test-Path "node_modules")) {
        npm install --silent
        Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  ✓ Frontend dependencies already installed" -ForegroundColor Green
    }
    Pop-Location

    if (-not $SkipAgent) {
        Write-Host "  Installing Python dependencies..." -ForegroundColor Cyan
        Push-Location $aiAgentPath
        if (Test-Path "requirements.txt") {
            python -m pip install -r requirements.txt --quiet 2>$null
            Write-Host "  ✓ Python dependencies installed" -ForegroundColor Green
        }
        Pop-Location
    }

    # MongoDB Startup
    if (-not $SkipMongo) {
        Write-Host "`n[4/5] Starting MongoDB..." -ForegroundColor Green
        if (Test-Port 27017) {
            Write-Host "  ✓ MongoDB already running on port 27017" -ForegroundColor Green
        } else {
            Write-Host "  Attempting to start MongoDB..." -ForegroundColor Cyan
            Start-Process mongod -WindowStyle Hidden -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 3
            if (Test-Port 27017) {
                Write-Host "  ✓ MongoDB started successfully" -ForegroundColor Green
            } else {
                Write-Host "  WARNING: Could not start MongoDB. Make sure mongod is installed." -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "`n[4/5] MongoDB startup skipped (-SkipMongo)" -ForegroundColor Yellow
    }

    # Services Startup
    Write-Host "`n[5/5] Starting all services..." -ForegroundColor Green
    Write-Host "  Opening windows for each service..." -ForegroundColor Cyan

    Write-Host "  → Starting Backend (Node.js on port 5000)..." -ForegroundColor Cyan
    Push-Location $backendPath
    Start-Sleep -Milliseconds 500
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    Pop-Location
    Start-Sleep -Seconds 3

    Write-Host "  → Starting Frontend (React on port 3000)..." -ForegroundColor Cyan
    Push-Location $frontendPath
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    Pop-Location
    Start-Sleep -Seconds 3

    if (-not $SkipAgent) {
        Write-Host "  → Starting AI Agent (Python)..." -ForegroundColor Cyan
        Push-Location $aiAgentPath
        Start-Process pwsh -ArgumentList "-NoExit", "-Command", "python main.py" -WindowStyle Normal
        Pop-Location
        Start-Sleep -Seconds 2
    }

    # Startup Complete
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║              ✓ ALL SERVICES STARTED SUCCESSFULLY           ║
╠════════════════════════════════════════════════════════════╣
║  Frontend:  http://localhost:3000                          ║
║  Backend:   http://localhost:5000                          ║
║  Database:  MongoDB on port 27017                          ║
║  AI Agent:  Running in separate window                     ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

    Write-Host "`nWindows will open automatically for each service." -ForegroundColor Gray
    Write-Host "Close any window to stop that service." -ForegroundColor Gray
    Write-Host "Note: Use Ctrl+C in each window to stop services." -ForegroundColor Gray
    Write-Host "`nFor help: .\fnbXai.ps1 help" -ForegroundColor Gray

    exit 0
}
