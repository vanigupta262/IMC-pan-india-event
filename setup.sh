#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🛠️  IGTS × IMC Event - Platform Setup${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# 1. System Dependency Checks
echo -e "${BLUE}[1/4] Checking system dependencies...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ python3 could not be found. Please install Python 3.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python 3 found${NC}"

if ! command -v g++ &> /dev/null; then
    echo -e "${RED}❌ g++ could not be found. Please install g++.${NC}"
    echo "  sudo apt update && sudo apt install -y g++"
    exit 1
fi
echo -e "${GREEN}✅ g++ found${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  docker not found. Sandboxing will not work locally.${NC}"
    echo -e "${YELLOW}   (Proceeding with setup for development purposes)${NC}"
else
    echo -e "${GREEN}✅ Docker found${NC}"
fi

# 2. Docker Image Build
echo ""
echo -e "${BLUE}[2/5] Building Docker Sandbox Image...${NC}"
if sudo docker build -t igts-bot-sandbox sandbox/; then
    echo -e "${GREEN}✅ Docker image 'igts-bot-sandbox' built${NC}"
else
    echo -e "${YELLOW}⚠️  Docker build failed. Sandbox will not be available.${NC}"
    echo -e "${YELLOW}   (Continuing setup for backend/frontend development...)${NC}"
    # Continuing instead of exiting
fi

# 3. Python Environment Setup
echo ""
echo -e "${BLUE}[3/5] Setting up Python environment...${NC}"

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
else
    echo "Virtual environment already exists."
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing dependencies..."
pip install --upgrade pip
if [ -f "backend/requirements.txt" ]; then
    pip install -r backend/requirements.txt
else
    echo -e "${RED}❌ backend/requirements.txt not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python environment ready${NC}"

# 4. Game Engine Compilation
echo ""
echo -e "${BLUE}[4/5] Compiling Game Engine (C++)...${NC}"

# Check for source files
if [ ! -f "main.cpp" ]; then
    echo -e "${RED}❌ main.cpp not found!${NC}"
    exit 1
fi

echo "Compiling main.cpp -> game..."
# Using C++17 for compatibility, -O2 for optimization
if g++ -std=c++17 -Wall -Wextra -O2 main.cpp -o game; then
    echo -e "${GREEN}✅ Engine compiled successfully${NC}"
else
    echo -e "${RED}❌ Engine compilation failed${NC}"
    exit 1
fi

# 5. Final Checks
echo ""
echo -e "${BLUE}[5/5] Final verification...${NC}"

if [ ! -f "game" ]; then
    echo -e "${RED}❌ 'game' executable is missing.${NC}"
    exit 1
fi

if [ ! -x "game" ]; then
    chmod +x game
    echo "Made 'game' executable."
fi

# Create dummy bot files if needed for testing (Optional)
mkdir -p bots
# Remove problematic random_bot.py if it exists (ref: previous debugging)
if [ -f "bots/random_bot.py" ]; then
    echo -e "${YELLOW}Removing incompatible bots/random_bot.py...${NC}"
    rm "bots/random_bot.py"
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo "You can now run the platform using:"
echo -e "${BLUE}  ./launch.sh${NC}"
echo ""
