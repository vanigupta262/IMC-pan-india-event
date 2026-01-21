# Backend API & Match Orchestration

This directory contains the FastAPI backend and match orchestrator for the IGTS IMC Event platform.

## Files

- `app.py`: FastAPI application with SQLAlchemy models for users, bots, lobbies, and matches.
- `match_runner.py`: Orchestrator that coordinates bot execution, engine resolution, and logging.
- `requirements.txt`: Python dependencies.

## Quick Start

### 1. Install dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Run the API server
```bash
cd backend
python3 app.py
```

The API will be available at `http://localhost:8000`.
Swagger docs: `http://localhost:8000/docs`

### 3. Run a test match locally
```bash
cd backend
python3 match_runner.py
```

This will run a 3-round match with sample bots and save logs to `logs/match_1.json`.

## API Endpoints

### Authentication
- `POST /auth/register` — Register a new team
- `GET /users/{user_id}` — Get user details

### Bot Management
- `POST /bots/upload` — Upload a bot file
- `GET /bots/{user_id}` — List all bots for a user

### Lobbies
- `POST /lobbies` — Create a new lobby
- `GET /lobbies/{lobby_id}` — Get lobby details
- `POST /lobbies/join` — Join a lobby with invite code

### Matches
- `POST /matches` — Create a match from a lobby
- `GET /matches/{match_id}` — Get match status
- `GET /matches/{match_id}/log` — Download match log (JSON)

## Data Models

### User
- email, username, hashed_password
- Relationships: bots, lobbies, matches

### Bot
- name, version, file_path, is_active
- Relationships: owner (User), match_participants

### Lobby
- name, is_private, invite_code, max_players, status
- Relationships: creator, members, match

### Match
- status (pending/running/completed), log_file_path, final_result
- Relationships: lobby, user, participants

## Deployment Notes

- Database: Currently uses SQLite for local development. For production, use PostgreSQL:
  ```bash
  export DATABASE_URL="postgresql://user:password@localhost/igts"
  ```
- Bot storage: Currently saves to local disk (`bots/{user_id}/`). For production, use S3 or similar.
- Match logs: Saved to `logs/` directory. For production, use object storage.
- Authentication: Currently stores passwords in plaintext. For production, use bcrypt + JWT tokens.

## Integration with Engine & Sandbox

The match runner (`match_runner.py`) ties everything together:
1. Loads snapshot state for each player
2. Runs each bot (locally or in sandbox)
3. Collects action matrix
4. Invokes the C++ engine
5. Logs round data for replay

To use the sandbox for bot execution, update `run_bot()` in `match_runner.py` to call `sandbox_runner.py`:
```python
from sandbox.sandbox_runner import run_bot_in_sandbox

response = run_bot_in_sandbox(bot_path, snapshot, timeout=2.0)
```

## Next Steps

- [ ] Implement password hashing (bcrypt) and JWT authentication
- [ ] Add tournament seeding and pool scheduling (rulebook section 13)
- [ ] Integrate match runner as a background task (Celery or similar)
- [ ] Add match result persistence and leaderboards
- [ ] Build web UI dashboard (frontend)
