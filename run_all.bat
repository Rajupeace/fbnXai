@echo off
TITLE FBN-XAI Master Launcher
echo ==================================================
echo      FBN-XAI SYSTEM LAUNCHER (VISIBLE)
echo ==================================================
echo.
echo [..] Starting services via PowerShell...
powershell -ExecutionPolicy Bypass -File "%~dp0fbnXai.ps1"
pause
