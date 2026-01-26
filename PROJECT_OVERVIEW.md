# IGTS (IMC Gaming Tournament System) - Project Overview

## What This Project Does

IGTS is a **complete tournament platform** for hosting AI agent competitions. It lets participants upload custom bot strategies, compete in lobbies against other bots, and watch real-time game execution with detailed match logs.

Think of it as: **Kaggle Competitions + Gaming Lobbies + Tournament Brackets = One Unified Platform**

---

## The Complete Flow

### Phase 1: User Registration & Bot Upload

```
User visits web UI (http://localhost:3000)
    ↓
Registers account (email, username, password)
    ↓
Account stored in SQLite database
    ↓
User uploads custom bot strategy (Python file)
    ↓
Bot stored in database with user_id association
```

**What happens:**
- Frontend form collects registration data
- Backend validates and creates user record
- User can upload multiple bots
- Each bot is a Python script with `get_action()` function

---

### Phase 2: Lobby Creation & Players Join

```
User creates a "Lobby" (like a game room)
    ↓
Lobby has:
  - Name (e.g., "Midnight Showdown")
  - Max players (2-5)
  - Creator user_id
  - Invite code (for private lobbies)
    ↓
Other users browse available lobbies
    ↓
Players join lobby (auto-match or invite code)
    ↓
Lobby shows member count updating in real-time
    ↓
Once full, lobby ready for match
```

**What happens:**
- Frontend displays list of available lobbies
- User creates lobby via form
- Backend assigns random invite code
- Members can join public lobbies or enter code for private ones
- Database tracks member count per lobby

---

### Phase 3: Match Creation & Player Assignment

```
Lobby creator clicks "Start Match"
    ↓
Match created from lobby:
  - Associates all lobby members
  - Records their IDs
  - Assigns each member a bot (or default fallback)
    ↓
Match status: "pending"
    ↓
Backend prepares match parameters:
  - Number of players (from lobby)
  - Bot file paths for each player
  - Match ID for tracking
    ↓
Match ready for execution
```

**What happens:**
- Frontend sends lobby_id to backend
- Backend creates Match record
- Queries LobbyMembers to find all players
- Associates participants to match
- Records participant IDs and bot assignments
- Database tracks match status throughout lifecycle

---

### Phase 4: Match Execution (The Core)

```
Backend calls GameOrchestrator.run()
    ↓
Orchestrator initializes 10-round game loop
    ↓
FOR EACH ROUND:
    │
    ├─ Collect bot actions (3 rounds shown below):
    │
    │  Round 1: Ask each bot "what do you do?"
    │  Round 2: Ask each bot again with updated game state
    │  Round 3: Ask each bot again
    │
    ├─ BOT EXECUTION (Secure via Sandbox):
    │  ├─ Bot receives game snapshot as JSON on stdin
    │  ├─ Runs in isolated Docker container
    │  ├─ Memory: 256MB max
    │  ├─ CPU: 0.5 cores max
    │  ├─ Timeout: 2 seconds
    │  ├─ Network: None (isolated)
    │  └─ Returns JSON action on stdout
    │
    ├─ Feed all actions to C++ engine:
    │  ├─ Calls: subprocess.run(["./game"])
    │  ├─ Passes bot actions (road building, trades, attacks)
    │  ├─ C++ engine simulates economics, decay, trades
    │  ├─ Returns final player states
    │  └─ Records round results
    │
    └─ Store round results in game log
       ├─ All actions taken by each player
       ├─ Game state changes
       ├─ Events (trades completed, roads built, etc.)
       └─ Final economies per player
    ↓
AFTER ALL ROUNDS:
    ├─ Calculate final rankings by economy
    ├─ Record match completion time
    ├─ Store full game log as JSON
    └─ Return results to frontend
```

**The Real-Time Mechanics:**
- **C++ Engine** handles game physics:
  - Road building costs economy
  - Investments decay each round
  - Trades transfer resources between players
  - Attacks damage opponent economy
  
- **Python Orchestrator** coordinates:
  - Calls bots in sandbox
  - Feeds actions to C++ engine
  - Logs all activity
  - Calculates final rankings

---

### Phase 5: Results Display & Game Log Viewing

```
Match completes
    ↓
Backend returns match results:
  - Final rankings (1st, 2nd, 3rd place)
  - Each player's final economy
  - Match duration
    ↓
Frontend displays on "Matches" tab:
  - Match ID
  - Players list
  - Final rank positions with economies
    ↓
User clicks "View Log" button
    ↓
Backend retrieves stored game log
    ↓
Frontend displays in modal overlay:
  - Full 3-round (or 10-round) replay
  - Every action each player took
  - Round-by-round economics
  - Events log
    ↓
User can review match strategy and results
```

**What's in the Game Log:**
```json
{
  "match_id": 1,
  "num_rounds": 3,
  "rounds": [
    {
      "round": 1,
      "actions": [
        {"player_id": 0, "action": {"type": "BUILD_ROAD", "target": 1}},
        {"player_id": 1, "action": {"type": "INVEST_DEFENSE", "target": 1}},
        ...
      ],
      "events": ["Round 1: Processed 5 actions", "1 BUILD_ROAD action(s)"]
    }
  ],
  "final_state": {
    "rankings": [
      {"player_id": 3, "economy": 1000, "rank": 1},
      {"player_id": 0, "economy": 512, "rank": 2}
    ]
  }
}
```

---

## System Architecture

### Frontend (Web UI)
- **Technology**: HTML/CSS/JavaScript (no build tools)
- **Server**: Python HTTP server on port 3000
- **Purpose**: User interface for registration, bot upload, lobbies, matches
- **Files**: `frontend/index.html`, `frontend/app.js`, `frontend/server.py`

### Backend (API)
- **Technology**: FastAPI (Python) on port 8000
- **Database**: SQLite (`igts.db`)
- **Purpose**: REST API for all game operations
- **Key Endpoints**:
  - `POST /auth/register` - Create user account
  - `POST /bots/upload` - Upload bot strategy
  - `POST /lobbies` - Create game lobby
  - `POST /lobbies/{id}/join` - Join existing lobby
  - `POST /matches` - Create match from lobby
  - `POST /matches/{id}/run` - Execute match
  - `GET /matches/{id}/log` - Retrieve game log

### Game Engine (C++)
- **Technology**: C++17
- **Purpose**: Core game simulation and mechanics
- **Components**:
  - `GameState.hpp` - Main game loop, round processing
  - `Island.hpp` - Individual player state (economy, roads, investments)
  - `Config.hpp` - Game constants and balance parameters
  - `Action.hpp` - Action type definitions
  - `IOHandler.hpp` - Reads bot actions from file
- **Binary**: `./game` (compiled executable)

### Bot Sandbox (Docker)
- **Technology**: Docker container
- **Purpose**: Secure execution of untrusted bot code
- **Image**: `igts-bot-sandbox`
- **Security**:
  - Memory limit: 256MB
  - CPU limit: 0.5 cores
  - Timeout: 2 seconds
  - Filesystem: Read-only (except 10MB /tmp)
  - Network: Isolated (no outbound connections)
  - User: Non-root `botrunner` account

### Orchestrator (Python)
- **File**: `backend/game_orchestrator.py`
- **Purpose**: Coordinates match execution
- **Responsibilities**:
  1. Loads bot files for all players
  2. Runs each bot in sandbox to get actions
  3. Calls C++ engine with those actions
  4. Parses engine output
  5. Logs results
  6. Returns game log to API

---

## Data Models

### User
```
id (primary key)
email (unique)
username (unique)
password (hashed)
created_at
```

### Bot
```
id (primary key)
user_id (foreign key)
file_path (storage location)
created_at
```

### Lobby
```
id (primary key)
creator_id (foreign key to User)
name
is_private
invite_code (random, for private lobbies)
max_players
status (open, closed, in_progress)
created_at
```

### LobbyMember
```
id (primary key)
lobby_id (foreign key)
user_id (foreign key)
joined_at
```

### Match
```
id (primary key)
lobby_id (foreign key)
status (pending, in_progress, completed)
log_data (full game log as JSON)
created_at
started_at
completed_at
```

### MatchParticipant
```
id (primary key)
match_id (foreign key)
player_id (lobby member's user_id)
bot_id (which bot this player used)
rank (final placement)
final_economy (economy at game end)
```

---

## Complete Request-Response Cycle Example

### Scenario: User uploads bot and runs a match

```
1. REGISTRATION
   Frontend: POST /auth/register
   Payload: {email: "alice@test.com", username: "alice", password: "pass"}
   Backend: Creates User(id=1, email="alice@test.com", username="alice")
   Response: {id: 1, username: "alice"}

2. BOT UPLOAD
   Frontend: POST /bots/upload (multipart file)
   Payload: Bot Python file (random_bot.py)
   Backend: 
     - Saves file to disk
     - Creates Bot(user_id=1, file_path="bots/1/random_bot.py")
   Response: {id: 1, file_path: "bots/1/random_bot.py"}

3. CREATE LOBBY
   Frontend: POST /lobbies
   Payload: {creator_id: 1, name: "Test Match", max_players: 2}
   Backend: Creates Lobby(id=1, creator_id=1, invite_code="abc123xyz")
   Response: {id: 1, invite_code: "abc123xyz"}

4. JOIN LOBBY (other user)
   Frontend: POST /lobbies/1/join
   Payload: {user_id: 2, invite_code: "abc123xyz"}
   Backend: 
     - Validates invite code
     - Creates LobbyMember(lobby_id=1, user_id=2)
     - Checks if full (2/2 members)
   Response: {message: "Successfully joined"}

5. CREATE MATCH
   Frontend: POST /matches?user_id=1
   Payload: {lobby_id: 1}
   Backend:
     - Queries LobbyMembers for lobby 1 → finds users 1, 2
     - Creates Match(lobby_id=1, status="pending")
     - Creates MatchParticipant entries for users 1, 2
   Response: {id: 1, status: "pending"}

6. RUN MATCH
   Frontend: POST /matches/1/run
   Backend:
     a) Loads bot file for user 1
     b) GameOrchestrator initializes with 2 players
     c) For round 1-3:
        - Calls bot via sandbox: run_bot_in_sandbox("bots/1/random_bot.py", snapshot)
        - Bot returns action
        - Collects all actions
        - Calls C++ engine with actions
        - C++ engine simulates and returns new economy state
        - Records round in game log
     d) After all rounds:
        - Calculates final rankings
        - Stores game_log as JSON in Match.log_data
     e) Updates MatchParticipant ranks and final economies
   Response: {status: "completed", participants: [...]}

7. VIEW MATCH LOG
   Frontend: GET /matches/1/log
   Backend: Returns Match.log_data (full 3-round game simulation)
   Frontend: Displays in modal with all round-by-round details
   User: Can review how match played out
```

---

## Key Technologies Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | HTML/CSS/JavaScript | Web UI for users |
| **Frontend Server** | Python http.server | Serves HTML/CSS/JS |
| **Backend API** | FastAPI (Python) | REST endpoints |
| **Database** | SQLite | Persistent data storage |
| **Game Engine** | C++17 | Game mechanics simulation |
| **Bot Sandbox** | Docker | Secure bot execution |
| **Orchestration** | Python subprocess | Coordinates execution |

---

## Security & Isolation

### Why Docker Sandbox?
Bots are **untrusted code** uploaded by tournament participants. They could:
- Run infinite loops (crash system)
- Consume all memory
- Make network requests (exfiltrate data)
- Read sensitive files
- Fork processes (DOS)

**The sandbox prevents all of this:**
- Memory limited to 256MB per bot
- CPU limited to 0.5 cores
- 2-second timeout enforces responsiveness
- Read-only filesystem prevents file access
- No network access prevents data exfiltration
- Non-root user prevents privilege escalation

### Why C++ Engine?
- **Fast**: Game simulation runs in milliseconds
- **Deterministic**: Same input → same output (reproducible)
- **Efficient**: Can handle 100+ players if needed
- **Battle-tested**: Years of competitive gaming

---

## Match Lifecycle

```
PENDING
  └─ Waiting for all players to join lobby
     └─ Created: Match record in database
     └─ Status: pending

IN_PROGRESS
  └─ Match running, rounds executing
     └─ GameOrchestrator.run() active
     └─ Bots executing in sandbox
     └─ C++ engine simulating
     └─ Rounds being logged
     └─ Status: in_progress

COMPLETED
  └─ All rounds finished
     └─ Final rankings calculated
     └─ Game log stored
     └─ Results displayed to users
     └─ Status: completed
     └─ Match retrievable via /matches/{id}/log
```

---

## What Makes This Project Unique

1. **Full Stack Tournament System**
   - From registration → bot upload → lobbies → execution → results
   - Not just a game engine, but a complete platform

2. **Secure Bot Execution**
   - Untrusted code runs isolated in Docker
   - Bots can't crash the system or access data
   - Tournament-grade isolation

3. **Real-Time Game Engine**
   - C++ backend for fast simulation
   - Complex mechanics (roads, trades, attacks, economy)
   - Reproducible results

4. **Web-Based Interface**
   - No installation required for participants
   - Register, upload bot, join match, watch results
   - All via browser

5. **Complete Game Replay**
   - Every action, every round logged
   - Users can review match strategy
   - Debugging and learning

---

## Example Match Flow (Visual)

```
┌─────────────────────────────────────────────────────────┐
│                   USER INTERFACE                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Register    │  │  Upload Bot  │  │  Browse      │  │
│  │              │  │              │  │  Lobbies     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│              LOBBY & MATCH MANAGEMENT                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Create      │  │  Join        │  │  Start Match │  │
│  │  Lobby       │  │  Lobby       │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│              MATCH EXECUTION ENGINE                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  GameOrchestrator (Python)                       │  │
│  │  ├─ Load bot files                               │  │
│  │  ├─ For each round (1-3):                        │  │
│  │  │  ├─ Run Bot 1 in Sandbox → Action             │  │
│  │  │  ├─ Run Bot 2 in Sandbox → Action             │  │
│  │  │  ├─ Call C++ Engine with actions              │  │
│  │  │  └─ Get new game state                        │  │
│  │  └─ Return game log                              │  │
│  └──────────────────────────────────────────────────┘  │
│                            │                            │
│        ┌───────────────────┼───────────────────┐       │
│        ↓                   ↓                   ↓       │
│   ┌─────────┐         ┌─────────┐       ┌─────────┐  │
│   │ Sandbox │         │  C++    │       │ Storage │  │
│   │ Docker  │         │ Engine  │       │  Logs   │  │
│   │  256MB  │         │  Game   │       │  JSON   │  │
│   └─────────┘         │ Physics │       └─────────┘  │
│                       └─────────┘                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   RESULTS & REPLAY                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Rankings    │  │  View Log    │  │  Next Match  │  │
│  │  1st, 2nd    │  │  Full Replay │  │  or Exit     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment & Running

### Local Development
```bash
# 1. Start backend API
cd backend
source .venv/bin/activate
python3 app.py  # Runs on http://localhost:8000

# 2. Start frontend
cd frontend
python3 server.py  # Runs on http://localhost:3000

# 3. Access web UI
# Open browser: http://localhost:3000
```

### Requirements
- Python 3.8+
- Docker (for bot sandbox)
- C++ compiler (for engine)
- macOS/Linux (primary supported OS)

### Database
- SQLite (`igts.db`)
- Auto-created on first run
- All data persisted locally
- Can be reset by deleting the file

---

## Summary

**IGTS is a tournament platform where:**

1. ✅ Users register and upload bot strategies
2. ✅ Users create lobbies and invite others
3. ✅ System orchestrates match execution
4. ✅ Bots run safely in Docker sandbox
5. ✅ C++ engine simulates complex game mechanics
6. ✅ Results calculated and logged
7. ✅ Users view rankings and game replay
8. ✅ System is ready for tournaments

**It solves the problem of:** Running AI competitions safely and fairly, with reproducible results and full transparency into how matches were decided.
