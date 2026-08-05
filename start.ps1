# Eventra — start backend + frontend (Windows PowerShell)
$Root = $PSScriptRoot

Write-Host "Starting Eventra..." -ForegroundColor Cyan

if (-not (Test-Path "$Root\Backend\.env")) {
    Write-Host "ERROR: Backend\.env is missing." -ForegroundColor Red
    Write-Host "Copy Backend\.env.example to Backend\.env and set MONGO_URI." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "$Root\Backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install --prefix "$Root\Backend"
}

if (-not (Test-Path "$Root\Frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install --prefix "$Root\Frontend"
}

Write-Host "Backend  -> http://localhost:5000" -ForegroundColor Blue
Write-Host "Frontend -> http://localhost:4200" -ForegroundColor Green
Write-Host "Press Ctrl+C in this window to stop both servers." -ForegroundColor DarkGray

Set-Location $Root
npm run dev
