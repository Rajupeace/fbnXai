@echo off
echo ==================================================
echo   FRIENDLY NOTEBOOK - UNIFIED SYSTEM LAUNCHER
echo ==================================================
echo.

:: 1. Start Backend
echo Starting Backend Server...
start "FNB-Backend" /min cmd /c "cd backend && npm start"
timeout /t 5 /nobreak >nul

:: 2. Start Frontend
echo Starting Frontend Client...
start "FNB-Frontend" cmd /c "npm start"

echo.
echo ==================================================
echo   SYSTEM DEPLOYED.
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo ==================================================
pause
