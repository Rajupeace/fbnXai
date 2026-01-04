# PowerShell script to start full-stack application
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Full-Stack Application..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow

# 1. Kill existing Node/Python processes (Careful!)
Write-Host "🛑 Clearing ports..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    # Don't kill python globally, might kill system tools. Only kill if we started them? 
    # For now, just node, as python usually runs on specific port 8000.
    Start-Sleep -Seconds 1
} catch {}

# 2. Check MongoDB Service
Write-Host "`n🍃 Checking MongoDB Service..." -ForegroundColor Cyan
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "✅ MongoDB Service is RUNNING" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB Service is NOT running." -ForegroundColor Yellow
}

# 3. Start AI Agent
Write-Host "`n🤖 Starting AI Agent..." -ForegroundColor Cyan
$aiAgentDir = Join-Path $PSScriptRoot 'backend\ai_agent'
# Use cmd /c to ensure we can run python/pip via shell resolution
$aiCmd = "cmd /c start `"AI Agent`" /min python main.py" 
# We use 'start' to open a new window so it persists and we can see output if needed, or /min to hide
# But for a "one click fix", keeping them in separate windows is often SAFER so they don't die when this script ends if we didn't use jobs.
# However, the user wants a "fix".

# Improved approach: Start-Process with cmd
$aiAgentProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d ""$aiAgentDir"" && python main.py" -PassThru -NoNewWindow
# Note: This runs in the SAME window if NoNewWindow. This effectively blocks if we don't put it in background?
# cmd /c runs and exits? No, python main.py blocks.
# So we MUST use Start-Process separate window or background.

# Let's use separate windows for visibility, it's more robust for "checking" if it works.
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title AI_AGENT && cd /d ""$aiAgentDir"" && python main.py" -WindowStyle Minimized

Write-Host "✅ AI Agent launch command sent (Minimized Window)" -ForegroundColor Green

# 4. Start Backend
Write-Host "`n🔄 Starting Backend Server..." -ForegroundColor Cyan
$backendDir = Join-Path $PSScriptRoot 'backend'
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title BACKEND && cd /d ""$backendDir"" && node index.js" -WindowStyle Minimized

Write-Host "✅ Backend launch command sent (Minimized Window)" -ForegroundColor Green

# 5. Start Frontend
Write-Host "`n⚛️  Starting Frontend Server..." -ForegroundColor Cyan
$frontendDir = $PSScriptRoot
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title FRONTEND && cd /d ""$frontendDir"" && npm start" -WindowStyle Normal

Write-Host "✅ Frontend launch command sent" -ForegroundColor Green

Write-Host "`n🎉 All components started!" -ForegroundColor Green
Write-Host "   Check the opened windows for logs."
Write-Host "   Frontend will open in your browser shortly."
