Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "     __  _______ _   ____  _______ _    ___________ _____" -ForegroundColor Magenta
Write-Host "     \ \/ / ____/ \ / /  \/  / __ \ |  / /  _/ ____/ ___/" -ForegroundColor Magenta
Write-Host "      \  / __/ /   / / /\_/ / / / / | / // // __/  \__ \ " -ForegroundColor Magenta
Write-Host "      / / /___/ / / / /  / / /_/ /| |/ // // /___ ___/ / " -ForegroundColor Magenta
Write-Host "     /_/_____/_/ /_/_/  /_/\____/ |___/___/_____//____/  " -ForegroundColor Magenta
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "   Aesthetic Personal Movie & Show Hub (Local & Free APIs)" -ForegroundColor White
Write-Host "   Vegamovies / HDHub4u Engine: 4K, 1080p, Dual Audio Magnets" -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

if (-not (Test-Path "dist")) {
    Write-Host "[1/2] Building frontend client..." -ForegroundColor Yellow
    npm run build
}

Write-Host "[2/2] Opening browser and starting server..." -ForegroundColor Green
Start-Process "http://localhost:5000"

npm start

