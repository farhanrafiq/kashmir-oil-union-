@echo off
echo ============================================
echo Kashmir Oil Union Backend - Quick Setup
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

:: Navigate to backend directory
cd /d "%~dp0"
echo [INFO] Current directory: %CD%
echo.

:: Install dependencies
echo [STEP 1/5] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed!
echo.

:: Setup environment file
if not exist ".env" (
    echo [STEP 2/5] Creating .env file...
    copy .env.example .env
    echo [INFO] Please edit .env file with your database credentials
    echo Press any key after editing .env file...
    pause >nul
) else (
    echo [STEP 2/5] .env file already exists
)
echo.

:: Check if PostgreSQL is accessible
echo [STEP 3/5] Checking PostgreSQL connection...
psql --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] PostgreSQL client not found in PATH
    echo Make sure PostgreSQL is installed and running
) else (
    echo [SUCCESS] PostgreSQL client found
)
echo.

:: Build TypeScript
echo [STEP 4/5] Building TypeScript...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo [SUCCESS] Build completed!
echo.

:: Instructions
echo [STEP 5/5] Setup Complete!
echo.
echo ============================================
echo Next Steps:
echo ============================================
echo.
echo 1. Set up PostgreSQL database:
echo    createdb kashmir_oil_union
echo    psql kashmir_oil_union -f database\schema.sql
echo    psql kashmir_oil_union -f database\seed.sql
echo.
echo 2. Start the development server:
echo    npm run dev
echo.
echo 3. Or start with Docker:
echo    docker-compose up -d
echo.
echo 4. API will be available at:
echo    http://localhost:5000/api/v1
echo.
echo 5. Test with default credentials:
echo    Admin: admin@kashmiroil.com / admin123
echo    Dealer: dealer@kashmirpetroleum.com / dealer123
echo.
echo ============================================
echo.
pause
