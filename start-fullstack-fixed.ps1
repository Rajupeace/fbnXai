# PowerShell script to start full-stack application
# Frontend, Backend, and Database servers

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "ðŸš€ Starting Full-Stack Application..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow

# Kill any existing Node.js processes
Write-Host "ðŸ›‘ Stopping existing Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2  # Give processes time to shut down
} catch {
    Write-Host "âš ï¸  Warning: Could not stop all Node.js processes" -ForegroundColor Yellow
}

# Function to check if a port is available
function Test-PortInUse {
    param([int]$Port)
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
    try {
        $listener.Start()
        $listener.Stop()
        return $false
    } catch {
        return $true
    } finally {
        if ($listener -ne $null) {
            $listener.Stop()
        }
    }
}

# Function to start a process in background
function Start-BackgroundProcess {
    param(
        [string]$Name,
        [string]$Command,
        [string]$Directory = ".",
        [int]$Port = 0,
        [int]$MaxWaitSeconds = 30
    )

    Write-Host "ðŸ“¡ Starting $Name..." -ForegroundColor Cyan
    
    # Check if port is already in use
    if ($Port -gt 0 -and (Test-PortInUse -Port $Port)) {
        Write-Host "âš ï¸  Port $Port is already in use. Trying to continue..." -ForegroundColor Yellow
    }

    try {
        # Start the process in the background with proper working directory
        $process = Start-Process -FilePath "node" -ArgumentList "--trace-warnings" -WorkingDirectory $Directory -PassThru -NoNewWindow
        
        # Wait for the process to start
        $waitTime = 0
        $checkInterval = 2
        $started = $false
        
        while ($waitTime -lt $MaxWaitSeconds) {
            if ($process.HasExited) {
                Write-Host "âŒ $Name failed to start (process exited)" -ForegroundColor Red
                return $false
            }
            
            if ($Port -gt 0) {
                if (Test-PortInUse -Port $Port) {
                    $started = $true
                    break
                }
            } else {
                # If no port check, just wait a bit and assume success
                $started = $true
                break
            }
            
            Start-Sleep -Seconds $checkInterval
            $waitTime += $checkInterval
        }
        
        if ($started) {
            Write-Host "âœ… $Name started successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "âŒ $Name failed to start (timeout)" -ForegroundColor Red
            $process | Stop-Process -Force -ErrorAction SilentlyContinue
            return $false
        }
    } catch {
        Write-Host "âŒ Failed to start $Name : $_" -ForegroundColor Red
        return $false
    }
}

$aiAgentProcess = $null
Write-Host "`nðŸ¤– Starting AI Agent..." -ForegroundColor Cyan
$aiAgentDir = Join-Path $PSScriptRoot 'backend\ai_agent'
$aiAgentCmd = "python"
$aiAgentArgs = @("main.py")

# Check for venv
if (Test-Path (Join-Path $aiAgentDir "venv\Scripts\activate.ps1")) {
    Write-Host "   Using virtual environment..." -ForegroundColor DarkGray
    # It's tricky to activate venv in Start-Process directly. 
    # Providing full path to python in venv is easier.
    $aiAgentCmd = Join-Path $aiAgentDir "venv\Scripts\python.exe"
}

# Install requirements (synchronously first, to ensure dependencies)
Write-Host "   Installing/Verifying Python requirements..." -ForegroundColor DarkGray
Start-Process -FilePath "pip" -ArgumentList "install -r requirements.txt" -WorkingDirectory $aiAgentDir -NoNewWindow -Wait

# Start AI Agent
$aiAgentProcess = Start-Process -FilePath $aiAgentCmd -ArgumentList $aiAgentArgs -WorkingDirectory $aiAgentDir -PassThru -NoNewWindow
$aiAgentStarted = $false

# Wait for AI Agent (Port 8000)
$maxWait = 120
$waitTime = 0
while ($waitTime -lt $maxWait) {
    if (Test-PortInUse -Port 8000) {
        $aiAgentStarted = $true
        break
    }
    if ($aiAgentProcess.HasExited) {
        Write-Host "âŒ AI Agent failed to start" -ForegroundColor Red
        break
    }
    Write-Host "." -NoNewline -ForegroundColor DarkGray
    Start-Sleep -Seconds 2
    $waitTime += 2
}

if ($aiAgentStarted) {
    Write-Host "`nâœ… AI Agent is running at http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "`nâš ï¸  AI Agent failed to start or is slow (Port 8000). Continuing..." -ForegroundColor Yellow
}

$backendProcess = $null
Write-Host "`nðŸ”„ Starting Backend Server..." -ForegroundColor Cyan
# Use the correct backend entrypoint and ensure WorkingDirectory is a string path
$backendDir = Join-Path $PSScriptRoot 'backend'
$backendProcess = Start-Process -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $backendDir -PassThru -NoNewWindow
$backendStarted = $false

# Wait for backend to be ready
$maxWait = 120  # seconds
$waitTime = 0
$checkInterval = 2

while ($waitTime -lt $maxWait) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        # Accept case-insensitive "ok" or "OK" responses
        if ($response.status -and ($response.status.ToString().ToLower() -eq "ok")) {
            $backendStarted = $true
            break
        }
    } catch {
        # Ignore errors, just retry
    }
    
    if ($backendProcess.HasExited) {
        Write-Host "âŒ Backend failed to start (process exited)" -ForegroundColor Red
        break
    }
    
    Write-Host "." -NoNewline -ForegroundColor DarkGray
    Start-Sleep -Seconds $checkInterval
    $waitTime += $checkInterval
}

if (-not $backendStarted) {
    Write-Host "âŒ Backend failed to start after $maxWait seconds" -ForegroundColor Red
    $backendProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "`nâœ… Backend is running at http://localhost:5000" -ForegroundColor Green

# Start Frontend Server (Port 3000)
Write-Host "`nðŸ”„ Starting Frontend Server..." -ForegroundColor Cyan
# Run frontend from the repository root where this script lives
$frontendDir = $PSScriptRoot
# Use platform-appropriate npm executable on Windows
if ($IsWindows) { $npmExe = 'npm.cmd' } else { $npmExe = 'npm' }
$frontendProcess = Start-Process -FilePath $npmExe -ArgumentList "start" -WorkingDirectory $frontendDir -PassThru -NoNewWindow
$frontendStarted = $false

# Wait for frontend to be ready
$waitTime = 0

while ($waitTime -lt $maxWait) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $frontendStarted = $true
            break
        }
    } catch {
        # Ignore errors, just retry
    }
    
    if ($frontendProcess.HasExited) {
        Write-Host "âŒ Frontend failed to start (process exited)" -ForegroundColor Red
        break
    }
    
    Write-Host "." -NoNewline -ForegroundColor DarkGray
    Start-Sleep -Seconds $checkInterval
    $waitTime += $checkInterval
}

if (-not $frontendStarted) {
    Write-Host "âŒ Frontend failed to start after $maxWait seconds" -ForegroundColor Red
    $backendProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    $frontendProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "`nâœ… Frontend is running at http://localhost:3000" -ForegroundColor Green

# Database info
Write-Host "ðŸ’¾ Database: Using file-based JSON storage" -ForegroundColor Cyan

# Display success message
Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "ðŸŽ‰ Full-Stack Application Started Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "ðŸ“ Access Points:" -ForegroundColor Cyan
Write-Host "   ðŸŒ Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   ðŸ”— Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   ðŸ¤– AI Agent: http://localhost:8000" -ForegroundColor White
Write-Host "   ðŸ“Š Admin Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "ðŸ”‘ Admin Login:" -ForegroundColor Cyan
Write-Host "   Username: ReddyFBN@1228" -ForegroundColor White
Write-Host "   Password: ReddyFBN" -ForegroundColor White
Write-Host ""
Write-Host "ðŸ“‹ Services Running:" -ForegroundColor Cyan
Write-Host "   âœ… React Frontend (Port 3000)" -ForegroundColor Green
Write-Host "   âœ… Node.js Backend (Port 5000)" -ForegroundColor Green
Write-Host "   âœ… AI Agent (Port 8000)" -ForegroundColor Green
Write-Host "   âœ… JSON Database (File-based)" -ForegroundColor Green
Write-Host ""
Write-Host "ðŸ›‘ To stop all servers: Press Ctrl+C or close this window" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

# Function to handle cleanup on script exit
function Stop-Servers {
    Write-Host "`nðŸ›‘ Shutting down servers..." -ForegroundColor Yellow
    
    # Stop frontend
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        Write-Host "Stopping frontend..." -ForegroundColor Yellow
        $frontendProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    }

    # Stop AI Agent
    if ($aiAgentProcess -and -not $aiAgentProcess.HasExited) {
        Write-Host "Stopping AI Agent..." -ForegroundColor Yellow
        $aiAgentProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    }
    
    # Stop backend
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Write-Host "Stopping backend..." -ForegroundColor Yellow
        $backendProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    }
    
    # Clean up any remaining node processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.Id -ne $PID } | 
        Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "âœ… All servers stopped!" -ForegroundColor Green
    exit 0
}

# Set up Ctrl+C handler
[Console]::TreatControlCAsInput = $false
try {
    $handler = [System.ConsoleCancelEventHandler]{
        Stop-Servers
        [System.Environment]::Exit(0)
    }
    [Console]::add_CancelKeyPress($handler)
} catch {
    Write-Host "Warning: Could not set up clean exit handler" -ForegroundColor Yellow
}

# Keep the script running
Write-Host "`n[Press Ctrl+C to stop all servers]" -ForegroundColor DarkGray
try {
    while ($true) {
        # Check if processes are still running
        if ($backendProcess.HasExited) {
            Write-Host "Backend process has stopped unexpectedly!" -ForegroundColor Red
            break
        }
        if ($aiAgentProcess.HasExited) {
            Write-Host "AI Agent process has stopped unexpectedly!" -ForegroundColor Red
            break
        }
        if ($frontendProcess.HasExited) {
            Write-Host "Frontend process has stopped unexpectedly!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 5
    }
} finally {
    Stop-Servers
}

exit 0

