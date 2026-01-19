@echo off
REM Start script for IGTS IMC Event - Full Stack
REM Starts both the FastAPI backend and Next.js frontend

echo ============================================
echo   IGTS x IMC Event - Development Server
echo ============================================
echo.

REM Check if we're in the right directory
if not exist "backend\app.py" (
    echo ERROR: Please run this script from the project root directory
    pause
    exit /b 1
)

echo Starting services...
echo.

REM Start the FastAPI backend in a new terminal
echo [1/2] Starting FastAPI backend on http://localhost:8000
start "FastAPI Backend" cmd /k "cd backend && python app.py"

REM Wait a moment for the backend to initialize
timeout /t 3 /nobreak > nul

REM Start the Next.js frontend in a new terminal
echo [2/2] Starting Next.js frontend on http://localhost:3000
start "Next.js Frontend" cmd /k "cd tradeui && npm run dev"

echo.
echo ============================================
echo   All services are starting...
echo ============================================
echo.
echo   Backend API:   http://localhost:8000
echo   API Docs:      http://localhost:8000/docs
echo   Frontend:      http://localhost:3000
echo.
echo   Close the terminal windows to stop the servers
echo ============================================
echo.

pause
