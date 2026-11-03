@echo off
title XEN-MOVIES
cd /d "%~dp0"

echo Starting XEN-MOVIES...
echo The npm start script builds the frontend before starting the server.
call npm start
if errorlevel 1 (
    echo.
    echo XEN-MOVIES could not start. Check the error above.
    pause
)
