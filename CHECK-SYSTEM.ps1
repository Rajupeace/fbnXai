# fnbXai System - Diagnostic & Verification Script
# Tests all services to ensure everything is working

Write-Host @"
╔════════════════════════════════════════════════════════════╗
║         FBN XAI SYSTEM - DIAGNOSTIC & VERIFICATION        ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`n[1/5] Checking Prerequisites..." -ForegroundColor Green

# Check Node.js
if (Get-Command node -EA SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found" -ForegroundColor Red
}

# Check npm
if (Get-Command npm -EA SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "  ✓ npm v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ npm not found" -ForegroundColor Red
}

# Check Python
if (Get-Command python -EA SilentlyContinue) {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Python not found (AI Agent will skip)" -ForegroundColor Yellow
}

# Check MongoDB
if (Get-Command mongod -EA SilentlyContinue) {
    Write-Host "  ✓ MongoDB installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ MongoDB not found in PATH (but may still run)" -ForegroundColor Yellow
}

Write-Host "`n[2/5] Checking Port Availability..." -ForegroundColor Green

$ports = @(
    @{ Port = 3000; Service = "Frontend (React)" },
    @{ Port = 5000; Service = "Backend (Node.js)" },
    @{ Port = 27017; Service = "MongoDB" },
    @{ Port = 8000; Service = "AI Agent" }
)

foreach ($portInfo in $ports) {
    try {
        $test = Test-NetConnection -ComputerName 127.0.0.1 -Port $portInfo.Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($test.TcpTestSucceeded) {
            Write-Host "  ✓ Port $($portInfo.Port) - $($portInfo.Service) is RUNNING" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Port $($portInfo.Port) - $($portInfo.Service) not responding" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ⚠ Port $($portInfo.Port) - Check failed" -ForegroundColor Yellow
    }
}

Write-Host "`n[3/5] Testing API Endpoints..." -ForegroundColor Green

# Test Backend API
try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:5000/api/students" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($backendTest.StatusCode -eq 200 -or $backendTest.StatusCode -eq 401) {
        Write-Host "  ✓ Backend API responding (http://localhost:5000)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Backend API status: $($backendTest.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠ Backend API not responding yet (starting up...)" -ForegroundColor Yellow
}

# Test Frontend
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($frontendTest.StatusCode -eq 200) {
        Write-Host "  ✓ Frontend accessible (http://localhost:3000)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Frontend status: $($frontendTest.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠ Frontend not responding yet (starting up...)" -ForegroundColor Yellow
}

Write-Host "`n[4/5] Checking Service Processes..." -ForegroundColor Green

# Check Node processes
$nodeProcs = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcs) {
    Write-Host "  ✓ Node.js process(es) running: $($nodeProcs.Count) instance(s)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ No Node.js process found" -ForegroundColor Yellow
}

# Check Python processes
$pythonProcs = Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -notlike "*VSCode*" }
if ($pythonProcs) {
    Write-Host "  ✓ Python process(es) running" -ForegroundColor Green
} else {
    Write-Host "  ⚠ No Python process found (AI Agent may not be running)" -ForegroundColor Yellow
}

# Check MongoDB
try {
    $mongoTest = Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($mongoTest.TcpTestSucceeded) {
        Write-Host "  ✓ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ MongoDB not responding" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠ MongoDB check failed" -ForegroundColor Yellow
}

Write-Host "`n[5/5] Summary & Recommendations..." -ForegroundColor Green

Write-Host @"
────────────────────────────────────────────────────────────

✅ SYSTEM STATUS:
────────────────────────────────────────────────────────────

If all services show ✓:
  Your system is fully operational!
  
If you see ⚠ warnings:
  Services may still be starting up...
  Give them 5-10 seconds and refresh

If you see ✗ errors:
  Run: .\fnbXai.ps1 stop
  Then: .\fnbXai.ps1 start -CleanStart

────────────────────────────────────────────────────────────

🌐 ACCESS POINTS:
────────────────────────────────────────────────────────────

Frontend:   http://localhost:3000
Backend:    http://localhost:5000
Database:   localhost:27017
AI Agent:   Running in separate window

────────────────────────────────────────────────────────────

📝 SERVICE DETAILS:
────────────────────────────────────────────────────────────

Frontend (React):    http://localhost:3000
  • User interface
  • Admin/Student/Faculty dashboards
  • Real-time updates

Backend (Node.js):   http://localhost:5000
  • REST API server
  • Database operations
  • Authentication & authorization
  • Chat functionality

Database (MongoDB):  localhost:27017
  • Data persistence
  • Collections: Students, Faculty, Courses, etc.

AI Agent (Python):   Custom endpoints
  • Machine learning
  • LLM integration
  • Analytics

────────────────────────────────────────────────────────────

🚀 NEXT STEPS:
────────────────────────────────────────────────────────────

1. Visit: http://localhost:3000
2. Login to access dashboards
3. Try different features
4. Monitor logs in each service window

────────────────────────────────────────────────────────────

✨ fnbXai.ps1 is managing all services from ONE file!
────────────────────────────────────────────────────────────

"@ -ForegroundColor Green
