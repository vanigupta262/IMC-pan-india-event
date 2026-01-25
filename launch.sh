#!/bin/bash
# IGTS × IMC Event - Local Development Launcher
# Starts both backend and frontend servers with a simple command

set -e

cd "$(dirname "$0")" || exit 1

FRONTEND_PORT=3000
BACKEND_PORT=8000
PROJECT_DIR="$(pwd)"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🎮 IGTS × IMC Event 2 - Local Development${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo -e "${RED}❌ Virtual environment not found${NC}"
    echo "Please run: python3 -m venv .venv"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
lsof -ti:$BACKEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:$FRONTEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend
echo -e "${GREEN}✅ Starting Backend...${NC}"
python3 backend/app.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

# Verify backend is running
if ! curl -s http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    cat /tmp/backend.log
    exit 1
fi

# Start frontend
echo -e "${GREEN}✅ Starting Frontend...${NC}"
python3 frontend/server.py > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 1

# Verify frontend is running
if ! curl -s http://localhost:$FRONTEND_PORT/index.html > /dev/null 2>&1; then
    echo -e "${RED}❌ Frontend failed to start${NC}"
    cat /tmp/frontend.log
    exit 1
fi

# Display startup message
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}🎮 Platform is ready!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "📱 Frontend: ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
echo "🔌 Backend:  ${BLUE}http://localhost:$BACKEND_PORT${NC}"
echo "📚 API Docs: ${BLUE}http://localhost:$BACKEND_PORT/docs${NC}"
echo ""
echo "💡 Opening browser in 2 seconds..."
echo ""
sleep 2

# Open browser
if command -v open > /dev/null 2>&1; then
    open "http://localhost:$FRONTEND_PORT"
elif command -v xdg-open > /dev/null 2>&1; then
    xdg-open "http://localhost:$FRONTEND_PORT"
else
    echo "📱 Please open: http://localhost:$FRONTEND_PORT"
fi

echo ""
echo -e "${BLUE}Servers running with PIDs:${NC}"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"
echo ""

# Handle shutdown
cleanup() {
    echo ""
    echo -e "${BLUE}Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
