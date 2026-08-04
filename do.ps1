# URUU Platform - Build Utility
Write-Host "Starting URUU Production Build..." -ForegroundColor Magenta

# Generate Prisma Client & Apply Migrations
Write-Host "Step 1: Generating Prisma Client & Applying Migrations..." -ForegroundColor Cyan
npx prisma generate
npx prisma migrate deploy

# Run Next.js Build
Write-Host "Step 2: Building Next.js Application..." -ForegroundColor Cyan
npx next build

Write-Host "Build Complete." -ForegroundColor Green
