import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api-client';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.login(email, password);
                    const { token, user } = response.data;

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('auth_token', token);
                    }

                    set({ user, token, isLoading: false });
                    return { success: true };
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    return { success: false, error: error.message };
                }
            },

            signup: async (username, email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.signup(username, email, password);
                    const { token, user } = response.data;

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('auth_token', token);
                    }

                    set({ user, token, isLoading: false });
                    return { success: true };
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    return { success: false, error: error.message };
                }
            },

            logout: async () => {
                try {
                    await authApi.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('auth_token');
                    }
                    set({ user: null, token: null, error: null });
                }
            },

            fetchProfile: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.getProfile();
                    set({ user: response.data, isLoading: false });
                } catch (error) {
                    set({ error: error.message, isLoading: false, user: null, token: null });
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('auth_token');
                    }
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);
