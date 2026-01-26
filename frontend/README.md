# Frontend - IGTS × IMC Event 2

Web UI for the game platform, built with vanilla HTML/CSS/JavaScript.

## 🚀 Quick Start

### 1. Start the Backend

```bash
# From project root
python3 backend/app.py
```

### 2. Start the Frontend

```bash
# From project root
python3 frontend/server.py
```

### 3. Open in Browser

- **Legacy UI**: http://localhost:3000
- **Modern UI**: http://localhost:3000/modern/

---

## 📂 UI Versions

### Legacy UI (Root)

The original single-page application with tabs.

- URL: `http://localhost:3000`
- Files: `index.html`, `app.js`

### Modern UI (modern/)

New multi-page application with professional design.

- URL: `http://localhost:3000/modern/`
- Features:
  - Landing page with hero section
  - Separate login/signup pages
  - Dashboard with Monaco code editor
  - Modern card-based design

---

## 📋 Features

### ✅ Implemented

- **User Registration**: Create accounts with email/username/password
- **Bot Upload**: Upload Python bot files (.py)
- **Lobby Management**: Create and join game lobbies (public/private)
- **Match Viewing**: View match history and logs
- **Statistics Dashboard**: Platform stats and system health

### 🎨 UI Sections

1. **Register**: Create new user accounts
2. **My Bots**: Upload and manage your bots
3. **Lobbies**: Create/join lobbies, start matches
4. **Matches**: View match history and results
5. **Stats**: Platform statistics and system status

---

## 🔧 Technical Details

### Architecture

```
frontend/
├── index.html      # Legacy UI (single-page app)
├── app.js          # Legacy UI logic
├── server.py       # Python HTTP server
├── README.md       # This file
└── modern/         # Modern UI folder
    ├── index.html      # Landing page
    ├── login.html      # Login page
    ├── signup.html     # Registration page
    ├── dashboard.html  # Main dashboard
    ├── dashboard.js    # Dashboard logic
    └── styles.css      # CSS design system
```

### API Integration

- Base URL: `http://localhost:8000`
- Uses `fetch()` for all API calls
- LocalStorage for user session persistence

### Styling

- Pure CSS (no frameworks)
- Responsive design
- Gradient purple theme
- Card-based layout

---

## 🎯 Usage Flow

1. **Register**: Create an account in the Register tab
2. **Upload Bot**: Go to "My Bots", upload a bot from `bots/` folder
3. **Create Lobby**: Go to "Lobbies", create a new lobby
4. **Start Match**: Once lobby has enough players, click "Start Match"
5. **View Results**: Check "Matches" tab for results and logs

---

## 🐛 Troubleshooting

### Backend not responding?

```bash
# Make sure backend is running
python3 backend/app.py

# Check if backend is accessible
curl http://localhost:8000/health
```

### Port 3000 already in use?

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or edit FRONTEND_PORT in server.py
```

### CORS errors?

The server includes CORS headers. If you still see errors:

- Make sure both frontend and backend are running
- Check browser console for specific errors
- Verify API_BASE in app.js matches backend URL

---

## 🔐 Security Notes

**⚠️ This is a development UI**

- No authentication tokens (uses localStorage)
- No password hashing on frontend
- No input sanitization
- Not suitable for production without hardening

---

## 📦 Dependencies

**Zero npm packages required!**

- Pure HTML/CSS/JavaScript
- Python 3 standard library (http.server)

---

## 🚀 Next Steps

### To make production-ready:

1. Add JWT authentication
2. Implement proper session management
3. Add input validation and sanitization
4. Use React/Vue for better state management
5. Add real-time match updates (WebSockets)
6. Deploy with nginx/Apache

### Enhancements:

- Live match viewer with round-by-round replay
- Bot code editor with syntax highlighting
- Tournament bracket visualization
- Leaderboard with rankings
- Player profiles and statistics

---

## 📝 Development

### Adding new features:

1. Add HTML in `index.html` (new panel or form)
2. Add logic in `app.js` (event handlers, API calls)
3. Update backend if new endpoints needed
4. Test locally before committing

### Testing:

```bash
# Start both servers
python3 backend/app.py &
python3 frontend/server.py

# Open browser
open http://localhost:3000

# Test workflow:
# 1. Register user
# 2. Upload bot
# 3. Create lobby
# 4. Start match
# 5. View results
```

---

## 🎓 API Reference

See backend documentation for complete API reference:

- **Backend README**: `backend/README.md`
- **Swagger Docs**: http://localhost:8000/docs
- **Bot API Spec**: `docs/BOT_API.md`

---

## ✅ Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

(Any modern browser with ES6+ support)
