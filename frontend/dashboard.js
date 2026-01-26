// Trade Simulation Dashboard - JavaScript
const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

// State
let currentUser = null;
let currentLobbyForJoin = null;
let monacoEditor = null;

// Bot Templates
const BOT_TEMPLATES = {
    basic: `import json
import random
import sys

# Basic Random Bot
# Chooses a random valid action each turn

def get_action(state):
    """
    Main entry point for your bot.
    
    Args:
        state: dict containing game state
    Returns:
        dict with type and target
    """
    my_id = state["player_id"]
    n = state["n_players"]
    
    # List of possible actions
    actions = [
        "TRADE", "BUILD_ROAD", "ATTACK", "DESTROY_ROAD",
        "INVEST_DEFENSE", "INVEST_MANUFACTURING"
    ]
    
    # Choose random action
    action = random.choice(actions)
    target = -1
    
    # Select target for interactive actions
    if action in ["TRADE", "ATTACK", "DESTROY_ROAD"]:
        # Pick a random opponent
        opponents = [i for i in range(n) if i != my_id]
        if opponents:
            target = random.choice(opponents)
        else:
            action = "NO_OP"
            
    return {"type": action, "target": target}

# ==========================================
# DO NOT MODIFY THE CODE BELOW THIS LINE
# ==========================================
if __name__ == "__main__":
    try:
        # Read game state from stdin
        input_data = sys.stdin.read()
        state = json.loads(input_data)
        
        # Get action
        action = get_action(state)
        
        # Print action as JSON to stdout
        print(json.dumps(action))
    except Exception as e:
        # If anything goes wrong, print empty JSON or a dummy action
        print(json.dumps({"type": "NO_OP", "target": -1}))
`,

    advanced: `# Smart Aggressive Bot
# Scans for rich opponents with weak defenses and attacks them.
# Otherwise invests in economy.

import json
import sys

def get_action(state):
    my_id = state["player_id"]
    n = state["n_players"]
    my_stats = state["players"][my_id]
    
    # 1. Identify best target (Rich but weak)
    best_target = -1
    max_score = -1
    
    for pid in range(n):
        if pid == my_id: continue
        
        p = state["players"][pid]
        # Score = Economy / (Defense + 1) -> High reward, low risk
        score = p["economy"] / (p["defense"] + 1)
        
        if score > max_score:
            max_score = score
            best_target = pid
            
    # 2. Decide action
    # If we have enough money and a good target, ATTACK
    if my_stats["economy"] > 500 and best_target != -1:
        return {"type": "ATTACK", "target": best_target}
        
    # If our defense is low, boost it
    if my_stats["defense"] < 5:
        return {"type": "INVEST_DEFENSE", "target": -1}
        
    # Otherwise, grow economy
    return {"type": "INVEST_MANUFACTURING", "target": -1}

# ==========================================
# DO NOT MODIFY THE CODE BELOW THIS LINE
# ==========================================
if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        state = json.loads(input_data)
        action = get_action(state)
        print(json.dumps(action))
    except Exception as e:
        print(json.dumps({"type": "NO_OP", "target": -1}))
`

};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    checkAuth();

    // Setup tabs
    setupTabs();

    // Initialize Monaco Editor
    initMonacoEditor();

    // Setup drag and drop
    setupDragDrop();

    // Load initial data
    loadDashboardData();
});

// Authentication
function checkAuth() {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = {
        id: userId,
        username: username,
        email: localStorage.getItem('email'),
        isAdmin: localStorage.getItem('isAdmin') === 'true'
    };

    // Update UI
    document.getElementById('header-username').textContent = username;
    document.getElementById('user-avatar').textContent = username.charAt(0).toUpperCase();

    // Show admin button if admin
    if (currentUser.isAdmin) {
        document.getElementById('admin-btn').classList.remove('hidden');
    }
}

function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-dropdown');
    if (userMenu && !userMenu.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

function showProfile() {
    alert(`Username: ${currentUser.username}\nEmail: ${currentUser.email}\nUser ID: ${currentUser.id}`);
}

// Tabs
function setupTabs() {
    document.querySelectorAll('#main-tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Update active tab
            document.querySelectorAll('#main-tabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active panel
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`${targetTab}-panel`).classList.add('active');

            // Load data for the tab
            loadTabData(targetTab);
        });
    });
}

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

// Monaco Editor
function initMonacoEditor() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        monacoEditor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
            value: BOT_TEMPLATES.basic,
            language: 'python',
            theme: 'vs-dark',
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on'
        });
    });
}

function resetEditor() {
    if (monacoEditor) {
        monacoEditor.setValue(BOT_TEMPLATES.basic);
    }
}

function loadTemplate(type) {
    if (monacoEditor && BOT_TEMPLATES[type]) {
        monacoEditor.setValue(BOT_TEMPLATES[type]);
    }
}

// Bot Upload
async function saveAndUploadBot() {
    if (!currentUser) {
        alert('Please log in first');
        return;
    }

    const botName = document.getElementById('bot-name-input').value || 'My Trading Bot';
    const code = monacoEditor ? monacoEditor.getValue() : '';

    if (!code.trim()) {
        alert('Please write some code first');
        return;
    }

    try {
        // Create a blob from the code
        const blob = new Blob([code], { type: 'text/x-python' });
        const file = new File([blob], `${botName}.py`, { type: 'text/x-python' });

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/bots/upload?user_id=${currentUser.id}&bot_name=${encodeURIComponent(botName)}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Bot "${botName}" uploaded successfully!`);
            loadBots();
            document.getElementById('stat-my-bots').textContent =
                parseInt(document.getElementById('stat-my-bots').textContent || '0') + 1;
        } else {
            alert(data.detail || 'Upload failed');
        }
    } catch (error) {
        alert('Failed to upload bot. Is the backend running?');
        console.error(error);
    }
}

async function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const botName = document.getElementById('upload-bot-name').value || file.name.replace('.py', '');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE}/bots/upload?user_id=${currentUser.id}&bot_name=${encodeURIComponent(botName)}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Bot "${botName}" uploaded successfully!`);
            loadBots();
            input.value = '';
            document.getElementById('upload-bot-name').value = '';
        } else {
            alert(data.detail || 'Upload failed');
        }
    } catch (error) {
        alert('Failed to upload bot');
        console.error(error);
    }
}

function setupDragDrop() {
    const uploadArea = document.getElementById('upload-area');
    if (!uploadArea) return;

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.py')) {
            document.getElementById('bot-file-input').files = e.dataTransfer.files;
            handleFileUpload(document.getElementById('bot-file-input'));
        } else {
            alert('Please upload a .py file');
        }
    });
}

// Load Bots
async function loadBots() {
    if (!currentUser) return;

    const container = document.getElementById('bots-list');
    container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading bots...</p></div>';

    try {
        const response = await fetch(`${API_BASE}/bots?user_id=${currentUser.id}`);
        const bots = await response.json();

        if (!Array.isArray(bots) || bots.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                    <div class="empty-state-title">No bots yet</div>
                    <div class="empty-state-description">Upload your first bot using the editor or file upload</div>
                </div>
            `;
            return;
        }

        container.innerHTML = bots.map(bot => `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">
                        ${bot.name}
                        <span class="badge ${bot.is_active ? 'badge-success' : 'badge-gray'}" style="margin-left: 0.5rem;">
                            ${bot.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div class="list-item-subtitle">
                        Version ${bot.version} • Uploaded ${new Date(bot.uploaded_at).toLocaleDateString()}
                    </div>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-ghost btn-sm" onclick="toggleBot(${bot.id}, ${!bot.is_active})">
                        ${bot.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `).join('');

        document.getElementById('stat-my-bots').textContent = bots.length;
    } catch (error) {
        container.innerHTML = '<div class="alert alert-error">Failed to load bots</div>';
        console.error(error);
    }
}

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
    const container = document.getElementById('lobbies-list');
    container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading lobbies...</p></div>';

    try {
        const response = await fetch(`${API_BASE}/lobbies`);
        const lobbies = await response.json();

        if (!Array.isArray(lobbies) || lobbies.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <div class="empty-state-title">No lobbies available</div>
                    <div class="empty-state-description">Create a new lobby to start competing</div>
                </div>
            `;
            return;
        }

        container.innerHTML = lobbies.map(lobby => `
            <div class="lobby-card ${lobby.is_private ? 'private' : ''}">
                <div class="lobby-header">
                    <div class="lobby-name">
                        ${lobby.name}
                        ${lobby.is_private ?
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>' :
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
            }
                    </div>
                    <span class="badge badge-${lobby.status === 'open' ? 'success' : 'gray'}">${lobby.status}</span>
                </div>
                <div class="lobby-meta">
                    Players: ${lobby.member_count || 0}/${lobby.max_players || 2}
                </div>
                ${lobby.status === 'open' ? `
                    <div class="flex gap-2 mt-3">
                        <button class="btn btn-ghost btn-sm" onclick="openJoinModal(${lobby.id}, '${lobby.name}', ${lobby.is_private})">
                            Join
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="startMatch(${lobby.id})">
                            Start Match
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="alert alert-error">Failed to load lobbies</div>';
        console.error(error);
    }
}

// Create Lobby
async function createLobby(e) {
    e.preventDefault();

    if (!currentUser) {
        alert('Please log in first');
        return;
    }

    const lobbyName = document.getElementById('lobby-name-input').value;
    const isPrivate = document.getElementById('lobby-private-check').checked;
    const maxPlayers = parseInt(document.getElementById('lobby-max-players').value);

    try {
        const response = await fetch(`${API_BASE}/lobbies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: lobbyName,
                creator_id: parseInt(currentUser.id),
                is_private: isPrivate,
                max_players: maxPlayers
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('lobby-name-input').value = '';
            document.getElementById('lobby-private-check').checked = false;

            if (isPrivate && data.invite_code) {
                document.getElementById('invite-code-display').textContent = data.invite_code;
                document.getElementById('lobby-created-info').classList.remove('hidden');
            }

            loadLobbies();
            alert(`Lobby "${lobbyName}" created successfully!`);
        } else {
            alert(data.detail || 'Failed to create lobby');
        }
    } catch (error) {
        alert('Failed to create lobby');
        console.error(error);
    }
}

function copyInviteCode() {
    const code = document.getElementById('invite-code-display').textContent;
    navigator.clipboard.writeText(code);
    alert('Invite code copied!');
}

// Join Lobby
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

async function confirmJoinLobby() {
    const inviteCode = document.getElementById('invite-code-input').value;
    if (!inviteCode) {
        alert('Please enter the invite code');
        return;
    }
    joinLobbyWithCode(currentLobbyForJoin, inviteCode);
}

async function joinLobby(lobbyId) {
    if (!currentUser) {
        alert('Please log in first');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/lobbies/${lobbyId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: parseInt(currentUser.id) })
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

async function joinLobbyWithCode(lobbyId, inviteCode) {
    if (!currentUser) {
        alert('Please log in first');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/lobbies/${lobbyId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: parseInt(currentUser.id),
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
    if (!currentUser) {
        alert('Please log in first');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/matches?user_id=${currentUser.id}`, {
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
    const container = document.getElementById('matches-list');
    container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading matches...</p></div>';

    try {
        const response = await fetch(`${API_BASE}/matches`);
        const matches = await response.json();

        if (!Array.isArray(matches) || matches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <div class="empty-state-title">No matches yet</div>
                    <div class="empty-state-description">Join a lobby and start a match to compete</div>
                </div>
            `;
            return;
        }

        container.innerHTML = matches.map(match => {
            const startedAt = match.started_at || match.created_at || match.updated_at || new Date().toISOString();
            const statusBadge = {
                'pending': 'badge-warning',
                'running': 'badge-primary',
                'completed': 'badge-success',
                'failed': 'badge-danger'
            }[match.status] || 'badge-gray';

            return `
            <div class="match-card">
                <div class="match-header">
                    <div>
                        <span class="font-semibold">Match #${match.id}</span>
                        <span class="badge ${statusBadge}" style="margin-left: 0.5rem;">${match.status}</span>
                    </div>
                    <span class="text-sm text-gray-500">${new Date(startedAt).toLocaleString()}</span>
                </div>
                <div class="flex gap-2 mt-2">
                    ${match.status === 'pending' ? `
                        <button class="btn btn-primary btn-sm" onclick="runMatch(${match.id})">Run Match</button>
                    ` : ''}
                    <button class="btn btn-ghost btn-sm" onclick="viewMatchLog(${match.id})" ${match.status !== 'completed' ? 'disabled' : ''}>
                        View Log
                    </button>
                    ${match.status === 'completed' ? `
                        <button class="btn btn-primary btn-sm" onclick="viewResults(${match.id})">Results</button>
                    ` : ''}
                </div>
            </div>
        `}).join('');

        document.getElementById('stat-my-matches').textContent = matches.length;
    } catch (error) {
        container.innerHTML = '<div class="alert alert-error">Failed to load matches</div>';
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
        const logContent = JSON.stringify(log, null, 2);

        document.getElementById('log-modal-title').textContent = `Match #${matchId} Log`;
        document.getElementById('log-content').textContent = logContent;
        document.getElementById('log-modal').classList.remove('hidden');
    } catch (error) {
        alert('Failed to load match log');
        console.error(error);
    }
}

function closeLogModal() {
    document.getElementById('log-modal').classList.add('hidden');
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
            .map(p => `${p.rank}. ${p.username || 'Player ' + p.player_id}: ${p.final_economy} economy`)
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
        const healthResponse = await fetch(`${API_BASE}/health`);
        if (healthResponse.ok) {
            document.getElementById('backend-status-icon').style.background = 'var(--green-500)';
            document.getElementById('backend-status-text').textContent = 'Running';
            document.getElementById('db-status-icon').style.background = 'var(--green-500)';
            document.getElementById('db-status-text').textContent = 'Connected';
            document.getElementById('engine-status-icon').style.background = 'var(--green-500)';
            document.getElementById('engine-status-text').textContent = 'Available';
        }

        // Update stats with placeholders (you'd need to add these endpoints to backend)
        document.getElementById('total-users').textContent = currentUser ? '1' : '0';
        document.getElementById('total-bots').textContent = document.getElementById('stat-my-bots').textContent || '0';
        document.getElementById('total-matches').textContent = document.getElementById('stat-my-matches').textContent || '0';
        document.getElementById('active-lobbies').textContent = '0';

    } catch (error) {
        document.getElementById('backend-status-icon').style.background = 'var(--red-500)';
        document.getElementById('backend-status-text').textContent = 'Not running';
        document.getElementById('db-status-icon').style.background = 'var(--red-500)';
        document.getElementById('db-status-text').textContent = 'Not available';
        document.getElementById('engine-status-icon').style.background = 'var(--red-500)';
        document.getElementById('engine-status-text').textContent = 'Not available';
    }
}

// Load all dashboard data
function loadDashboardData() {
    loadBots();
    loadStats();
}

// Close modals on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.add('hidden');
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
});
