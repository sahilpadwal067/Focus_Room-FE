import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

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
    });
  }
  return socket;
}

/**
 * Disconnect and destroy the socket instance.
 * Call this on logout so the next login gets a fresh socket with the new token.
 */
export function destroySocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
