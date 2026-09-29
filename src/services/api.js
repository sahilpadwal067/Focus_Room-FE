import axios from 'axios';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally: clear auth, prompt re-login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Clear local state only — do not POST /logout, the token is already invalid.
      try {
        localStorage.removeItem('token');
        const store = useAuthStore.getState();
        if (typeof store?.destroySocket === 'function') store.destroySocket();
        useAuthStore.setState({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      } catch {
        /* ignore store errors in interceptor */
      }
      const message = error?.response?.data?.message || 'Session expired. Please sign in.';
      try { toast.error(message, { id: 'auth-401' }); } catch { /* no-op */ }
      if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?next=${next}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
