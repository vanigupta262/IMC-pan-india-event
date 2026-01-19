#!/bin/bash
# Start script for IGTS IMC Event - Full Stack
# Starts both the FastAPI backend and Next.js frontend

echo "============================================"
echo "  IGTS x IMC Event - Development Server"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/app.py" ]; then
    echo "ERROR: Please run this script from the project root directory"
    exit 1
fi

echo "Starting services..."
echo ""

# Start the FastAPI backend in the background
echo "[1/2] Starting FastAPI backend on http://localhost:8000"
cd backend && python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for the backend to initialize
sleep 3

# Start the Next.js frontend
echo "[2/2] Starting Next.js frontend on http://localhost:3000"
cd tradeui && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "  All services are running..."
echo "============================================"
echo ""
echo "  Backend API:   http://localhost:8000"
echo "  API Docs:      http://localhost:8000/docs"
echo "  Frontend:      http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo "============================================"
echo ""

# Wait for any process to exit
wait $BACKEND_PID $FRONTEND_PID

# Cleanup
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
