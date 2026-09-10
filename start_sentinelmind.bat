@echo off
setlocal enabledelayedexpansion
title SentinelMind AI Platform Launcher
color 0A

:: Ensure working directory is the folder where this batch script lives
cd /d "%~dp0"

echo =====================================================================
echo           SENTINELMIND - AI MENTAL WELLNESS PLATFORM
echo =====================================================================
echo Current Directory: %CD%
echo.

echo [1/4] Verifying runtimes...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on PATH. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found on PATH. Please install Python.
    pause
    exit /b 1
)

echo [2/4] Verifying AI model artifact...
if not exist "ai_service\sentinel_model.joblib" (
    echo [INFO] Model artifact not found. Training Scikit-Learn Random Forest model...
    python ai_service\train_model.py
) else (
    echo [OK] Pre-trained Random Forest model found.
)

echo [3/4] Launching SentinelMind Services...

:: 1. Launch Python AI Service
echo Starting Python AI Engine (Port 8000)...
start "SentinelMind - Python AI Service" /d "%~dp0ai_service" cmd /k "title SentinelMind-AI && python app.py"

:: 2. Launch Node.js Backend Server (Port 5000 - serves fullstack app and API)
echo Starting Node.js Backend & App Server (Port 5000)...
start "SentinelMind - Node Backend Server" /d "%~dp0server" cmd /k "title SentinelMind-Server && node src\index.js"

:: 3. Launch React Vite Dev Server (Port 5173)
echo Starting React Vite Dev Server (Port 5173)...
start "SentinelMind - React Vite Frontend" /d "%~dp0client" cmd /k "title SentinelMind-Vite && npm.cmd run dev"

echo.
echo Waiting 4 seconds for services to initialize...
timeout /t 4 /nobreak >nul

echo [4/4] Opening SentinelMind in your default web browser...
start http://localhost:5000

echo =====================================================================
echo  SentinelMind is RUNNING!
echo.
echo  Primary Fullstack URL: http://localhost:5000
echo  Vite Dev Server URL:   http://localhost:5173
echo  Python AI Engine URL:  http://localhost:8000
echo.
echo  If the browser tab did not open automatically, copy and paste:
echo  http://localhost:5000
echo =====================================================================
echo Keep this window and the service windows open while using SentinelMind.
pause
