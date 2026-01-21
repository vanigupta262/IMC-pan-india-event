# Complete Data Flow: User Registration → Match Execution → Logs

## 1. USER REGISTRATION

### What happens:
```
POST /auth/register
```

### Request:
```json
{
  "username": "player1",
  "email": "player1@test.com", 
  "password": "pass123"
}
```

### Where data is saved:
**Database**: `igts.db` (SQLite)
**Table**: `users`

**Columns stored**:
- `id` (auto-increment primary key)
- `email` (unique)
- `username` (unique)
- `hashed_password` (bcrypt hash)
- `created_at` (timestamp)

### Example:
```
users table:
┌────┬──────────┬─────────────────────┬────────────────────┬──────────────────────┐
│ id │ username │ email               │ hashed_password    │ created_at           │
├────┼──────────┼─────────────────────┼────────────────────┼──────────────────────┤
│ 1  │ player1  │ player1@test.com    │ $2b$12$abc...      │ 2026-01-17 10:12:20  │
│ 2  │ player2  │ player2@test.com    │ $2b$12$def...      │ 2026-01-17 10:12:21  │
└────┴──────────┴─────────────────────┴────────────────────┴──────────────────────┘
```

---

## 2. BOT UPLOAD

### What happens:
```
POST /bots/upload?user_id=1&bot_name=DeterministicBot
Content-Type: multipart/form-data
file: bot_deterministic.py
```

### Where data is saved:

#### A) File Storage (filesystem):
**Location**: `bots/{user_id}/{bot_name}_{random_token}.py`
**Example**: `bots/1/DeterministicBot_a1b2c3d4.py`

**File content** (example):
```python
def get_action(game_state):
    return {"type": "TRADE", "target": 0}
def initialize(config):
    return {"status": "ready"}
```

#### B) Database (igts.db):
**Table**: `bots`

**Columns stored**:
- `id` (auto-increment)
- `user_id` (foreign key to users.id)
- `name` (string)
- `file_path` (path to the .py file)
- `version` (integer)
- `uploaded_at` (timestamp)

### Example:
```
bots table:
┌────┬─────────┬──────────────────────────────┬──────────────┬─────────┐
│ id │ user_id │ file_path                    │ name         │ version │
├────┼─────────┼──────────────────────────────┼──────────────┼─────────┤
│ 1  │ 1       │ bots/1/DeterministicBot_...  │ DeterministicBot │ 1  │
│ 2  │ 2       │ bots/2/DeterministicBot_...  │ DeterministicBot │ 1  │
│ 3  │ 3       │ bots/3/DeterministicBot_...  │ DeterministicBot │ 1  │
│ 4  │ 4       │ bots/4/DeterministicBot_...  │ DeterministicBot │ 1  │
│ 5  │ 5       │ bots/5/DeterministicBot_...  │ DeterministicBot │ 1  │
└────┴─────────┴──────────────────────────────┴──────────────┴─────────┘
```

---

## 3. LOBBY CREATION & JOINING

### Lobby Creation:
```
POST /lobbies
{
  "name": "5-Player Match",
  "visibility": "public",
  "max_players": 5,
  "creator_id": 1
}
```

**Database Table**: `lobbies`
**Columns**:
- `id` (auto-increment)
- `name` (string)
- `creator_id` (foreign key to users.id)
- `is_private` (boolean)
- `invite_code` (string, null if public)
- `status` (string: "open" or "started")
- `max_players` (integer)
- `created_at` (timestamp)

### Example:
```
lobbies table:
┌────┬──────────────────┬────────────┬───────────┬─────────────┬────────┬──────────┐
│ id │ name             │ creator_id │ is_private│ invite_code │ status │ max_players
├────┼──────────────────┼────────────┼───────────┼─────────────┼────────┼──────────┤
│ 1  │ 5-Player Match   │ 1          │ false     │ NULL        │ open   │ 5        │
└────┴──────────────────┴────────────┴───────────┴─────────────┴────────┴──────────┘
```

### Joining Lobby:
```
POST /lobbies/1/join
{
  "user_id": 2
}
```

**Database Table**: `lobby_members`
**Columns**:
- `id` (auto-increment)
- `lobby_id` (foreign key to lobbies.id)
- `user_id` (foreign key to users.id)
- `joined_at` (timestamp)

### Example:
```
lobby_members table:
┌────┬──────────┬─────────┬──────────────────────┐
│ id │ lobby_id │ user_id │ joined_at            │
├────┼──────────┼─────────┼──────────────────────┤
│ 1  │ 1        │ 1       │ 2026-01-17 10:12:20  │
│ 2  │ 1        │ 2       │ 2026-01-17 10:12:21  │
│ 3  │ 1        │ 3       │ 2026-01-17 10:12:22  │
│ 4  │ 1        │ 4       │ 2026-01-17 10:12:23  │
│ 5  │ 1        │ 5       │ 2026-01-17 10:12:24  │
└────┴──────────┴─────────┴──────────────────────┘
```

---

## 4. MATCH CREATION

### What happens:
```
POST /matches?user_id=1
{
  "lobby_id": 1
}
```

**Database Table**: `matches`
**Columns stored**:
- `id` (auto-increment)
- `lobby_id` (foreign key to lobbies.id)
- `user_id` (creator/organizer)
- `status` (string: "pending" → "completed")
- `created_at` (timestamp)
- `started_at` (timestamp, null initially)
- `completed_at` (timestamp, null initially)
- `log_file_path` (path to log file, null initially)
- `log_data` (JSON text, null initially)
- `final_result` (JSON text, null initially)

### Example (after creation):
```
matches table (pending state):
┌────┬──────────┬─────────┬───────────┬──────────────────────┬────────────┬──────────────┬──────────┬──────────┐
│ id │ lobby_id │ user_id │ status    │ created_at           │ started_at │ completed_at │ log_data │ final_result
├────┼──────────┼─────────┼───────────┼──────────────────────┼────────────┼──────────────┼──────────┼──────────┤
│ 1  │ 1        │ 1       │ pending   │ 2026-01-17 10:12:20  │ NULL       │ NULL         │ NULL     │ NULL     │
└────┴──────────┴─────────┴───────────┴──────────────────────┴────────────┴──────────────┴──────────┴──────────┘
```

**Also updates in database**:
- `lobbies` table: sets `status` from "open" to "started" for this lobby

---

## 5. MATCH EXECUTION (RUN MATCH)

### What happens:
```
POST /matches/1/run
```

### Detailed execution flow:

#### Step 1: Fetch lobby members
Query `lobby_members` table for `lobby_id = 1` to get all 5 user_ids

#### Step 2: Fetch bots for each player
Query `bots` table to get `file_path` for each user_id
Example:
```
Player 1 → bots/1/DeterministicBot_a1b2.py
Player 2 → bots/2/DeterministicBot_c3d4.py
Player 3 → bots/3/DeterministicBot_e5f6.py
Player 4 → bots/4/DeterministicBot_g7h8.py
Player 5 → bots/5/DeterministicBot_i9j0.py
```

#### Step 3: Initialize GameOrchestrator
```python
orchestrator = GameOrchestrator(
    match_id=1,
    players=[
        {"id": 1, "username": "player1"},
        {"id": 2, "username": "player2"},
        {"id": 3, "username": "player3"},
        {"id": 4, "username": "player4"},
        {"id": 5, "username": "player5"}
    ],
    bots={
        1: "bots/1/DeterministicBot_a1b2.py",
        2: "bots/2/DeterministicBot_c3d4.py",
        3: "bots/3/DeterministicBot_e5f6.py",
        4: "bots/4/DeterministicBot_g7h8.py",
        5: "bots/5/DeterministicBot_i9j0.py"
    }
)
```

#### Step 4: Run 100 rounds
For each round (1-100):
1. Build game state with current player economies
2. **For each bot (1-5) in parallel conceptually**:
   - Load bot Python file
   - Execute `bot.get_action(game_state)`
   - Collect returned action (type + target)
3. Process all 5 actions together
4. Update game state and economies
5. Record all 5 actions + events in round log

**Total: 100 rounds × 5 actions = 500 actions collected**

#### Step 5: Generate rankings
Final ranking based on final economies

#### Step 6: Create match participants
For each of the 5 players, insert into `match_participants` table:

**Database Table**: `match_participants`
**Columns**:
- `id` (auto-increment)
- `match_id` (foreign key to matches.id)
- `player_id` (foreign key to users.id)
- `bot_id` (foreign key to bots.id, assigned automatically)
- `rank` (integer: 1-5)
- `final_economy` (float)

### Example (after match run):
```
match_participants table:
┌────┬──────────┬───────────┬────────┬──────┬───────────────┐
│ id │ match_id │ player_id │ bot_id │ rank │ final_economy │
├────┼──────────┼───────────┼────────┼──────┼───────────────┤
│ 1  │ 1        │ 1         │ 1      │ 1    │ 1000          │
│ 2  │ 1        │ 2         │ 2      │ 2    │ 1000          │
│ 3  │ 1        │ 3         │ 3      │ 3    │ 1000          │
│ 4  │ 1        │ 4         │ 4      │ 4    │ 1000          │
│ 5  │ 1        │ 5         │ 5      │ 5    │ 1000          │
└────┴──────────┴───────────┴────────┴──────┴───────────────┘
```

#### Step 7: Store complete game log
Updates `matches` table with:
- `status`: "pending" → "completed"
- `completed_at`: current timestamp
- `log_data`: JSON string containing full 100-round log

**JSON Structure** (stored in `matches.log_data`):
```json
{
  "match_id": 1,
  "num_players": 5,
  "num_rounds": 100,
  "start_time": "2026-01-17T10:12:28.199116",
  "rounds": [
    {
      "round": 1,
      "actions": [
        {
          "player_id": 1,
          "player_name": "player1",
          "action": {"type": "TRADE", "target": 0}
        },
        {
          "player_id": 2,
          "player_name": "player2",
          "action": {"type": "TRADE", "target": 0}
        },
        ...5 actions total per round
      ],
      "events": [
        "Round 1: Processed 5 actions",
        "  - 5 TRADE action(s)"
      ]
    },
    ... (100 rounds total)
  ],
  "final_state": {
    "player_economies": {1: 1000, 2: 1000, 3: 1000, 4: 1000, 5: 1000},
    "rankings": [
      {"player_id": 1, "economy": 1000, "rank": 1},
      {"player_id": 2, "economy": 1000, "rank": 2},
      ...
    ]
  },
  "end_time": "2026-01-17T10:12:36.234567"
}
```

---

## 6. LOG STORAGE & RETRIEVAL

### Where logs are stored:

#### Option A: Database (CURRENT IMPLEMENTATION)
**Table**: `matches`
**Column**: `log_data` (TEXT type, stores JSON)
**How**: When match completes, entire game log is serialized to JSON and saved in `log_data` column
**Retrieval**: `GET /matches/{match_id}/log` queries the `log_data` column and returns as JSON

#### Option B: Filesystem (Alternative, not currently used)
**Location**: `logs/match_{match_id}.json`
**Example**: `logs/match_1.json`

### Retrieve logs:
```
GET /matches/1/log
```

**Response**: Full 100-round game log JSON with all 500 actions

---

## 7. COMPLETE DATA HIERARCHY

```
Database (igts.db)
├── users
│   ├── id: 1 → username: player1, email: player1@test.com
│   ├── id: 2 → username: player2, email: player2@test.com
│   └── ... (5 total)
│
├── bots
│   ├── id: 1 → user_id: 1, file_path: "bots/1/DeterministicBot_..."
│   ├── id: 2 → user_id: 2, file_path: "bots/2/DeterministicBot_..."
│   └── ... (5 total)
│
├── lobbies
│   └── id: 1 → name: "5-Player Match", creator_id: 1, status: "started"
│
├── lobby_members
│   ├── user_id: 1 → lobby_id: 1
│   ├── user_id: 2 → lobby_id: 1
│   ├── user_id: 3 → lobby_id: 1
│   ├── user_id: 4 → lobby_id: 1
│   └── user_id: 5 → lobby_id: 1
│
├── matches
│   └── id: 1
│       ├── lobby_id: 1
│       ├── status: "completed"
│       ├── log_data: {full 100-round JSON}
│       └── completed_at: 2026-01-17 10:12:36
│
└── match_participants
    ├── player_id: 1 → match_id: 1, bot_id: 1, rank: 1
    ├── player_id: 2 → match_id: 1, bot_id: 2, rank: 2
    ├── player_id: 3 → match_id: 1, bot_id: 3, rank: 3
    ├── player_id: 4 → match_id: 1, bot_id: 4, rank: 4
    └── player_id: 5 → match_id: 1, bot_id: 5, rank: 5

Filesystem
├── bots/
│   ├── 1/DeterministicBot_a1b2c3d4.py (Python source)
│   ├── 2/DeterministicBot_e5f6g7h8.py
│   ├── 3/DeterministicBot_i9j0k1l2.py
│   ├── 4/DeterministicBot_m3n4o5p6.py
│   └── 5/DeterministicBot_q7r8s9t0.py
└── logs/
    └── match_1.json (if using filesystem storage - currently not)
```

---

## 8. KEY ENDPOINTS SUMMARY

```
Registration:        POST /auth/register
                     → Saves to users table

Bot Upload:          POST /bots/upload
                     → Saves to bots table + filesystem (bots/ folder)

Lobby Create:        POST /lobbies
                     → Saves to lobbies table

Join Lobby:          POST /lobbies/{id}/join
                     → Saves to lobby_members table

Start Match:         POST /matches?user_id=X
                     → Saves to matches table (status=pending)
                     → Updates lobby status to "started"

Run Match:           POST /matches/{id}/run
                     → Reads from: lobby_members, bots (filesystem)
                     → Executes: GameOrchestrator (100 rounds, 500 actions)
                     → Writes to: matches (log_data), match_participants

View Match Log:      GET /matches/{id}/log
                     → Reads from: matches.log_data column
                     → Returns: Full JSON with 100 rounds

View Match Results:  GET /matches/{id}
                     → Reads from: matches, match_participants
                     → Returns: Match info + participant rankings
```

---

## 9. EXAMPLE COMPLETE FLOW (5 players, 100 rounds)

```
1. User Registration (5 times)
   POST /auth/register → users table (5 rows)

2. Bot Upload (5 times)
   POST /bots/upload → bots table (5 rows) + bots/ folder (5 files)

3. Lobby Creation
   POST /lobbies → lobbies table (1 row)

4. Join Lobby (4 times - creator already in)
   POST /lobbies/1/join → lobby_members table (5 rows)

5. Start Match
   POST /matches → matches table (1 row, status=pending)
                  → lobbies updated (status=started)

6. Run Match
   → Fetch lobby members (5 players)
   → Load bot files (5 files from filesystem)
   → Execute GameOrchestrator:
       * 100 rounds
       * Per round: collect 5 actions simultaneously
       * Total: 500 actions
   → Update matches table:
       * status: pending → completed
       * log_data: full 100-round JSON (includes all 500 actions)
       * completed_at: timestamp
   → Insert into match_participants (5 rows with final rankings)

7. View Results
   GET /matches/1 → Returns match + participant rankings

8. View Full Log
   GET /matches/1/log → Returns full JSON with all 100 rounds + 500 actions
```

---

## 10. DATABASE SCHEMA VISUAL

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ hashed_password │
└─────────────────┘
        ↓ (one-to-many)
┌─────────────────┐      ┌──────────────────────┐
│      bots       │◄─────┤  match_participants  │
├─────────────────┤      ├──────────────────────┤
│ id (PK)         │      │ id (PK)              │
│ user_id (FK)    │      │ match_id (FK)        │
│ name            │      │ player_id (FK)       │
│ file_path       │      │ bot_id (FK)          │
└─────────────────┘      │ rank                 │
                         │ final_economy        │
                         └──────────────────────┘
        ↓ (one-to-many)              ↑ (many-to-one)
┌─────────────────┐                 ┌──────────────┐
│    lobbies      │                 │    matches   │
├─────────────────┤                 ├──────────────┤
│ id (PK)         │                 │ id (PK)      │
│ creator_id (FK) │                 │ lobby_id(FK) │
│ name            │                 │ user_id (FK) │
│ status          │                 │ status       │
└─────────────────┘                 │ log_data     │
        ↑ (one-to-many)             │ completed_at │
        │                           └──────────────┘
┌─────────────────────┐
│  lobby_members      │
├─────────────────────┤
│ id (PK)             │
│ lobby_id (FK)       │
│ user_id (FK)        │
└─────────────────────┘
```

This is the complete data flow from user registration through game execution and log storage!
