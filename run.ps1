$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Starting XEN-MOVIES..." -ForegroundColor Cyan
Write-Host "The npm start script builds the frontend before starting the server." -ForegroundColor Gray

npm start
if ($LASTEXITCODE -ne 0) {
    Write-Host "XEN-MOVIES could not start. Check the error above." -ForegroundColor Red
    exit $LASTEXITCODE
}
