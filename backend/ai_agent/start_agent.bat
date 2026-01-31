@echo off
REM Start script for Vu AI agent (Windows)
REM Usage: run this inside backend\ai_agent folder: .\start_agent.bat

REM Change to the script directory
cd /d %~dp0

REM Create virtual env if missing
if not exist .venv (
  echo Creating virtual environment...
  python -m venv .venv
)

REM Activate venv (batch)
call .venv\Scripts\Activate.bat

REM Upgrade pip and install dependencies if requirements.txt present
python -m pip install --upgrade pip
if exist requirements.txt (
  echo Installing Python dependencies from requirements.txt ...
  echo Installing Python dependencies from requirements.txt ...
  pip install -r requirements.txt --upgrade
)

REM Ensure a .env exists (copy example if not present)
if not exist .env (
  if exist .env.example (
    copy /y .env.example .env >nul
    echo Created .env from .env.example — please update with API keys.
  ) else (
    echo Warning: no .env or .env.example found. You may need to create one.
  )
)

REM Run the FastAPI agent
echo Starting Vu AI agent (Python)...
python main.py

pause
