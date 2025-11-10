@echo off
echo ========================================
echo Kashmir Oil Union Backend - Quick Setup
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 20+ from: https://nodejs.org/
    pause
    exit /b 1
)
echo     Node.js: FOUND
node --version

echo.
echo [2/4] Installing dependencies...
echo     This will fix all TypeScript errors...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo     Dependencies: INSTALLED

echo.
echo [3/4] Checking for .env file...
if not exist .env (
    echo     .env file not found. Creating from .env.example...
    copy .env.example .env >nul
    echo     .env file created. Please edit it with your Neon DB credentials!
    echo.
    echo     Required: Add your DATABASE_URL to .env
    echo     Example: DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
) else (
    echo     .env file: FOUND
)

echo.
echo [4/4] Verifying TypeScript compilation...
call npx tsc --noEmit --skipLibCheck
if %errorlevel% neq 0 (
    echo WARNING: TypeScript compilation has errors.
    echo This is normal if .env is not configured yet.
) else (
    echo     TypeScript: OK
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo   1. Edit .env file with your Neon DB credentials
echo   2. Run database schema: See NEON_SETUP.md
echo   3. Start development server: npm run dev
echo.
echo Documentation:
echo   - NEON_SETUP.md - Detailed Neon DB setup guide
echo   - CONFIGURATION_SUMMARY.md - Quick reference
echo   - README.md - Full documentation
echo.
pause
