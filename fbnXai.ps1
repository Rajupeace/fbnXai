# ══════════════════════════════════════════════════════════════
# 🎓 FBN XAI - MASTER CONTROL SCRIPT
# ══════════════════════════════════════════════════════════════
# All-in-one script for system management and diagnostics
# Usage: .\fbnXai.ps1 [command] [options]
# ══════════════════════════════════════════════════════════════

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'setup', 'frontend', 'backend', 'agent', 'test', 'check', 'fix', 'help')]
    [string]$Command = 'start',
    
    [switch]$SkipMongo,
    [switch]$SkipAgent,
    [switch]$CleanStart
)

$ErrorActionPreference = "SilentlyContinue"

# ══════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════
$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = $projectRoot
$aiAgentPath = Join-Path $backendPath "ai_agent"

# ══════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ══════════════════════════════════════════════════════════════

function Show-Header {
    param([string]$Title, [string]$Color = 'Cyan')
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $Color
    Write-Host "║  $Title" -ForegroundColor $Color
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor $Color
}

function Show-Section {
    param([string]$Title)
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "$Title" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
}

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
    param([string]$CommandName, [string]$Name)
    if (-not (Get-Command $CommandName -EA SilentlyContinue)) {
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

# ══════════════════════════════════════════════════════════════
# DIAGNOSTIC FUNCTIONS
# ══════════════════════════════════════════════════════════════

function Test-SystemHealth {
    Show-Header "🏥 SYSTEM HEALTH CHECK" "Green"
    
    Write-Host "1️⃣  Checking Backend Server..." -ForegroundColor Yellow
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5
        Write-Host "   ✅ Backend server is running on port 5000" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Backend server is NOT running!" -ForegroundColor Red
        Write-Host "   Action: Run '.\fbnXai.ps1 start'`n" -ForegroundColor Yellow
    }

    Write-Host "`n2️⃣  Checking Component Files..." -ForegroundColor Yellow
    $files = @(
        "backend\routes\marksRoutes.js",
        "src\Components\FacultyDashboard\FacultyMarks.jsx",
        "src\Components\StudentDashboard\Sections\StudentResults.jsx",
        "src\Components\AdminDashboard\AdminMarks.jsx"
    )

    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "   ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "   ❌ MISSING: $file" -ForegroundColor Red
        }
    }

    Write-Host "`n3️⃣  Checking Route Registration..." -ForegroundColor Yellow
    $indexContent = Get-Content "backend\index.js" -Raw
    if ($indexContent -match "marksRoutes") {
        Write-Host "   ✅ marksRoutes registered" -ForegroundColor Green
    } else {
        Write-Host "   ❌ marksRoutes NOT found" -ForegroundColor Red
    }
    Write-Host ""
}

function Find-Errors {
    Show-Header "🔍 ERROR DETECTION UTILITY" "Red"
    
    $errors = @()

    Write-Host "1️⃣  Verifying Files..." -ForegroundColor Yellow
    $requiredFiles = @{
        "FacultyMarks" = "src\Components\FacultyDashboard\FacultyMarks.jsx"
        "StudentResults" = "src\Components\StudentDashboard\Sections\StudentResults.jsx"
        "AdminMarks" = "src\Components\AdminDashboard\AdminMarks.jsx"
        "marksRoutes" = "backend\routes\marksRoutes.js"
    }

    foreach ($name in $requiredFiles.Keys) {
        $path = $requiredFiles[$name]
        if (Test-Path $path) {
            Write-Host "   ✅ $name" -ForegroundColor Green
        } else {
            Write-Host "   ❌ MISSING: $name" -ForegroundColor Red
            $errors += "Missing: $path"
        }
    }

    Write-Host "`n2️⃣  Checking Backend..." -ForegroundColor Yellow
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 3
        Write-Host "   ✅ Backend running" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Backend NOT running" -ForegroundColor Red
        $errors += "Start backend: cd backend && npm start"
    }

    Write-Host "`n📊 RESULT:" -ForegroundColor Yellow
    if ($errors.Count -eq 0) {
        Write-Host "✅ NO ERRORS FOUND!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ ERRORS: $($errors.Count)" -ForegroundColor Red
        foreach ($err in $errors) {
            Write-Host "   • $err" -ForegroundColor Red
        }
        Write-Host ""
    }
}

function Run-Tests {
    Show-Header "🧪 AUTOMATED TEST SUITE" "Magenta"
    
    $testResults = @{ Passed = 0; Failed = 0 }

    function Test-Step {
        param(
            [string]$Name,
            [scriptblock]$Test,
            [string]$SuccessMessage,
            [string]$FailMessage
        )
        
        Write-Host "Testing: $Name..." -ForegroundColor Yellow -NoNewline
        try {
            $result = & $Test
            if ($result) {
                Write-Host " ✅ PASS" -ForegroundColor Green
                $script:testResults.Passed++
                return $true
            } else {
                Write-Host " ❌ FAIL" -ForegroundColor Red
                $script:testResults.Failed++
                return $false
            }
        } catch {
            Write-Host " ❌ ERROR" -ForegroundColor Red
            $script:testResults.Failed++
            return $false
        }
    }

    Show-Section "FILE VERIFICATION"
    
    Test-Step -Name "FacultyMarks Component" -Test {
        Test-Path "src\Components\FacultyDashboard\FacultyMarks.jsx"
    } -SuccessMessage "Found" -FailMessage "Missing"

    Test-Step -Name "StudentResults Component" -Test {
        Test-Path "src\Components\StudentDashboard\Sections\StudentResults.jsx"
    } -SuccessMessage "Found" -FailMessage "Missing"

    Test-Step -Name "AdminMarks Component" -Test {
        Test-Path "src\Components\AdminDashboard\AdminMarks.jsx"
    } -SuccessMessage "Found" -FailMessage "Missing"

    Test-Step -Name "Backend Routes" -Test {
        Test-Path "backend\routes\marksRoutes.js"
    } -SuccessMessage "Found" -FailMessage "Missing"

    Show-Section "`nCODE INTEGRATION"
    
    Test-Step -Name "Route Registration" -Test {
        $content = Get-Content "backend\index.js" -Raw
        $content -match "marksRoutes"
    } -SuccessMessage "Registered" -FailMessage "Not registered"

    Show-Section "`nBACKEND VERIFICATION"
    
    Test-Step -Name "Backend Server" -Test {
        try {
            Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
            return $true
        } catch {
            return $false
        }
    } -SuccessMessage "Running" -FailMessage "Not running"

    Show-Section "`n📊 TEST RESULTS"
    
    $total = $testResults.Passed + $testResults.Failed
    $passRate = if ($total -gt 0) { [math]::Round(($testResults.Passed / $total) * 100, 2) } else { 0 }

    Write-Host "Total:  $total" -ForegroundColor White
    Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
    Write-Host "Failed: $($testResults.Failed)" -ForegroundColor Red
    Write-Host "Rate:   $passRate%`n" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })
}

# ══════════════════════════════════════════════════════════════
# HELP MENU
# ══════════════════════════════════════════════════════════════

function Show-Help {
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║          FBN XAI SYSTEM - MASTER CONTROL SCRIPT           ║
╚════════════════════════════════════════════════════════════╝

USAGE:  .\fbnXai.ps1 [command] [options]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM COMMANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  start              Start all services (DEFAULT)
  stop               Stop all services
  setup              Install all dependencies
  frontend           Start frontend only
  backend            Start backend only
  agent              Start AI Agent only

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIAGNOSTIC COMMANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  test               Run automated test suite
  check              System health check
  fix                Find errors and suggest fixes
  help               Show this help message

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTIONS (with 'start' command):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -CleanStart        Kill old processes before starting
  -SkipMongo         Start without MongoDB database
  -SkipAgent         Start without AI Agent
  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  .\fbnXai.ps1                      # Start everything
  .\fbnXai.ps1 start -CleanStart     # Fresh start
  .\fbnXai.ps1 frontend              # Frontend only
  .\fbnXai.ps1 backend               # Backend only
  .\fbnXai.ps1 test                  # Run tests
  .\fbnXai.ps1 check                 # Health check
  .\fbnXai.ps1 fix                   # Find errors
  .\fbnXai.ps1 stop                  # Stop all

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AFTER STARTUP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Frontend:   http://localhost:3000
  Backend:    http://localhost:5000
  Database:   localhost:27017 (MongoDB)
  
Documentation: .gemini\COMPLETE_DOCUMENTATION.md

"@ -ForegroundColor Green
}

# ══════════════════════════════════════════════════════════════
# COMMAND ROUTING
# ══════════════════════════════════════════════════════════════

Clear-Host

switch ($Command) {
    'help' {
        Show-Help
        exit 0
    }
    
    'test' {
        Run-Tests
        exit 0
    }
    
    'check' {
        Test-SystemHealth
        exit 0
    }
    
    'fix' {
        Find-Errors
        exit 0
    }
    
    'setup' {
        Show-Header "SETUP WIZARD" "Green"
        
        Write-Host "Checking prerequisites..." -ForegroundColor Yellow
        $setupOK = $true
        $setupOK = (Check-Command "node" "Node.js") -and $setupOK
        $setupOK = (Check-Command "npm" "npm") -and $setupOK
        
        if (-not $setupOK) {
            Write-Host "`nERROR: Setup failed!" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✓ Prerequisites OK`n" -ForegroundColor Green
        
        Write-Host "Installing Backend dependencies..." -ForegroundColor Cyan
        Push-Location $backendPath
        npm install
        Pop-Location
        
        Write-Host "`nInstalling Frontend dependencies..." -ForegroundColor Cyan
        Push-Location $frontendPath
        npm install
        Pop-Location
        
        if (Get-Command python -EA SilentlyContinue) {
            Write-Host "`nInstalling Python dependencies..." -ForegroundColor Cyan
            Push-Location $aiAgentPath
            if (Test-Path "requirements.txt") {
                python -m pip install -r requirements.txt
            }
            Pop-Location
        }
        
        Show-Header "✓ SETUP COMPLETE!" "Green"
        exit 0
    }
    
    'stop' {
        Show-Header "STOPPING ALL SERVICES" "Red"
        
        Write-Host "Stopping services..." -ForegroundColor Yellow
        Kill-Port 3000
        Kill-Port 5000
        Kill-Port 27017
        Kill-Port 8000
        Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        
        Show-Header "✓ ALL SERVICES STOPPED" "Green"
        exit 0
    }
    
    'frontend' {
        Show-Header "FRONTEND LAUNCHER" "Cyan"
        
        Kill-Port 3000
        Push-Location $frontendPath
        if (-not (Test-Path "node_modules")) {
            Write-Host "Installing dependencies..." -ForegroundColor Cyan
            npm install --silent
        }
        Write-Host "`nStarting Frontend on http://localhost:3000...`n" -ForegroundColor Green
        npm start
        Pop-Location
    }
    
    'backend' {
        Show-Header "BACKEND LAUNCHER" "Cyan"
        
        Kill-Port 5000
        Push-Location $backendPath
        if (-not (Test-Path "node_modules")) {
            Write-Host "Installing dependencies..." -ForegroundColor Cyan
            npm install --silent
        }
        Write-Host "`nStarting Backend on http://localhost:5000...`n" -ForegroundColor Green
        npm start
        Pop-Location
    }
    
    'agent' {
        Show-Header "AI AGENT LAUNCHER" "Cyan"
        
        if (-not (Get-Command python -EA SilentlyContinue)) {
            Write-Host "ERROR: Python not installed!" -ForegroundColor Red
            exit 1
        }
        
        Push-Location $aiAgentPath
        if (Test-Path "requirements.txt") {
            python -m pip install -r requirements.txt --quiet 2>$null
        }
        Write-Host "`nStarting AI Agent...`n" -ForegroundColor Green
        python main.py
        Pop-Location
    }
    
    'start' {
        Show-Header "STARTING ALL SERVICES" "Cyan"
        
        # Prerequisites
        Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Green
        $prereqsOK = $true
        $prereqsOK = (Check-Command "node" "Node.js") -and $prereqsOK
        $prereqsOK = (Check-Command "npm" "npm") -and $prereqsOK
        
        if (-not $prereqsOK) {
            Write-Host "`nERROR: Prerequisites failed!" -ForegroundColor Red
            exit 1
        }
        Write-Host "  ✓ All prerequisites OK`n" -ForegroundColor Green
        
        # Clear ports
        Write-Host "[2/5] Clearing ports..." -ForegroundColor Green
        Kill-Port 5000
        Kill-Port 3000
        if ($CleanStart) {
            Kill-Port 27017
            Kill-Port 8000
            Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  ✓ Ports cleared`n" -ForegroundColor Green
        
        # Dependencies
        Write-Host "[3/5] Installing dependencies..." -ForegroundColor Green
        Push-Location $backendPath
        if (-not (Test-Path "node_modules")) {
            npm install --silent
        }
        Pop-Location
        Push-Location $frontendPath
        if (-not (Test-Path "node_modules")) {
            npm install --silent
        }
        Pop-Location
        Write-Host "  ✓ Dependencies ready`n" -ForegroundColor Green
        
        # MongoDB
        Write-Host "[4/5] Starting MongoDB..." -ForegroundColor Green
        if (-not $SkipMongo) {
            if (Test-Port 27017) {
                Write-Host "  ✓ MongoDB already running`n" -ForegroundColor Green
            } else {
                Start-Process mongod -WindowStyle Hidden -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 3
                if (Test-Port 27017) {
                    Write-Host "  ✓ MongoDB started`n" -ForegroundColor Green
                } else {
                    Write-Host "  WARNING: MongoDB not started`n" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "  Skipped (-SkipMongo)`n" -ForegroundColor Yellow
        }
        
        # Start services
        Write-Host "[5/5] Starting services..." -ForegroundColor Green
        
        Write-Host "  → Backend..." -ForegroundColor Cyan
        Push-Location $backendPath
        Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
        Pop-Location
        Start-Sleep -Seconds 3
        
        Write-Host "  → Frontend..." -ForegroundColor Cyan
        Push-Location $frontendPath
        Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
        Pop-Location
        Start-Sleep -Seconds 2
        
        if (-not $SkipAgent -and (Get-Command python -EA SilentlyContinue)) {
            Write-Host "  → AI Agent..." -ForegroundColor Cyan
            Push-Location $aiAgentPath
            Start-Process pwsh -ArgumentList "-NoExit", "-Command", "python main.py" -WindowStyle Normal
            Pop-Location
        }
        
        Write-Host @"
╔════════════════════════════════════════════════════════════╗
║              ✓ ALL SERVICES STARTED                       ║
╠════════════════════════════════════════════════════════════╣
║  Frontend:  http://localhost:3000                          ║
║  Backend:   http://localhost:5000                          ║
║  Database:  MongoDB on port 27017                          ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green
        
        exit 0
    }
}
