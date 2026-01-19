# Next.js Frontend Integration

This Next.js application (`tradeui`) is integrated with the FastAPI backend (`backend/app.py`).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│                    (http://localhost:3000)                   │
│                                                              │
│  ┌─────────────┐    ┌─────────────────────────────────────┐ │
│  │   UI Pages  │ -> │  Next.js API Routes (/api/*)        │ │
│  │  (React)    │    │  - /api/auth/login, signup          │ │
│  │             │    │  - /api/submissions                 │ │
│  │             │    │  - /api/matches                     │ │
│  │             │    │  - /api/admin/*                     │ │
│  └─────────────┘    └───────────────┬─────────────────────┘ │
└─────────────────────────────────────┼───────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│                   (http://localhost:8000)                    │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Endpoints:                                              ││
│  │  - /auth/register - User registration                   ││
│  │  - /bots/upload - Bot file upload                       ││
│  │  - /lobbies - Lobby management                          ││
│  │  - /matches - Match execution                           ││
│  │  - /health - Health check                               ││
│  └─────────────────────────────────────────────────────────┘│
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Game Engine (sandbox)                                   ││
│  │  - Runs bot simulations                                  ││
│  │  - Uses Docker for sandboxing                            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

1. **Python 3.8+** with pip
2. **Node.js 18+** with npm
3. **SQLite** (included with Python)

### Installation

1. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```bash
   cd tradeui
   npm install
   ```

### Running the Application

**Option 1: Use the start script (Recommended)**

Windows:
```bash
start-dev.bat
```

Linux/Mac:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Option 2: Run manually in separate terminals**

Terminal 1 - Backend:
```bash
cd backend
python app.py
```

Terminal 2 - Frontend:
```bash
cd tradeui
npm run dev
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Environment Configuration

The Next.js app uses environment variables defined in `.env.local`:

```env
# Backend API URL
BACKEND_API_URL=http://localhost:8000

# Frontend server URL (legacy)
FRONTEND_SERVER_URL=http://localhost:3001

# Next.js public API URL (for client-side calls)
NEXT_PUBLIC_API_URL=/api
```

## API Routes Mapping

| Next.js Route | Backend Endpoint | Description |
|---------------|------------------|-------------|
| POST /api/auth/signup | POST /auth/register | User registration |
| POST /api/auth/login | (local auth) | User authentication |
| GET /api/submissions | GET /bots | List user's bots |
| POST /api/submissions | POST /bots/upload | Upload a bot file |
| GET /api/admin/lobbies | GET /lobbies | List lobbies |
| POST /api/admin/lobbies | POST /lobbies | Create a lobby |
| GET /api/matches | GET /matches | List matches |
| POST /api/matches | POST /matches | Create a match |
| POST /api/matches/[id] | POST /matches/{id}/run | Run a match |
| GET /api/matches/[id]/log | GET /matches/{id}/log | Get match replay log |
| GET /api/health | GET /health | Health check |

## Key Files

- `tradeui/lib/api-client.js` - Client-side API utilities
- `tradeui/lib/backend-client.js` - Server-side backend communication
- `tradeui/next.config.mjs` - Next.js configuration with proxy rewrites
- `tradeui/.env.local` - Environment variables

## Features

### Authentication
- User registration connects to FastAPI backend
- Session management via localStorage tokens

### Bot Management
- Upload Python bot files
- View all submitted bots
- Activate/deactivate bots

### Lobbies
- Create public/private lobbies
- Join lobbies with invite codes
- Max 2 players per lobby

### Matches
- Create matches from lobbies
- Run game simulations
- View match results and replay logs

## Fallback Behavior

If the backend is unavailable, the Next.js API routes will fall back to mock data, allowing the frontend to function in development mode without the backend running.
