# IGTS2 - IMC Pan-India Event Testing Guide

Complete guide to test the project from terminal setup through UI navigation.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Terminal Setup & Startup](#terminal-setup--startup)
3. [Verify System is Running](#verify-system-is-running)
4. [Web UI Testing](#web-ui-testing)
5. [Testing Workflow](#testing-workflow)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Ensure you have:
- Python 3.8+ installed
- Docker running (for bot sandbox)
- Virtual environment configured
- C++ engine compiled

---

## Terminal Setup & Startup

### Step 1: Navigate to Project Directory

```bash
cd /Users/vanigupta/Desktop/igts2/IMC-pan-india-event
```

### Step 2: Activate Virtual Environment

```bash
source .venv/bin/activate
```

### Step 3: Clean Up (Optional - for fresh start)

Kill any existing processes and clear database:

```bash
pkill -f "python.*app.py"
pkill -f "frontend/server.py"
rm -f igts.db
echo "Database cleared and servers stopped"
```

### Step 4: Start Backend Server

```bash
python3 backend/app.py > /tmp/backend.log 2>&1 &
sleep 2
echo "Backend started on port 8000"
```

### Step 5: Start Frontend Server

```bash
python3 frontend/server.py > /tmp/frontend.log 2>&1 &
sleep 2
echo "Frontend started on port 3000"
```

### Step 6: Verify Both Servers Started

```bash
curl -s http://localhost:8000/health | python3 -m json.tool
```

Expected output:
```json
{
    "status": "ok",
    "message": "Backend is running"
}
```

Check frontend:
```bash
curl -s http://localhost:3000 | head -5
```

---

## Verify System is Running

### Check Backend Health

```bash
curl -s http://localhost:8000/health | python3 -m json.tool
```

### Check Lobbies

```bash
curl -s http://localhost:8000/lobbies | python3 -m json.tool
```

### View Backend Logs

```bash
tail -50 /tmp/backend.log
```

### View Frontend Logs

```bash
tail -50 /tmp/frontend.log
```

### Test C++ Engine (Optional)

```bash
./game 2>&1 | head -20
```

### Test Bot Directly

```bash
python3 -c "
import json
snapshot = {'version': '1.0', 'round': 1, 'player_id': 0, 'n_players': 2}
import subprocess
result = subprocess.run(['python3', 'bots/trader_bot.py'], 
                       input=json.dumps(snapshot), 
                       capture_output=True, text=True)
print(result.stdout)
"
```

---

## Web UI Testing

### Open Web Interface

Open your browser and navigate to:

```
http://localhost:3000
```

---

## Testing Workflow

### Phase 1: User Registration

#### Step 1.1: Register First User

1. On the homepage, click **"Sign Up"** or **"Register"**
2. Enter username (e.g., `player1`)
3. Enter email (e.g., `player1@test.com`)
4. Enter password (e.g., `password123`)
5. Click **"Register"** button
6. You should be redirected to dashboard

#### Step 1.2: Register Second User

1. Log out or open browser incognito window
2. Repeat steps above with different username (e.g., `player2`)
3. Keep both user tabs open

### Phase 2: Bot Upload

#### Step 2.1: Upload Bot for Player 1

1. Login as `player1`
2. Go to **"My Bots"** or **"Dashboard"** section
3. Click **"Upload New Bot"**
4. Select file: `bots/trader_bot.py`
5. Give it a name (e.g., "Trader Bot")
6. Click **"Upload"** button
7. Verify bot appears in your bots list

#### Step 2.2: Upload Bot for Player 2

1. Switch to `player2` tab (or login as player2)
2. Go to **"My Bots"** or **"Dashboard"** section
3. Click **"Upload New Bot"**
4. Select file: `bots/defensive_bot.py`
5. Give it a name (e.g., "Defensive Bot")
6. Click **"Upload"** button
7. Verify bot appears in your bots list

### Phase 3: Create Lobby

#### Step 3.1: Player 1 Creates Lobby

1. Login as `player1`
2. Go to **"Lobbies"** or **"Create Match"** section
3. Click **"Create New Lobby"**
4. Set:
   - **Lobby Name**: "Test Match 1"
   - **Game Type**: "2-Player"
   - **Number of Rounds**: "10"
5. Click **"Create Lobby"**
6. You should see an **invite code** (e.g., "aB3xYzK9")
7. Copy the invite code

#### Step 3.2: Player 2 Joins Lobby

1. Switch to `player2` tab
2. Go to **"Lobbies"** section
3. Click **"Join Lobby"**
4. Paste the invite code from Step 3.1
5. Click **"Join"** button
6. Verify you're in the lobby with Player 1

### Phase 4: Assign Bots to Players

#### Step 4.1: Player 1 Selects Bot

1. In the lobby (as `player1`), look for **"Select Your Bot"** section
2. From dropdown, select **"Trader Bot"**
3. Click **"Confirm"** or **"Ready"**

#### Step 4.2: Player 2 Selects Bot

1. In the lobby (as `player2`), look for **"Select Your Bot"** section
2. From dropdown, select **"Defensive Bot"**
3. Click **"Confirm"** or **"Ready"**

### Phase 5: Start Match

#### Step 5.1: Start the Game

1. Once both players are ready with bots selected
2. Look for **"Start Match"** or **"Begin Game"** button
3. Click it (usually only lobby creator can start)
4. Game will begin processing
5. Wait for 10-15 seconds for all 10 rounds to complete

### Phase 6: View Results

#### Step 6.1: See Final Rankings

After match completes, you should see:
- **Final Rankings** with both players
- **Final Economy** for each player (should be ~640 each)
- **Number of Roads** built (should be 1 each)
- **Match Status**: "Completed"

#### Step 6.2: View Detailed Match Log

1. Click on the match in your history
2. Or go to **"Match Details"** / **"View Log"**
3. You should see:
   - **Round 1**: Both BUILD_ROAD
   - **Round 2**: Both TRADE
   - **Round 3**: Both TRADE
   - **Round 4**: Player 0 ATTACK, Player 1 INVEST_MANUFACTURING
   - **Rounds 5-10**: Both NO_OP
4. Each round shows:
   - Actions taken by each player
   - Events (e.g., "Round 1 executed")
   - Economic state after round

#### Step 6.3: Check Match API Response

```bash
curl -s http://localhost:8000/matches/1/log | python3 -m json.tool | head -100
```

Expected output includes:
```json
{
  "match_id": 1,
  "num_players": 2,
  "num_rounds": 10,
  "rounds": [
    {
      "round": 1,
      "actions": [
        {"type": "BUILD_ROAD", "target": 1},
        {"type": "BUILD_ROAD", "target": 0}
      ],
      "events": ["Round 1 executed"]
    },
    ...
  ],
  "final_state": {
    "player_economies": {"0": 640, "1": 640},
    "player_states": {...},
    "rankings": [...]
  }
}
```

---

## Testing Workflow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. START SERVERS (Backend + Frontend)                   │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 2. REGISTER TWO USERS (player1 + player2)              │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 3. UPLOAD BOTS (trader_bot.py + defensive_bot.py)      │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 4. CREATE LOBBY (player1 creates, player2 joins)       │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 5. ASSIGN BOTS (each player selects their bot)          │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 6. START MATCH (game runs for 10 rounds)                │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 7. VIEW RESULTS (check rankings, logs, economies)       │
└─────────────────────────────────────────────────────────┘
```

---

## Expected Results

### After Match Completes:

**Final State:**
```
Player 0 (Trader): economy=640, roads=1, defense=0, manufacturing=0
Player 1 (Defensive): economy=640, roads=1, defense=0, manufacturing=0
```

**Action Sequence:**
- Round 1: Both BUILD_ROAD (establishing connection)
- Rounds 2-3: Both TRADE (profit exchange)
- Round 4: Divergent strategies (attack vs invest)
- Rounds 5-10: NO_OP (stable)

**Economy Timeline:**
```
Start: 1000 → 1000
After R1: 800 → 800 (roads cost 200 each)
After R2: 813 → 813 (trades +13 each)
After R3: 827 → 827 (trades +13 each)
After R4: 640 → 640 (complex interactions)
Final: 640 → 640 (stable)
```

---

## Troubleshooting

### Issue: Backend Won't Start

**Problem**: Port 8000 already in use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Try starting again
python3 backend/app.py > /tmp/backend.log 2>&1 &
```

### Issue: Frontend Won't Start

**Problem**: Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Try starting again
python3 frontend/server.py > /tmp/frontend.log 2>&1 &
```

### Issue: Bots Not Executing

**Problem**: Sandbox Docker image missing

```bash
# Check if image exists
docker images | grep igts-bot-sandbox

# If missing, rebuild
docker build -t igts-bot-sandbox sandbox/
```

### Issue: Database Lock

**Problem**: Database is locked

```bash
# Delete and recreate
rm -f igts.db

# Restart backend
pkill -f "python.*app.py"
python3 backend/app.py > /tmp/backend.log 2>&1 &
```

### Issue: C++ Engine Not Found

**Problem**: Engine executable not found

```bash
# Recompile engine
g++ -std=c++17 -I. main.cpp -o game

# Verify it exists
ls -la ./game
```

### Issue: Match Shows No Actions

**Problem**: Actions list is empty in response

1. Check backend log:
   ```bash
   grep "Collecting bot actions" /tmp/backend.log
   ```

2. Verify bots executed:
   ```bash
   grep "Sandbox.*Player.*returned" /tmp/backend.log
   ```

3. Check actions.txt was created:
   ```bash
   cat actions.txt
   ```

### Issue: Match Completes Instantly with 1000 Economy

**Problem**: Bots not being called or engine not processing actions

```bash
# Verify in backend log
tail -50 /tmp/backend.log | grep -i "bot\|action\|collect"

# Test bot directly
python3 bots/trader_bot.py < test_snapshot.json
```

### Issue: Docker Sandbox Error

**Problem**: Bot fails in sandbox

```bash
# Test sandbox directly
python3 -c "
from sandbox.sandbox_runner import run_bot_in_sandbox
import json
snapshot = {'version': '1.0', 'round': 1, 'player_id': 0, 'n_players': 2}
result = run_bot_in_sandbox('bots/trader_bot.py', snapshot)
print(result)
"
```

---

## Command Reference

### Quick Start (One-liner)

```bash
cd /Users/vanigupta/Desktop/igts2/IMC-pan-india-event && \
pkill -f "python.*app.py"; pkill -f "frontend/server.py"; \
source .venv/bin/activate && \
python3 backend/app.py > /tmp/backend.log 2>&1 & \
sleep 2 && \
python3 frontend/server.py > /tmp/frontend.log 2>&1 & \
sleep 2 && \
echo "✅ Backend and Frontend started!" && \
curl -s http://localhost:8000/health | python3 -m json.tool
```

### View All Matches via API

```bash
curl -s http://localhost:8000/matches | python3 -m json.tool
```

### View Specific Match

```bash
# Replace 1 with match_id
curl -s http://localhost:8000/matches/1/log | python3 -m json.tool
```

### Get All Lobbies

```bash
curl -s http://localhost:8000/lobbies | python3 -m json.tool
```

### View Logs

```bash
# Backend logs
tail -100 /tmp/backend.log

# Frontend logs
tail -100 /tmp/frontend.log

# Both in real-time
tail -f /tmp/backend.log &
tail -f /tmp/frontend.log &
```

### Stop All Services

```bash
pkill -f "python.*app.py"
pkill -f "frontend/server.py"
echo "✅ All services stopped"
```

---

## Expected Console Output

### Backend Starting:
```
Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Match Execution Log:
```
[Match 8] Starting game with 2 players for 10 rounds
[Match 8] Collecting bot actions...
[Match 8] Bot mapping: {0: 'bots/5/trade_013b4fdf.py', 1: 'bots/6/def_08145fb2.py'}
[Match 8] Round 1, Player 0: {'type': 'BUILD_ROAD', 'target': 1}
[Match 8] Round 1, Player 1: {'type': 'BUILD_ROAD', 'target': 0}
[Match 8] Wrote 2 player action sequences to actions.txt
[Match 8] Engine output:
Game Engine Initialized.
--- Initial State (round=0) ---
[IOHandler] Loaded 2 players with 10 rounds of actions from 'actions.txt'
[IOHandler] Using loaded actions for round 1
--- After Round (round=1) ---
Player 0: economy=800, def=0, mf=0, deg=1
Player 1: economy=800, def=0, mf=0, deg=1
...
[Match 8] Game complete! Final rankings:
  Rank 1: Player 0 with economy 640.0
  Rank 2: Player 1 with economy 640.0
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Web Browser                            │
│              http://localhost:3000                          │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Frontend Server                           │
│              (frontend/server.py)                           │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP Requests
┌────────────────▼────────────────────────────────────────────┐
│                   Backend API                               │
│      (backend/app.py - FastAPI on :8000)                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  GameOrchestrator                                   │   │
│  │  - Collects bot actions                             │   │
│  │  - Writes actions.txt                               │   │
│  │  - Calls C++ engine (./game)                         │   │
│  │  - Parses results                                   │   │
│  └──────┬──────────────────────────┬────────────────────┘   │
│         │                          │                        │
├─────────▼──────────────────────┐  │                        │
│  Bot Execution (Sandbox)       │  │                        │
│  - Docker container            │  │                        │
│  - 256MB memory limit          │  │                        │
│  - 2s timeout                  │  │                        │
│  - Returns action JSON         │  │                        │
└────────────────────────────────┘  │                        │
│                                   │                        │
│         ┌───────────────────────────▼────┐                │
│         │  C++ Game Engine (./game)       │                │
│         │  - Reads actions.txt            │                │
│         │  - Processes 10 rounds          │                │
│         │  - Calculates economies         │                │
│         │  - Returns game log             │                │
│         └─────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  SQLite DB     │
         │  (igts.db)     │
         └────────────────┘
```

---

## Additional Notes

- **Game Duration**: Each match completes in 1-3 seconds (10 rounds)
- **Bots**: Must be Python files with `get_action()` function
- **Actions**: Sent to C++ engine via `actions.txt` file
- **Economy**: Starts at 1000, decreases with actions
- **Roads**: Created when both players agree to BUILD_ROAD
- **Sandbox**: All bots run in isolated Docker container

---

## Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Two users registered
- [ ] Both bots uploaded
- [ ] Lobby created with both players
- [ ] Bots assigned to players
- [ ] Match started successfully
- [ ] 10 rounds completed
- [ ] Final economy is 640 for both players
- [ ] Actions list populated in match log
- [ ] Match log shows BUILD_ROAD, TRADE, TRADE, divergent actions, NO_OPs

---

## Support

For issues, check:
1. Backend logs: `tail -50 /tmp/backend.log`
2. Frontend logs: `tail -50 /tmp/frontend.log`
3. Docker containers: `docker ps`
4. Processes: `ps aux | grep python`
5. Database: `sqlite3 igts.db "SELECT * FROM matches;"`

