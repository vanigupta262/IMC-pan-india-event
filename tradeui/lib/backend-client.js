/**
 * Backend API Client
 * Handles communication with the FastAPI backend server
 */

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

/**
 * Make a request to the FastAPI backend
 */
export async function backendRequest(endpoint, options = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || `Backend error: ${response.status}`);
      }
      
      return data;
    }
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Backend Request Error:', error);
    throw error;
  }
}

// ============ Auth API ============
export const backendAuth = {
  register: (email, username, password) =>
    backendRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),
    
  getUser: (userId) =>
    backendRequest(`/users/${userId}`),
};

// ============ Bot API ============
export const backendBots = {
  upload: async (userId, botName, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(
      `${BACKEND_URL}/bots/upload?user_id=${userId}&bot_name=${encodeURIComponent(botName)}`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload bot');
    }
    
    return response.json();
  },
  
  list: (userId) =>
    backendRequest(`/bots?user_id=${userId}`),
    
  activate: (botId) =>
    backendRequest(`/bots/${botId}/activate`, { method: 'POST' }),
    
  deactivate: (botId) =>
    backendRequest(`/bots/${botId}/deactivate`, { method: 'POST' }),
};

// ============ Lobby API ============
export const backendLobbies = {
  create: (name, creatorId, isPrivate = false, maxPlayers = 2) =>
    backendRequest('/lobbies', {
      method: 'POST',
      body: JSON.stringify({
        name,
        creator_id: creatorId,
        is_private: isPrivate,
        max_players: maxPlayers,
      }),
    }),
    
  list: () =>
    backendRequest('/lobbies'),
    
  get: (lobbyId) =>
    backendRequest(`/lobbies/${lobbyId}`),
    
  join: (lobbyId, userId, inviteCode = null) =>
    backendRequest(`/lobbies/${lobbyId}/join`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        invite_code: inviteCode,
      }),
    }),
};

// ============ Match API ============
export const backendMatches = {
  create: (userId, lobbyId = null, playerIds = null) =>
    backendRequest(`/matches?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        lobby_id: lobbyId,
        player_ids: playerIds,
      }),
    }),
    
  list: (userId = null) =>
    backendRequest(`/matches${userId ? `?user_id=${userId}` : ''}`),
    
  get: (matchId) =>
    backendRequest(`/matches/${matchId}`),
    
  run: (matchId) =>
    backendRequest(`/matches/${matchId}/run`, { method: 'POST' }),
    
  getLog: (matchId) =>
    backendRequest(`/matches/${matchId}/log`),
};

// ============ Health Check ============
export const backendHealth = {
  check: () => backendRequest('/health'),
};
