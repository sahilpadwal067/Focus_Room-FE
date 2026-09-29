import { create } from 'zustand';
import { destroySocket } from '../services/socket';
// Import api here for logout only (avoid circular imports in api interceptor)
// eslint-disable-next-line import/no-cycle
import api from '../services/api';

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
      // Token invalid/expired  clear everything
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  // Logout: notify server to bump tokenVersion (invalidates ALL JWTs for this user),
  // then clear local state. Fire-and-forget the API call since user wants to be logged out
  // regardless of transient network errors.
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/auth/logout', null, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 3000,
        }).catch(() => {});
      }
    } catch {
      // ignore network errors — still clear local state
    }
    localStorage.removeItem('token');
    destroySocket();
    set({ user: null, token: null, error: null, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
