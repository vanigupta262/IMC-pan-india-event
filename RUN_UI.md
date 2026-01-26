# 🎮 Running the UI Locally

## Quick Start (2 Commands)

### Terminal 1: Backend
```bash
cd /Users/vanigupta/Desktop/igts2/IMC-pan-india-event
source .venv/bin/activate
python3 backend/app.py
```

### Terminal 2: Frontend
```bash
cd /Users/vanigupta/Desktop/igts2/IMC-pan-india-event
source .venv/bin/activate
python3 frontend/server.py
```

### Terminal 3: Open Browser
```bash
open http://localhost:3000
```

---

## ✅ What's Running

| Service | URL | Status |
|---------|-----|--------|
| **Frontend UI** | http://localhost:3000 | ✅ Running |
| **Backend API** | http://localhost:8000 | ✅ Running |
| **API Docs** | http://localhost:8000/docs | ✅ Available |

---

## 🎯 Test Workflow

1. **Open UI** → http://localhost:3000
2. **Register** → Create an account (Register tab)
3. **Upload Bot** → Upload a bot file (My Bots tab)
4. **Create Lobby** → Create a new game lobby (Lobbies tab)
5. **Start Match** → Start a match when ready
6. **View Results** → Check Matches tab for results

---

## 📝 Features Available

### Register Tab
- ✅ Create new user account
- ✅ Email/username/password
- ✅ Quick start guide

### My Bots Tab
- ✅ Upload Python bot files
- ✅ List your bots
- ✅ Activate/deactivate bots

### Lobbies Tab
- ✅ Create public/private lobbies
- ✅ View available lobbies
- ✅ Join lobbies
- ✅ Start matches

### Matches Tab
- ✅ View your match history
- ✅ Check match status
- ✅ View match logs (JSON)
- ✅ See final results

### Stats Tab
- ✅ Platform statistics
- ✅ System health check
- ✅ Backend/Database/Engine status

---

## 🔧 Sample Bots to Upload

You can upload any of these sample bots to test:

```bash
# Random bot
bots/random_bot.py

# Greedy bot (deterministic strategy)
bots/greedy_bot.py
```

---

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
lsof -ti:3000 | xargs kill -9
```

### Port 8000 already in use?
```bash
lsof -ti:8000 | xargs kill -9
```

### Backend won't start?
```bash
# Make sure virtual environment is active
source .venv/bin/activate

# Install missing dependencies
pip install -r backend/requirements.txt

# Try running again
python3 backend/app.py
```

### Can't access UI?
```bash
# Check if frontend is running
curl http://localhost:3000

# Check if backend is accessible
curl http://localhost:8000/health
```

### CORS errors in browser?
- Make sure both services are running
- Check browser console for exact error message
- Refresh the page
- Check if API_BASE in app.js matches backend URL

---

## 📊 API Endpoints

### Auth
- `POST /auth/register` - Register new user

### Bots
- `GET /bots?user_id=1` - Get user's bots
- `POST /bots/upload` - Upload a bot
- `POST /bots/{id}/activate` - Activate bot
- `POST /bots/{id}/deactivate` - Deactivate bot

### Lobbies
- `GET /lobbies` - List all lobbies
- `POST /lobbies` - Create lobby
- `POST /lobbies/{id}/join` - Join lobby
- `POST /matches` - Start match

### Matches
- `GET /matches?user_id=1` - Get user's matches
- `GET /matches/{id}` - Get match details
- `GET /matches/{id}/log` - Get match log

### Health
- `GET /health` - Check backend status

---

## 🎓 Full API Documentation

Once the backend is running, visit:
**http://localhost:8000/docs**

This gives you interactive Swagger documentation for all endpoints.

---

## 💡 Tips & Tricks

- **Localhost Only**: Both services only accessible on your machine
- **Local Database**: SQLite database at `igts.db` (auto-created)
- **No Authentication**: Development UI doesn't require tokens
- **Live Reload**: Modify `frontend/app.js` or `frontend/index.html` and refresh browser
- **Backend Logs**: Check `/tmp/backend.log` for server errors
- **Frontend Logs**: Check browser console (F12) for JavaScript errors

---

## 🚀 Next Steps

### To add more features:
1. Modify `frontend/index.html` (UI structure)
2. Update `frontend/app.js` (frontend logic)
3. Add endpoints to `backend/app.py` (if needed)
4. Refresh browser to see changes

### To test matches:
```bash
# Run a match directly (without UI)
python3 local_match_runner.py

# View the log
cat logs/match_1.json | python3 -m json.tool
```

---

## ❌ What's NOT Available Yet

- Real-time match updates (polling only)
- Live spectator mode
- Player profiles
- Leaderboards
- Tournament bracket
- Admin controls
- User authentication tokens

These can be added in future iterations!

---

## 📞 Support

If something isn't working:
1. Check the error messages in browser console (F12)
2. Review `/tmp/backend.log` for server errors
3. Make sure both servers are running (`ps aux | grep python3`)
4. Verify ports 3000 and 8000 are not in use
5. Check `SYSTEM_OVERVIEW.md` for architecture details

Happy gaming! 🎮
