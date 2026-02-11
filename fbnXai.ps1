# ============================================================================
# FBN-XAI ALL-IN-ONE STARTER (fbnXai.ps1)
# Starts: MongoDB, Backend, AI Agent, and Frontend in VISIBLE windows.
# ============================================================================

$base = $PSScriptRoot
Set-Location $base

# --- Configuration ---
$pidFile = Join-Path $base 'service_pids.json'
$p_ui = 3000
$p_api = 5000
$p_ai = 8000
$p_db = 27017

# --- Helpers ---
function Write-Header($t){ Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Write-Info($t){ Write-Host "[..] $t" -ForegroundColor Yellow }
function Write-Success($t){ Write-Host "[OK] $t" -ForegroundColor Green }
function Write-Err($t){ Write-Host "[ERR] $t" -ForegroundColor Red }

function Kill-Port($p) {
    $nets = netstat -ano | findstr ":$p"
    foreach ($n in $nets) {
        if ($n -match '\s+LISTENING\s+(\d+)\s*$') {
            $tPid = $matches[1]
            if ($tPid -gt 0) { 
                Stop-Process -Id $tPid -Force -ErrorAction SilentlyContinue 
            }
        }
    }
}

function Ensure-Mongo {
    # Check .env for Atlas
    $envFile = Join-Path $base ".env"
    if (Test-Path $envFile) {
        $atlas = Select-String -Path $envFile -Pattern "mongodb\+srv://"
        if ($atlas) {
            Write-Success "Using MongoDB Atlas (Cloud). Skipping local DB check."
            return $true
        }
    }

    Write-Info "Checking Local MongoDB Status..."
    if (netstat -ano | findstr "LISTENING" | findstr ":$p_db") {
        Write-Success "Local MongoDB is already running."
        return $true
    }

    # Try service
    $svc = Get-Service MongoDB -ErrorAction SilentlyContinue
    if ($svc) {
        Write-Info "Starting MongoDB Service..."
        Start-Service MongoDB -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 4
    }

    if (netstat -ano | findstr "LISTENING" | findstr ":$p_db") {
        Write-Success "Local MongoDB Started via Service."
        return $true
    }

    # Try manual mongod
    Write-Info "Starting Local MongoDB manually (mongod)..."
    if (-not (Test-Path "data/db")) { New-Item -ItemType Directory -Path "data/db" -Force | Out-Null }
    Start-Process "mongod" -ArgumentList "--dbpath data/db" -WindowStyle Hidden -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 5

    if (netstat -ano | findstr "LISTENING" | findstr ":$p_db") {
        Write-Success "Local MongoDB Started manually."
        return $true
    }

    Write-Err "Could not start local MongoDB. (Ignore if using Atlas)"
    return $false
}

# --- Main Logic ---

Write-Header "FBN-XAI SYSTEM LAUNCHER"

# 1. CLEANUP PORTS
Write-Info "Cleaning up ports $p_ui, $p_api, $p_ai..."
Kill-Port $p_ui
Kill-Port $p_api
Kill-Port $p_ai
Start-Sleep -Seconds 1

# 2. DATABASE
Ensure-Mongo | Out-Null

# 3. SERVICE LAUNCH
Write-Info "Launching services in NEW VISIBLE windows..."

# BACKEND
$B_DIR = Join-Path $base "backend"
Write-Info "-> Starting Backend (5000)"
Start-Process "cmd.exe" -ArgumentList "/k title FBN-BACKEND && color 0A && npm start" -WorkingDirectory $B_DIR -WindowStyle Normal

# AI AGENT
$A_DIR = Join-Path $base "backend\ai_agent"
$V_PY = Join-Path $A_DIR ".venv\Scripts\python.exe"
$PY_EXE = if (Test-Path $V_PY) { $V_PY } else { "python" }
$env:USE_MOCK_LLM = "0"
$env:PYTHONUNBUFFERED = "1"
Write-Info "-> Starting AI Agent (8000)"
Start-Process "cmd.exe" -ArgumentList "/k title FBN-AI-AGENT && color 0B && set USE_MOCK_LLM=0 && set PYTHONUNBUFFERED=1 && `"$PY_EXE`" main_simple.py" -WorkingDirectory $A_DIR -WindowStyle Normal

# FRONTEND
Write-Info "-> Starting Frontend (3000)"
$env:BROWSER = "none"
Start-Process "cmd.exe" -ArgumentList "/k title FBN-FRONTEND && color 0C && set BROWSER=none && npm start" -WorkingDirectory $base -WindowStyle Normal

Write-Header "LAUNCH COMPLETE"
Write-Success "All systems are starting in their own windows."
Write-Host "Please wait for 'Compiled successfully' in the Frontend window." -ForegroundColor Gray
Write-Host "Keep those windows open while using the application!`n" -ForegroundColor Yellow

Write-Host "URLs:" -ForegroundColor Gray
Write-Host "  - UI:      http://localhost:3000" -ForegroundColor White
Write-Host "  - API:     http://localhost:5000" -ForegroundColor White
Write-Host "  - AI:      http://localhost:8000" -ForegroundColor White

# Optional: Keep this shell open to monitor
Write-Header "MONITOR"
Write-Info "Monitoring ports (Ctrl+C to stop this monitor)..."
while ($true) {
    $status = ""
    foreach ($p in @($p_ui, $p_api, $p_ai)) {
        if (netstat -ano | findstr "LISTENING" | findstr ":$p") {
            $status += "[OK] $p  "
        } else {
            $status += "[!!] $p  "
        }
    }
    Write-Host "`r$status" -NoNewline
    Start-Sleep -Seconds 5
}
