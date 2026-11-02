@echo off
title Stop Klean Max Pro QMS
setlocal

echo =====================================================================
echo                STOPPING KLEAN MAX PRO QMS SERVERS
echo =====================================================================
echo.

echo Terminating processes on Port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Killing PID %%a
    taskkill /F /PID %%a 2>nul
)

echo Terminating processes on Port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Killing PID %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo All Klean Max Pro local servers have been stopped.
echo.
pause
