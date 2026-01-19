const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function apiRequest(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

export const authApi = {
  login: (email, password) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  signup: (username, email, password) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),
  
  logout: () =>
    apiRequest('/auth/logout', { method: 'POST' }),
  
  getProfile: () =>
    apiRequest('/auth/profile'),
};

export const submissionsApi = {
  getAll: () => apiRequest('/submissions'),
  
  create: (code, language = 'cpp') =>
    apiRequest('/submissions', {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    }),
  
  // Upload a bot file (Python)
  uploadFile: async (file, name) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  },
  
  activate: (submissionId) =>
    apiRequest(`/submissions/${submissionId}/activate`, {
      method: 'PUT',
    }),
  
  getById: (submissionId) =>
    apiRequest(`/submissions/${submissionId}`),
};

export const matchesApi = {
  getAll: (userId) => 
    apiRequest(`/matches${userId ? `?userId=${userId}` : ''}`),
  
  getById: (matchId) =>
    apiRequest(`/matches/${matchId}`),
  
  create: (lobbyId, userId) =>
    apiRequest('/matches', {
      method: 'POST',
      body: JSON.stringify({ lobbyId, userId }),
    }),
  
  run: (matchId) =>
    apiRequest(`/matches/${matchId}`, {
      method: 'POST',
    }),
  
  getLog: (matchId) =>
    apiRequest(`/matches/${matchId}/log`),
};

export const lobbiesApi = {
  getAll: () => apiRequest('/admin/lobbies'),
  
  join: (lobbyId, userId, inviteCode) =>
    apiRequest(`/lobbies/${lobbyId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId, inviteCode }),
    }),
};

export const healthApi = {
  check: () => apiRequest('/health'),
};

export const adminApi = {
  getUsers: () => apiRequest('/admin/users'),
  
  getLobbies: () => apiRequest('/admin/lobbies'),
  
  distributeUsers: () =>
    apiRequest('/admin/lobbies/distribute', {
      method: 'POST',
    }),
  
  moveUser: (userId, lobbyId) =>
    apiRequest('/admin/users/move', {
      method: 'PUT',
      body: JSON.stringify({ userId, lobbyId }),
    }),
  
  toggleGlobalPause: () =>
    apiRequest('/admin/global-pause', {
      method: 'POST',
    }),
  
  createLobby: (name, creatorId, isPrivate, maxPlayers) =>
    apiRequest('/admin/lobbies', {
      method: 'POST',
      body: JSON.stringify({ name, creatorId, isPrivate, maxPlayers }),
    }),
};
