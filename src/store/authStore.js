import { create } from 'zustand';
import api from '../services/api';
import { destroySocket } from '../services/socket';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  // Register a new user
  register: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Login an existing user
  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Fetch the current user from /api/auth/me (used on page refresh)
  fetchCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isLoading: false });
    } catch {
      // Token invalid/expired — clear everything
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    destroySocket();
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
