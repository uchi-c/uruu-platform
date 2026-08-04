# URUU Platform - Production Runtime Utility
Write-Host "Starting URUU Platform in Production Mode..." -ForegroundColor Magenta

# Check for .next directory (result of npm run build)
if (-Not (Test-Path ".next")) {
    Write-Host "Error: Production build not found. Please run .\do.ps1 first." -ForegroundColor Red
    exit 1
}

# Run Next.js Start
Write-Host "Launching SOC Command Center..." -ForegroundColor Cyan
npm run start
