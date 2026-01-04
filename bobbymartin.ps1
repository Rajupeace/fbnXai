$host.UI.RawUI.WindowTitle = "FBN Launcher"
Write-Host "🚀 Launching FBN-XAI System (BobbyMartin Setup)..." -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Backend Server
Write-Host "   Starting Backend (Port 5000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k title Backend Server && cd /d ""$root"" && node backend/index.js" -WindowStyle Normal

# 2. AI Agent
Write-Host "   Starting AI Agent (Port 8000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k title AI Agent && cd /d ""$root"" && python backend/ai_agent/main.py" -WindowStyle Normal

# 3. Frontend
Write-Host "   Starting Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k title Frontend && cd /d ""$root"" && npm start" -WindowStyle Minimized

Write-Host "`n✅ All services successfully launched in separate windows!" -ForegroundColor Green
Write-Host "🌐 Dashboard: http://localhost:3000" -ForegroundColor Cyan
