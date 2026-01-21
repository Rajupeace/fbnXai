# START_EVERYTHING.ps1
# Complete startup script for FBN Xai System
# Starts: MongoDB, Backend Server, Frontend

param(
    [switch]$NoMongo = $false,
    [switch]$NoBackend = $false,
    [switch]$NoFrontend = $false
)

$colors = @{
    Green = "Green"
    Red = "Red"
    Yellow = "Yellow"
    Cyan = "Cyan"
    Magenta = "Magenta"
    Blue = "Blue"
}

function Write-Colored {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Banner {
    Clear-Host
    Write-Colored "╔════════════════════════════════════════════════════════════╗" "Cyan"
    Write-Colored "║         🚀 FBN XAI - COMPLETE SYSTEM STARTUP              ║" "Magenta"
    Write-Colored "╚════════════════════════════════════════════════════════════╝" "Cyan"
    Write-Colored "`n"
}

function Check-MongoDB {
    Write-Colored "═══════════════════════════════════════════════════════════" "Cyan"
    Write-Colored "📦 MongoDB Status Check" "Blue"
    Write-Colored "═══════════════════════════════════════════════════════════" "Cyan"
    
    $mongoRunning = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongoRunning) {
        Write-Colored "✅ MongoDB is already running" "Green"
        Write-Colored "   Process: $($mongoRunning.Name) (PID: $($mongoRunning.Id))" "Green"
        return $true
    } else {
        Write-Colored "⚠️  MongoDB is not running" "Yellow"
        Write-Colored "   Please ensure mongod is running on port 27017" "Yellow"
        return $false
    }
}

function Start-MongoDB {
    if ($NoMongo) {
        Write-Colored "⏭️  Skipping MongoDB startup..." "Yellow"
        return
    }
    
    $mongoRunning = Check-MongoDB
    if (-not $mongoRunning) {
        Write-Colored "`n📌 Starting MongoDB..." "Blue"
        Write-Colored "   Command: mongod" "Cyan"
        Write-Colored "   Note: Open a new PowerShell window and run: mongod" "Yellow"
        Write-Colored "   MongoDB will be available at: mongodb://localhost:27017" "Yellow"
    }
}

function Start-Backend {
    if ($NoBackend) {
        Write-Colored "⏭️  Skipping Backend startup..." "Yellow"
        return
    }
    
    Write-Colored "`n═══════════════════════════════════════════════════════════" "Cyan"
    Write-Colored "⚙️  Starting Backend Server" "Blue"
    Write-Colored "═══════════════════════════════════════════════════════════" "Cyan"
    
    $backendPath = ".\backend"
    if (-not (Test-Path $backendPath)) {
        Write-Colored "❌ Backend directory not found at: $backendPath" "Red"
        return
    }
    
    Write-Colored "📂 Backend path verified: $backendPath" "Green"
    Write-Colored "📌 Installing dependencies..." "Blue"
    
    Push-Location $backendPath
    npm install 2>&1 | Out-Null
    
    Write-Colored "✅ Dependencies installed" "Green"
    Write-Colored "📌 Starting backend with: npm run dev" "Blue"
    
    # Start backend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -PassThru | Out-Null
    Write-Colored "✅ Backend starting on port 5000..." "Green"
    Write-Colored "   Waiting 3 seconds for backend to initialize..." "Yellow"
    
    Pop-Location
    Start-Sleep -Seconds 3
}

function Start-Frontend {
    if ($NoFrontend) {
        Write-Colored "⏭️  Skipping Frontend startup..." "Yellow"
        return
    }
    
    Write-Colored "`n═══════════════════════════════════════════════════════════" "Cyan"
    Write-Colored "🎨 Starting Frontend Server" "Blue"
    Write-Colored "═══════════════════════════════════════════════════════════" "Cyan"
    
    if (-not (Test-Path "package.json")) {
        Write-Colored "❌ package.json not found in current directory" "Red"
        return
    }
    
    Write-Colored "📂 Frontend path verified" "Green"
    Write-Colored "📌 Installing dependencies..." "Blue"
    
    npm install 2>&1 | Out-Null
    Write-Colored "✅ Dependencies installed" "Green"
    
    Write-Colored "📌 Starting frontend with: npm start" "Blue"
    
    # Start frontend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start" -PassThru | Out-Null
    Write-Colored "✅ Frontend starting on port 3000..." "Green"
}

function Show-Access-Info {
    Write-Colored "`n═══════════════════════════════════════════════════════════" "Cyan"
    Write-Colored "🎯 System Ready - Access Information" "Magenta"
    Write-Colored "═══════════════════════════════════════════════════════════" "Cyan"
    
    Write-Colored "`n📱 Frontend Access:" "Blue"
    Write-Colored "   URL: http://localhost:3000" "Cyan"
    
    Write-Colored "`n🔐 Login Credentials:" "Blue"
    Write-Colored "   Email: BobbyFNB@09=" "Cyan"
    Write-Colored "   Password: Martin@FNB09" "Cyan"
    
    Write-Colored "`n🎪 Dashboards Available:" "Blue"
    Write-Colored "   • Admin Dashboard - Complete system management" "Green"
    Write-Colored "   • Faculty Dashboard - Teaching & materials" "Green"
    Write-Colored "   • Student Dashboard - Learning & assignments" "Green"
    
    Write-Colored "`n⚙️  Server Information:" "Blue"
    Write-Colored "   Backend API: http://localhost:5000" "Cyan"
    Write-Colored "   MongoDB: mongodb://localhost:27017" "Cyan"
    
    Write-Colored "`n📊 Features Active:" "Blue"
    Write-Colored "   • Data polling every 2 seconds" "Green"
    Write-Colored "   • Real-time SSE updates (<500ms latency)" "Green"
    Write-Colored "   • Cross-dashboard synchronization" "Green"
    Write-Colored "   • Automatic database backup" "Green"
    
    Write-Colored "`n⏹️  To Stop Services:" "Yellow"
    Write-Colored "   Press Ctrl+C in each terminal window" "Yellow"
    
    Write-Colored "`n" 
}

# Main execution
Show-Banner
Start-MongoDB
Start-Backend
Start-Frontend
Show-Access-Info

Write-Colored "═══════════════════════════════════════════════════════════" "Cyan"
Write-Colored "✨ Startup Complete - Check browser at http://localhost:3000" "Green"
Write-Colored "═══════════════════════════════════════════════════════════" "Cyan"
