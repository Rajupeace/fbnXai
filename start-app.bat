@echo off
REM Start MongoDB and FBN XAI Application

echo.
echo =========================================
echo FBN XAI - Complete Startup Script
echo =========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

echo [OK] Node.js and npm are installed
echo.

REM Start MongoDB
echo Checking MongoDB...
netstat -ano | findstr :27017 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] MongoDB is already running on port 27017
) else (
    echo [INFO] MongoDB not detected. Attempting to start...
    REM Try to start MongoDB service
    net start MongoDB >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] MongoDB service started
        timeout /t 3 /nobreak
    ) else (
        echo [WARNING] Could not start MongoDB service
        echo [INFO] Make sure MongoDB is installed and running
        echo.
    )
)

REM Kill existing processes on ports 5000 and 3000
echo Clearing ports 5000 and 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F 2>nul
echo [OK] Ports cleared

echo.
echo =========================================
echo Starting Backend and Frontend
echo =========================================
echo.

REM Start Backend in new window
echo Starting Backend on port 5000...
start "FBN XAI Backend" cmd /k "cd backend && npm start"
timeout /t 4 /nobreak

REM Start Frontend in new window
echo Starting Frontend on port 3000...
start "FBN XAI Frontend" cmd /k "npm start"
timeout /t 6 /nobreak

echo.
echo =========================================
echo System Starting
echo =========================================
echo.
echo Dashboard: http://localhost:3000
echo Backend:   http://localhost:5000
echo.
echo Credentials:
echo   Admin User: BobbyFNB@09=
echo   Admin Pass: Martin@FNB09
echo.
echo Press any key to exit this window...
pause
