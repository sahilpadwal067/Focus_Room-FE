import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
let globalAuthListenersAttached = false;

/**
 * Returns the singleton socket, creating it on first call.
 * The JWT token is sent in handshake.auth so the server can verify it.
 */
export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem('token') || '';
    socket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      autoConnect: false,   // we connect manually in the component
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    // Attach auth-error handlers once per socket instance.
    // AUTH_REVOKED / AUTH_INVALID / AUTH_USER_GONE → clear local session + redirect.
    socket.on('connect_error', (err) => {
      const code = String(err.message || '');
      if (
        code === 'AUTH_REVOKED'
        || code === 'AUTH_INVALID'
        || code === 'AUTH_MISSING'
        || code === 'AUTH_USER_GONE'
      ) {
        try {
          localStorage.removeItem('token');
          const store = useAuthStore.getState?.();
          if (store) {
            useAuthStore.setState({
              user: null,
              token: null,
              isLoading: false,
              error: null,
            });
          }
          toast.error('Session expired. Please sign in.', { id: 'socket-auth' });
          if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
            const next = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?next=${next}`;
          }
        } catch {
          /* ignore errors during cleanup */
        }
      }
    });
    globalAuthListenersAttached = true;
  }
  return socket;
}

/**
 * Disconnect and destroy the socket instance.
 * Call this on logout so the next login gets a fresh socket with the new token.
 */
export function destroySocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    globalAuthListenersAttached = false;
  }
}
