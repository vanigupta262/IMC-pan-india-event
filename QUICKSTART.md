# Quick Start Guide - IGTS IMC Event Platform

This guide shows you how to build, test, and run the entire system locally.

---

## Prerequisites

```bash
# On macOS
brew install gcc python@3.11 docker

# Verify
g++ --version
python3 --version
docker --version
```

---

## 1-Minute Start

```bash
# Clone and navigate
cd /path/to/IMC-pan-india-event

# Build and test everything
./quick_start.sh
```

*(If `quick_start.sh` doesn't exist, follow the manual steps below)*

---

## Manual Setup (5 minutes)

### Step 1: Set up Python virtual environment
```bash
python3 -m venv .venv
source .venv/bin/activate  # On macOS/Linux
# or: .venv\Scripts\activate  # On Windows

pip install -r backend/requirements.txt
```

### Step 2: Compile the C++ engine
```bash
g++ -std=c++17 main.cpp -I. -Wall -Wextra -O2 -o game
```

### Step 3: Build the Docker sandbox (optional, for production)
```bash
docker build -t igts-bot-sandbox sandbox/
```

### Step 4: Test the system
```bash
# Run all tests
python3 test_system.py --skip-docker

# Or run individual components
./game                              # Run engine (demo mode)
python3 bots/random_bot.py < /tmp/snapshot.json  # Run sample bot
python3 local_match_runner.py       # Run a 3-round match
```

---

## Run a Complete Match Locally

```bash
# Create a simple snapshot
cat > /tmp/snapshot.json << 'EOF'
{
  "version": "1.0",
  "round": 0,
  "player_id": 0,
  "n_players": 5,
  "islands": [
    {"id":0,"economy":1000.0,"degree":0},
    {"id":1,"economy":1000.0,"degree":0},
    {"id":2,"economy":1000.0,"degree":0},
    {"id":3,"economy":1000.0,"degree":0},
    {"id":4,"economy":1000.0,"degree":0}
  ],
  "roads": []
}
EOF

# Run the match runner (5 bots, 3 rounds)
python3 local_match_runner.py

# View the match log
cat logs/match_1.json | python3 -m json.tool | head -50
```

---

## Run the Backend API Server

```bash
# Start the server
python3 backend/app.py

# In another terminal, test endpoints
curl http://localhost:8000/health
curl http://localhost:8000/docs  # Interactive API docs

# Example: Register a team
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"team@example.com","username":"team1","password":"secret"}'
```

---

## Test Bot Locally

### Random Bot
```bash
cat /tmp/snapshot.json | python3 bots/random_bot.py
# Output: JSON with random actions
```

### Greedy Bot
```bash
cat /tmp/snapshot.json | python3 bots/greedy_bot.py
# Output: JSON targeting the richest opponent
```

### Test in Sandbox (Docker)
```bash
python3 sandbox/sandbox_runner.py bots/greedy_bot.py /tmp/snapshot.json --timeout 10
# Output: Bot executed in isolated container
```

---

## Directory Map

```
.
├── main.cpp                    # Engine entry point
├── engine/
│   ├── *.hpp                   # Game logic (headers-only)
│   └── bot_api_schema.json    # Bot API specification
├── bots/
│   ├── random_bot.py          # Sample random bot
│   ├── greedy_bot.py          # Sample greedy bot
│   └── README.md              # How to write a bot
├── backend/
│   ├── app.py                 # FastAPI server
│   ├── match_runner.py        # Match orchestrator
│   └── requirements.txt        # Python dependencies
├── sandbox/
│   ├── Dockerfile             # Bot sandbox image
│   ├── sandbox_runner.py      # Run bots in Docker
│   └── README.md              # Sandbox docs
├── docs/
│   └── BOT_API.md             # Bot API docs
├── local_match_runner.py      # Local match runner (dev)
├── test_system.py             # Full system tests
├── SYSTEM_OVERVIEW.md         # Complete project overview
├── TEST_REPORT.md             # Detailed test results
└── logs/                      # Match logs (auto-created)
    └── match_*.json           # Match replays
```

---

## Typical Workflows

### For Bot Developers
```bash
# 1. Read the API spec
cat docs/BOT_API.md

# 2. Write your bot (copy bots/random_bot.py as template)
cp bots/random_bot.py my_bot.py
# ... edit my_bot.py ...

# 3. Test your bot
cat /tmp/snapshot.json | python3 my_bot.py

# 4. Test in a match
# (Edit local_match_runner.py BOT_FOR_PLAYER dict to use your bot)
python3 local_match_runner.py
```

### For Tournament Organizers
```bash
# 1. Start the backend
python3 backend/app.py &

# 2. Register teams (via API or frontend)
curl -X POST http://localhost:8000/auth/register ...

# 3. Teams upload bots
curl -X POST http://localhost:8000/bots/upload ...

# 4. Run matches (via match_runner or frontend)
python3 backend/match_runner.py

# 5. View results
curl http://localhost:8000/matches/1/log
```

### For Deployment
```bash
# Build production Docker image
docker build -t igts-tournament .

# Deploy to DigitalOcean (use Terraform scripts — coming soon)
terraform apply -auto-approve

# Run matches in production
# (Backend will queue matches and execute via sandbox runners)
```

---

## Troubleshooting

### "game binary not found"
```bash
g++ -std=c++17 main.cpp -I. -o game
```

### "ModuleNotFoundError: fastapi"
```bash
source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy pydantic python-multipart email-validator
```

### "Docker image not found"
```bash
docker build -t igts-bot-sandbox sandbox/
```

### "Engine doesn't load actions.txt"
```bash
# Ensure actions.txt exists in the current directory
python3 local_match_runner.py  # Creates actions.txt automatically
```

### "Bot timeout in sandbox"
```bash
# Increase timeout (macOS Docker startup is slow)
python3 sandbox/sandbox_runner.py bots/random_bot.py snapshot.json --timeout 10
```

---

## Performance Tips

| Operation | Optimization |
|-----------|--------------|
| Engine | Use `-O2` flag in g++; compiled binary is fast (~1s for 3 rounds) |
| Bots | Run locally (subprocess) for dev; use sandbox (Docker) for production |
| Database | SQLite fine for MVP; use PostgreSQL for 10+ concurrent users |
| Logs | Compress old JSON logs; archive to S3 monthly |
| Matches | Run in parallel using background job queue (Celery) |

---

## Documentation Links

- **System Overview**: `SYSTEM_OVERVIEW.md` (complete architecture & components)
- **Bot API**: `docs/BOT_API.md` (contract & examples)
- **Test Report**: `TEST_REPORT.md` (detailed test results)
- **Backend**: `backend/README.md` (API endpoints, models)
- **Sandbox**: `sandbox/README.md` (security model, setup)
- **Bots**: `bots/README.md` (how to write a bot)

---

## Quick Commands Reference

```bash
# Build
g++ -std=c++17 main.cpp -I. -o game

# Test
python3 test_system.py --skip-docker

# Run
./game                              # Engine demo
python3 local_match_runner.py      # Match (5 bots)
python3 backend/app.py             # API server

# API
curl http://localhost:8000/health
curl http://localhost:8000/docs

# Logs
cat logs/match_1.json | python3 -m json.tool
```

---

## Getting Help

1. **Read the docs**: `SYSTEM_OVERVIEW.md`, `TEST_REPORT.md`, `BOT_API.md`
2. **Check tests**: `test_system.py` shows expected behavior
3. **Review examples**: `bots/random_bot.py`, `bots/greedy_bot.py`
4. **Run tests**: `python3 test_system.py` to verify all components work

---

## Status

✅ Engine: production-ready  
✅ Bot API: stable  
✅ Sandbox: tested  
✅ Backend: MVP-ready  
⚠️ Frontend: not implemented  
⚠️ Tournament logic: not implemented  

**Next milestone**: Frontend + tournament seeding (ETA: 2-3 weeks)
