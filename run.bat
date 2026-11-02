@echo off
title Klean Max Pro QMS Launcher
setlocal

:: Set working directory to project root
cd /d "%~dp0"

echo =====================================================================
echo                KLEAN MAX PRO - QMS LOCAL LAUNCHER
echo =====================================================================
echo.
echo Starting Backend and Frontend servers in parallel...
echo.

:: 1. Check Python virtual environment
if not exist "backend\.venv\Scripts\python.exe" (
    echo [ERROR] Python virtual environment not found in backend\.venv!
    echo Please make sure backend\.venv is configured.
    pause
    exit /b 1
)

:: 2. Check Frontend node_modules
if not exist "frontend\node_modules" (
    echo [NOTICE] frontend\node_modules not found. Installing npm dependencies...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
)

:: 3. Launch Backend in a new window
echo [1/2] Launching Backend API (Port 8000)...
start "Klean Max Pro - Backend (Port 8000)" cmd /k "cd /d "%~dp0" && call backend\.venv\Scripts\activate.bat && uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

:: 4. Launch Frontend in a new window
echo [2/2] Launching Frontend Dev Server (Port 5173)...
start "Klean Max Pro - Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: 5. Wait briefly for servers to initialize, then launch the browser
echo.
echo Waiting 4 seconds for servers to initialize before opening browser...
timeout /t 4 /nobreak >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo =====================================================================
echo  Services started successfully in separate windows!
echo  - Frontend Web UI : http://localhost:5173
echo  - Backend API Docs: http://127.0.0.1:8000/api/docs
echo  - Health Check    : http://127.0.0.1:8000/api/health
echo =====================================================================
echo.
echo To stop the servers, simply close their respective command windows.
echo (Or run stop.bat)
echo.
pause
