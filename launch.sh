#!/bin/bash
# IGTS × IMC Event - Local Development Launcher
# Starts both backend and frontend servers

set -e

cd "$(dirname "$0")" || exit 1

FRONTEND_PORT=3000
BACKEND_PORT=8000

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🎮 IGTS × IMC Event - Launching Platform${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# 1. Check if Setup is needed
if [ ! -d ".venv" ] || [ ! -f "game" ]; then
    echo -e "${RED}⚠️  Environment not ready. Running setup...${NC}"
    chmod +x setup.sh
    ./setup.sh
    echo ""
fi

# 1.5 Docker Check & Fallback
if command -v docker >/dev/null 2>&1 && sudo docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker is running. Sandboxing enabled.${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not verified. Enabling INSECURE LOCAL EXECUTION.${NC}"
    echo -e "${YELLOW}   Bots will run directly on host. Use with caution.${NC}"
    export ALLOW_INSECURE_LOCAL_EXECUTION=1
fi

# 2. Activate Environment
source .venv/bin/activate

# 3. Cleanup Old Processes
echo -e "${BLUE}🧹 Cleaning up ports...${NC}"
fuser -k $BACKEND_PORT/tcp > /dev/null 2>&1 || true
fuser -k $FRONTEND_PORT/tcp > /dev/null 2>&1 || true
pkill -f "python3 backend/app.py" || true
pkill -f "python3 frontend/server.py" || true
sleep 1

# 4. Start Backend (with timeout)
echo -e "${GREEN}✅ Starting Backend on port $BACKEND_PORT...${NC}"
python3 backend/app.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo "   Waiting for backend to be ready..."
MAX_RETRIES=10
COUNT=0
URL="http://localhost:$BACKEND_PORT/health"

while ! curl -s $URL > /dev/null; do
    sleep 1
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}❌ Backend failed to start (Timeout). Logs:${NC}"
        tail -n 20 /tmp/backend.log
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
done

# 5. Start Frontend
echo -e "${GREEN}✅ Starting Frontend on port $FRONTEND_PORT...${NC}"
python3 frontend/server.py > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 1

# 6. Ready Message
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}🚀 Platform is LIVE!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "📱 Frontend: ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
echo -e "🔌 Backend:  ${BLUE}http://localhost:$BACKEND_PORT${NC}"
echo -e "📚 API Docs: ${BLUE}http://localhost:$BACKEND_PORT/docs${NC}"
echo ""

# 7. Open Browser
if command -v open > /dev/null 2>&1; then
    open "http://localhost:$FRONTEND_PORT"
elif command -v xdg-open > /dev/null 2>&1; then
    xdg-open "http://localhost:$FRONTEND_PORT"
else
    echo "📱 Please open: http://localhost:$FRONTEND_PORT"
fi

# 8. Process Manager
echo -e "${BLUE}Servers running (PID: Backend=$BACKEND_PID, Frontend=$FRONTEND_PID)${NC}"
echo -e "${BLUE}Press Ctrl+C to stop${NC}"
echo ""

cleanup() {
    echo ""
    echo -e "${BLUE}Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
