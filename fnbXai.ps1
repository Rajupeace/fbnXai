# ======================================================
# fnbXai.ps1 - Master Control for VuAiAgent (fbnXai)
# ======================================================
# Starts: Frontend + Backend + AI Agent + RAG Engine
# Author: Antigravity AI
# Version: 2.0 (High Performance)
# ======================================================

param(
    [switch]$SkipFrontend,
    [switch]$SkipBackend,
    [switch]$SkipAgent,
    [switch]$StopAll,
    [switch]$UpdateHub    # Flag to update GitHub using git
)

$ErrorActionPreference = "Continue"

# --- UTILS ---
function Write-Header($text) { 
    Write-Host "`n╔" + ("═" * ($text.Length + 4)) + "╗" -ForegroundColor Cyan
    Write-Host "║  $text  ║" -ForegroundColor Cyan
    Write-Host "╚" + ("═" * ($text.Length + 4)) + "╝" -ForegroundColor Cyan 
}
function Write-Success($text) { Write-Host " ✓ $text" -ForegroundColor Green }
function Write-Info($text) { Write-Host " → $text" -ForegroundColor Yellow }
function Write-Error($text) { Write-Host " ✗ $text" -ForegroundColor Red }

# --- STOP ALL ---
if ($StopAll) {
    Write-Header "STOPPING ALL SERVICES"
    Write-Info "Terminating Node.js and Python processes..."
    Get-Process -Name "node", "python" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Success "All systems offline."
    exit
}

# --- UPDATE GITHUB ---
if ($UpdateHub) {
    Write-Header "UPDATING TO GITHUB"
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "Git not found."
    } else {
        $msg = Read-Host "Enter commit message (default: System Update)"
        if (-not $msg) { $msg = "System Update: High Performance mode & RAG fixes" }
        git add .
        git commit -m $msg
        $branch = git branch --show-current
        Write-Info "Pushing to origin $branch..."
        git push origin $branch
        Write-Success "Updates pushed!"
    }
    if (-not $psboundparameters.ContainsKey('SkipBackend')) { exit }
}

# --- LOGO ---
Write-Host @"

██╗   ██╗██╗   ██╗ █████╗ ██╗ █████╗  ██████╗ ███████╗███╗   ██╗████████╗
██║   ██║██║   ██║██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
██║   ██║██║   ██║███████║██║███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
╚██╗ ██╔╝██║   ██║██╔══██║██║██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
 ╚████╔╝ ╚██████╔╝██║  ██║██║██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   
                                                                         
                    🚀 [FNB-XAI] MASTER CONTROL PANEL
"@ -ForegroundColor Cyan

# --- PRE-FLIGHT ---
Write-Header "SYSTEM CHECK"
if (-not (Test-Path "package.json")) { Write-Error "Run from project root!"; exit 1 }

# Check Node
try { $v = node --version; Write-Success "Node.js: $v" } catch { Write-Error "Node.js missing!"; exit 1 }
# Check Python
try { $v = python --version; Write-Success "Python: $v" } catch { Write-Error "Python missing!"; exit 1 }

# Install check
if (-not (Test-Path "node_modules")) { Write-Info "Install Frontend Deps..."; npm install --quiet }
if (-not (Test-Path "backend/node_modules")) { Write-Info "Install Backend Deps..."; Set-Location backend; npm install --quiet; Set-Location .. }

# --- BOOT SERVICES ---
$jobs = @()

# 1. Backend (5000)
if (-not $SkipBackend) {
    Write-Info "Starting Backend on :5000..."
    $bJob = Start-Job -Name "fnb-backend" -ScriptBlock {
        cd $using:PWD/backend
        npm start
    }
    $jobs += @{Name="Backend"; Job=$bJob; Port=5000}
}

# 2. AI Agent (8000)
if (-not $SkipAgent) {
    Write-Info "Starting AI Agent on :8000..."
    $aJob = Start-Job -Name "fnb-agent" -ScriptBlock {
        cd $using:PWD/backend/ai_agent
        python main.py
    }
    $jobs += @{Name="AI Agent"; Job=$aJob; Port=8000}
}

# 3. Frontend (3000)
if (-not $SkipFrontend) {
    Write-Info "Starting Frontend on :3000..."
    $fJob = Start-Job -Name "fnb-frontend" -ScriptBlock {
        cd $using:PWD
        `$env:BROWSER = "none"
        npm start
    }
    $jobs += @{Name="Frontend"; Job=$fJob; Port=3000}
}

# --- WAIT & VERIFY ---
Write-Header "VERIFYING CONNECTIVITY"
foreach ($svc in $jobs) {
    Write-Host "Waiting for $($svc.Name)..." -NoNewline
    $ready = $false
    for ($i=0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        if (netstat -ano | Select-String ":$($svc.Port).*LISTENING") {
            Write-Host " [OK]" -ForegroundColor Green
            $ready = $true
            break
        }
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    if (-not $ready) { Write-Error "`n$($svc.Name) failed to bind to port $($svc.Port)" }
}

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║             ✅ FNB-XAI SYSTEMS ONLINE!                       ║
╚══════════════════════════════════════════════════════════════╝

🌐 FRONTEND URL : http://localhost:3000
⚙️  BACKEND API  : http://localhost:5000
🤖 AI AGENT API : http://localhost:8000
📊 DATABASE     : Connected (Atlas)

Commands:
- Ctrl+C to Stop All
- .\fnbXai.ps1 -StopAll (to kill processes)
- .\fnbXai.ps1 -UpdateHub (to push code)

Monitoring Logs...
"@ -ForegroundColor Green

# --- MONITORING ---
try {
    while ($true) {
        Start-Sleep -Seconds 10
        foreach ($svc in $jobs) {
            if ($svc.Job.State -ne "Running") {
                Write-Error "$($svc.Name) State: $($svc.Job.State)"
                Receive-Job -Job $svc.Job | Select-Object -Last 5
            }
        }
    }
} finally {
    Write-Host "`n🛑 Shutting down..." -ForegroundColor Yellow
    $jobs | ForEach-Object { Stop-Job $_.Job; Remove-Job $_.Job -Force }
    Get-Process -Name "node", "python" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Success "All systems offline. Goodbye!"
}
