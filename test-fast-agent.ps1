# VuAiAgent Fast Response System - Complete Test Script
# This script verifies all components are working

Write-Host "================================" -ForegroundColor Cyan
Write-Host "VuAiAgent Fast Response Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param($Url, $Name)
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✓ $Name is running" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ $Name is not responding" -ForegroundColor Red
        return $false
    }
}

# Function to test chat
function Test-Chat {
    param($Url, $Name)
    try {
        $body = @{
            message = "Hello"
            role = "student"
            user_id = "test123"
            user_name = "Test User"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $Url -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✓ $Name chat endpoint works" -ForegroundColor Green
        Write-Host "  Response: $($response.response.Substring(0, [Math]::Min(60, $response.response.Length)))..." -ForegroundColor Gray
        return $true
    } catch {
        Write-Host "✗ $Name chat endpoint failed: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "Checking services..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js Backend (Port 5000)
$nodeRunning = Test-Endpoint "http://localhost:5000" "Node.js Backend"
if ($nodeRunning) {
    Test-Chat "http://localhost:5000/api/chat" "Node.js Backend"
} else {
    Write-Host "  Start with: cd backend && npm start" -ForegroundColor Gray
}

Write-Host ""

# Check Python Agent (Port 8000)
$pythonRunning = Test-Endpoint "http://localhost:8000" "Python AI Agent"
if ($pythonRunning) {
    Test-Chat "http://localhost:8000/chat" "Python AI Agent"
} else {
    Write-Host "  Start with: cd backend/ai_agent && .\run.bat" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

if ($nodeRunning -and $pythonRunning) {
    Write-Host "✓ All systems operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test the Ultra-Fast Response System:" -ForegroundColor Yellow
    Write-Host '  $body = @{message="go to notes"; role="student"} | ConvertTo-Json' -ForegroundColor Gray
    Write-Host '  Invoke-RestMethod -Uri "http://localhost:5000/api/chat" -Method Post -Body $body -ContentType "application/json"' -ForegroundColor Gray
} elseif ($nodeRunning) {
    Write-Host "✓ Node.js running - Basic fast responses available" -ForegroundColor Green
    Write-Host "! Python Agent not running - Advanced AI features disabled" -ForegroundColor Yellow
} else {
    Write-Host "✗ Services not running. Start them with:" -ForegroundColor Red
    Write-Host "  Terminal 1: cd backend && npm start" -ForegroundColor Gray
    Write-Host "  Terminal 2: cd backend/ai_agent && .\run.bat" -ForegroundColor Gray
}
