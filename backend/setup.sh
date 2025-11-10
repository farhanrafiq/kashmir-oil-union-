#!/bin/bash

echo "============================================"
echo "Kashmir Oil Union Backend - Quick Setup"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}[INFO]${NC} Node.js version: $(node --version)"
echo ""

# Navigate to script directory
cd "$(dirname "$0")"
echo -e "${GREEN}[INFO]${NC} Current directory: $(pwd)"
echo ""

# Install dependencies
echo -e "${YELLOW}[STEP 1/5]${NC} Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Failed to install dependencies!"
    exit 1
fi
echo -e "${GREEN}[SUCCESS]${NC} Dependencies installed!"
echo ""

# Setup environment file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[STEP 2/5]${NC} Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}[INFO]${NC} Please edit .env file with your database credentials"
    echo "Press Enter after editing .env file..."
    read
else
    echo -e "${YELLOW}[STEP 2/5]${NC} .env file already exists"
fi
echo ""

# Check if PostgreSQL is accessible
echo -e "${YELLOW}[STEP 3/5]${NC} Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}[SUCCESS]${NC} PostgreSQL client found: $(psql --version)"
else
    echo -e "${YELLOW}[WARNING]${NC} PostgreSQL client not found in PATH"
    echo "Make sure PostgreSQL is installed and running"
fi
echo ""

# Build TypeScript
echo -e "${YELLOW}[STEP 4/5]${NC} Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Build failed!"
    exit 1
fi
echo -e "${GREEN}[SUCCESS]${NC} Build completed!"
echo ""

# Instructions
echo -e "${YELLOW}[STEP 5/5]${NC} Setup Complete!"
echo ""
echo "============================================"
echo "Next Steps:"
echo "============================================"
echo ""
echo "1. Set up PostgreSQL database:"
echo "   createdb kashmir_oil_union"
echo "   psql kashmir_oil_union < database/schema.sql"
echo "   psql kashmir_oil_union < database/seed.sql"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Or start with Docker:"
echo "   docker-compose up -d"
echo ""
echo "4. API will be available at:"
echo "   http://localhost:5000/api/v1"
echo ""
echo "5. Test with default credentials:"
echo "   Admin: admin@kashmiroil.com / admin123"
echo "   Dealer: dealer@kashmirpetroleum.com / dealer123"
echo ""
echo "============================================"
echo ""
