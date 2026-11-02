@echo off
title XENMOVIES - Aesthetic Free Streaming & Download Hub
color 0b
echo ===================================================================
echo     __  _______ _   ____  _______ _    ___________ _____
echo     \ \/ / ____/ \ / /  \/  / __ \ |  / /  _/ ____/ ___/
echo      \  / __/ /   / / /\_/ / / / / | / // // __/  \__ \ 
echo      / / /___/ / / / /  / / /_/ /| |/ // // /___ ___/ / 
echo     /_/_____/_/ /_/_/  /_/\____/ |___/___/_____//____/  
echo ===================================================================
echo   Aesthetic Personal Movie & Show Hub (Local & Free APIs)
echo   Vegamovies / HDHub4u Engine: 4K, 1080p, Dual Audio Magnets
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/2] Checking build status...
if not exist "dist" (
    echo Building frontend for first run...
    call npm run build
)

echo [2/2] Launching XENMOVIES on http://localhost:5000 ...
start http://localhost:5000

call npm start
pause

