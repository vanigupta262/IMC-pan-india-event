import { create } from 'zustand';
import { adminApi } from '../api-client';

export const useAdminStore = create((set, get) => ({
  users: [],
  lobbies: [],
  isGloballyPaused: false,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.getUsers();
      set({ users: response.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchLobbies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.getLobbies();
      set({ lobbies: response.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  distributeUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.distributeUsers();
      const { lobbies, users } = response.data;
      
      set({ 
        lobbies: lobbies || [], 
        users: users || [],
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  moveUser: async (userId, lobbyId) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.moveUser(userId, lobbyId);
      
      set((state) => {
        const updatedUsers = state.users.map((u) =>
          u.id === userId ? { ...u, lobbyId } : u
        );
        
        const updatedLobbies = state.lobbies.map((lobby) => {
          let userIds = lobby.userIds.filter((id) => id !== userId);
          
          if (lobby.id === lobbyId) {
            userIds = [...userIds, userId];
          }
          
          return { ...lobby, userIds };
        });
        
        return {
          users: updatedUsers,
          lobbies: updatedLobbies,
          isLoading: false,
        };
      });
      
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  toggleGlobalPause: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.toggleGlobalPause();
      const isPaused = response.data.isGloballyPaused;
      
      set({ isGloballyPaused: isPaused, isLoading: false });
      return { success: true, isPaused };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  createLobby: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.createLobby(name);
      const newLobby = response.data;
      
      set((state) => ({
        lobbies: [...state.lobbies, newLobby],
        isLoading: false,
      }));
      
      return { success: true, lobby: newLobby };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().fetchUsers(),
      get().fetchLobbies(),
    ]);
  },
}));
