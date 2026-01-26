// IGTS × IMC Event 2 - Frontend Application
// Local Development UI

const API_BASE = 'http://localhost:8000';
let currentUser = null;
let currentLobbyForJoin = null;

// Modal functions
function openJoinModal(lobbyId, lobbyName, isPrivate) {
    if (isPrivate) {
        currentLobbyForJoin = lobbyId;
        document.getElementById('modal-lobby-name').textContent = `Joining: ${lobbyName}`;
        document.getElementById('invite-code-input').value = '';
        document.getElementById('join-modal').classList.remove('hidden');
    } else {
        joinLobby(lobbyId);
    }
}

function closeJoinModal() {
    document.getElementById('join-modal').classList.add('hidden');
    currentLobbyForJoin = null;
}

function confirmJoinLobby() {
    const inviteCode = document.getElementById('invite-code-input').value;
    if (!inviteCode) {
        alert('Please enter the invite code');
        return;
    }
    joinLobbyWithCode(currentLobbyForJoin, inviteCode);
}

// Initialize all event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in from localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        showUserProfile(savedUsername);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('join-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeJoinModal();
            }
        });
    }

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Update active tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active panel
            document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`${targetTab}-panel`).classList.add('active');

            // Load data for the tab
            loadTabData(targetTab);
        });
    });

    // Register Form
    document.getElementById('register-form').addEventListener('submit', registerHandler);

    // Bot Upload Form
    document.getElementById('bot-upload-form').addEventListener('submit', botUploadHandler);

    // Lobby Creation Form
    document.getElementById('create-lobby-form').addEventListener('submit', createLobbyHandler);
});

// Load data when switching to a tab
function loadTabData(tab) {
    switch (tab) {
        case 'bots':
            loadBots();
            break;
        case 'lobbies':
            loadLobbies();
            break;
        case 'matches':
            loadMatches();
            break;
        case 'stats':
            loadStats();
            break;
    }
}

// Register Form Handler
async function registerHandler(e) {
    e.preventDefault();

    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('register-message', `Welcome ${username}! Account created successfully.`, 'success');
            currentUser = data;
            e.target.reset();

            // Store user ID for later use
            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', username);

            // Show user profile in header
            showUserProfile(username);
        } else {
            showMessage('register-message', data.detail || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('register-message', 'Failed to connect to backend. Is the server running?', 'error');
        console.error(error);
    }
}

// Bot Upload Form Handler
async function botUploadHandler(e) {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
        showMessage('bot-message', 'Please register first!', 'error');
        return;
    }

    const botName = document.getElementById('bot-name').value;
    const botFile = document.getElementById('bot-file').files[0];

    if (!botFile) {
        showMessage('bot-message', 'Please select a bot file', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', botFile);

    try {
        const response = await fetch(`${API_BASE}/bots/upload?user_id=${userId}&bot_name=${encodeURIComponent(botName)}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('bot-message', `Bot "${botName}" uploaded successfully!`, 'success');
            document.getElementById('bot-upload-form').reset();
            loadBots();
        } else {
            showMessage('bot-message', data.detail || 'Upload failed', 'error');
        }
    } catch (error) {
        showMessage('bot-message', 'Failed to upload bot. Check backend connection.', 'error');
        console.error(error);
    }
}

// Create Lobby Form Handler
async function createLobbyHandler(e) {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
        showMessage('lobby-message', 'Please register first!', 'error');
        return;
    }

    const lobbyName = document.getElementById('lobby-name').value;
    const isPrivate = document.getElementById('lobby-private').checked;

    try {
        const response = await fetch(`${API_BASE}/lobbies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: lobbyName,
                creator_id: parseInt(userId),
                is_private: isPrivate,
                max_players: 6  // Tournament standard
            })
        });

        const data = await response.json();

        if (response.ok) {
            let message = `Lobby "${lobbyName}" created successfully!`;
            if (isPrivate) {
                message += ` Invite code: <strong>${data.invite_code}</strong>`;
            }
            showMessage('lobby-message', message, 'success');
            document.getElementById('create-lobby-form').reset();
            loadLobbies();
        } else {
            showMessage('lobby-message', data.detail || 'Failed to create lobby', 'error');
        }
    } catch (error) {
        showMessage('lobby-message', 'Failed to create lobby. Check backend connection.', 'error');
        console.error(error);
    }
}

// Load Bots
async function loadBots() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        document.getElementById('bot-list').innerHTML = '<div class="alert alert-info">Please register first to upload bots.</div>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bots?user_id=${userId}`);
        const bots = await response.json();

        if (bots.length === 0) {
            document.getElementById('bot-list').innerHTML = '<div class="alert alert-info">No bots uploaded yet. Upload your first bot above!</div>';
            return;
        }

        document.getElementById('bot-list').innerHTML = bots.map(bot => `
            <div class="bot-item ${bot.is_active ? '' : 'bot-inactive'}">
                <div class="bot-info">
                    <div class="lobby-name">${bot.name}</div>
                    <div class="lobby-status">
                        Version: ${bot.version} | 
                        Uploaded: ${new Date(bot.uploaded_at).toLocaleDateString()}
                        <span class="status-badge ${bot.is_active ? 'status-active' : 'status-completed'}">
                            ${bot.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                <div class="button-group">
                    <button class="secondary" onclick="toggleBot(${bot.id}, ${!bot.is_active})">
                        ${bot.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('bot-list').innerHTML = '<div class="alert alert-error">Failed to load bots</div>';
        console.error(error);
    }
}

// Toggle Bot Status
async function toggleBot(botId, activate) {
    try {
        const response = await fetch(`${API_BASE}/bots/${botId}/${activate ? 'activate' : 'deactivate'}`, {
            method: 'POST'
        });

        if (response.ok) {
            loadBots();
        }
    } catch (error) {
        console.error(error);
    }
}

// Load Lobbies
async function loadLobbies() {
    try {
        const response = await fetch(`${API_BASE}/lobbies`);
        const lobbies = await response.json();

        if (lobbies.length === 0) {
            document.getElementById('lobby-list').innerHTML = '<div class="alert alert-info">No lobbies available. Create one above!</div>';
            return;
        }

        document.getElementById('lobby-list').innerHTML = lobbies.map(lobby => `
            <div class="lobby-item">
                <div class="lobby-info">
                    <div class="lobby-name">
                        ${lobby.name}
                        ${lobby.is_private ? '🔒' : '🌐'}
                    </div>
                    <div class="lobby-status">
                        Creator: ${lobby.creator_id} | 
                        Members: ${lobby.member_count || 0}/${lobby.max_players || 2}
                        <span class="status-badge status-${lobby.status}">
                            ${lobby.status}
                        </span>
                    </div>
                </div>
                <div class="button-group">
                    ${lobby.status === 'open' ? `
                        <button class="secondary" onclick="openJoinModal(${lobby.id}, '${lobby.name}', ${lobby.is_private})">Join</button>
                        <button class="primary" onclick="startMatch(${lobby.id})">Start Match</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('lobby-list').innerHTML = '<div class="alert alert-error">Failed to load lobbies</div>';
        console.error(error);
    }
}

// Join Lobby (public)
async function joinLobby(lobbyId) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please register first!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/lobbies/${lobbyId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: parseInt(userId) })
        });

        if (response.ok) {
            alert('Joined lobby successfully!');
            loadLobbies();
        } else {
            const data = await response.json();
            alert(data.detail || 'Failed to join lobby');
        }
    } catch (error) {
        alert('Failed to join lobby');
        console.error(error);
    }
}

// Join Lobby with Invite Code (private)
async function joinLobbyWithCode(lobbyId, inviteCode) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please register first!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/lobbies/${lobbyId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: parseInt(userId),
                invite_code: inviteCode
            })
        });

        if (response.ok) {
            alert('Joined lobby successfully!');
            closeJoinModal();
            loadLobbies();
        } else {
            const data = await response.json();
            alert(data.detail || 'Failed to join lobby. Check invite code.');
        }
    } catch (error) {
        alert('Failed to join lobby');
        console.error(error);
    }
}

// Start Match
async function startMatch(lobbyId) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please register first!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/matches?user_id=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lobby_id: lobbyId })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Match ${data.id} started! Check the Matches tab to see results.`);
            loadLobbies();

            // Switch to matches tab
            document.querySelector('.tab[data-tab="matches"]').click();
        } else {
            alert(data.detail || 'Failed to start match');
        }
    } catch (error) {
        alert('Failed to start match');
        console.error(error);
    }
}

// Load Matches
async function loadMatches() {
    try {
        const response = await fetch(`${API_BASE}/matches`);
        const matches = await response.json();

        if (!Array.isArray(matches) || matches.length === 0) {
            document.getElementById('match-list').innerHTML = '<div class="alert alert-info">No matches yet. Create or join a lobby to start playing!</div>';
            return;
        }

        document.getElementById('match-list').innerHTML = matches.map(match => {
            const startedAt = match.started_at || match.created_at || match.updated_at || new Date().toISOString();
            return `
            <div class="match-item">
                <div class="match-info">
                    <div class="match-id">Match #${match.id}</div>
                    <div class="match-status">
                        Started: ${new Date(startedAt).toLocaleString()}
                        <span class="status-badge status-${match.status}">
                            ${match.status}
                        </span>
                    </div>
                </div>
                <div class="button-group">
                    ${match.status === 'pending' ? `
                        <button class="primary" onclick="runMatch(${match.id})">Run Match</button>
                    ` : ''}
                    <button class="secondary" onclick="viewMatchLog(${match.id})" ${match.status !== 'completed' ? 'disabled title="Log available after match completes"' : ''}>View Log</button>
                    ${match.status === 'completed' ? `
                        <button class="primary" onclick="viewResults(${match.id})">Results</button>
                    ` : ''}
                </div>
            </div>`;
        }).join('');
    } catch (error) {
        document.getElementById('match-list').innerHTML = '<div class="alert alert-error">Failed to load matches</div>';
        console.error(error);
    }
}

// Run Match
async function runMatch(matchId) {
    try {
        const response = await fetch(`${API_BASE}/matches/${matchId}/run`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Match ${matchId} executed! Status: ${data.status}`);
            loadMatches();
        } else {
            alert(data.detail || 'Failed to run match');
        }
    } catch (error) {
        alert('Failed to run match');
        console.error(error);
    }
}

// View Match Log
async function viewMatchLog(matchId) {
    try {
        const response = await fetch(`${API_BASE}/matches/${matchId}/log`);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            alert(err.detail || 'Match log not available yet.');
            return;
        }

        const log = await response.json();

        // Create a modal to show the log instead of opening a window
        const logContent = JSON.stringify(log, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Remove any existing log modal
        const existingModal = document.getElementById('log-modal');
        if (existingModal) existingModal.remove();

        // Create modal HTML
        const modal = document.createElement('div');
        modal.id = 'log-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div style="
                background: #1e1e1e;
                color: #d4d4d4;
                padding: 20px;
                border-radius: 8px;
                width: 90%;
                height: 90%;
                overflow: auto;
                font-family: monospace;
                font-size: 12px;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 10px;">
                    <h2 style="margin: 0;">Match ${matchId} Log</h2>
                    <button onclick="document.getElementById('log-modal').remove()" style="
                        background: #ff6b6b;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Close</button>
                </div>
                <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${logContent}</pre>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

    } catch (error) {
        alert('Failed to load match log');
        console.error(error);
    }
}

// View Results
async function viewResults(matchId) {
    try {
        const response = await fetch(`${API_BASE}/matches/${matchId}`);
        const match = await response.json();

        if (!match.participants || match.participants.length === 0) {
            alert('No results available yet.');
            return;
        }

        const results = match.participants
            .sort((a, b) => a.rank - b.rank)
            .map(p => `${p.rank}. Player ${p.player_id}: ${p.final_economy} economy`)
            .join('\n');

        alert(`Match ${matchId} Results:\n\n${results}`);
    } catch (error) {
        alert('Failed to load results');
        console.error(error);
    }
}

// Load Stats
async function loadStats() {
    try {
        // In a real implementation, these would be separate API endpoints
        // For now, we'll use placeholder data and check backend health

        const healthResponse = await fetch(`${API_BASE}/health`);
        if (healthResponse.ok) {
            document.getElementById('backend-status').textContent = '✅ Running';
            document.getElementById('db-status').textContent = '✅ Connected';
            document.getElementById('engine-status').textContent = '✅ Available';
        }

        // Load some basic counts (you'd need to add these endpoints to backend)
        document.getElementById('stat-users').textContent = localStorage.getItem('userId') || '0';
        document.getElementById('stat-bots').textContent = '0';
        document.getElementById('stat-matches').textContent = '0';
        document.getElementById('stat-lobbies').textContent = '0';

    } catch (error) {
        document.getElementById('backend-status').textContent = '❌ Not running';
        document.getElementById('db-status').textContent = '❌ Not available';
        document.getElementById('engine-status').textContent = '❌ Not available';
    }
}

// Helper function to show messages
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        element.innerHTML = '';
    }, 5000);
}

// Show/hide user profile in header
function showUserProfile(username) {
    const profileEl = document.getElementById('user-profile');
    const usernameEl = document.getElementById('logged-username');
    if (profileEl && usernameEl) {
        usernameEl.textContent = username;
        profileEl.classList.remove('hidden');
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const username = localStorage.getItem('username');
    if (username) {
        showMessage('register-message', `Welcome back, ${username}!`, 'success');
    }

    // Load stats on startup
    loadStats();
});
