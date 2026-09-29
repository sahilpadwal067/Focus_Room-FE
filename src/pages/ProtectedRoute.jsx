import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * Wraps a route so only authenticated users can access it.
 * Unauthenticated users are redirected to /login.
 *
 * Refresh flow:
 *   1. Page loads  token in localStorage token set in store, user = null, isLoading = true
 *   2. fetchCurrentUser (called in App.jsx) resolves  user set  ProtectedRoute re-renders shows children
 *   3. If token expired  fetchCurrentUser clears token  ProtectedRoute sees !token  redirects
 */
export default function ProtectedRoute({ children }) {
  const { token, user, isLoading } = useAuthStore();

  // No token at all redirect immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists but user not yet hydrated show spinner while fetchCurrentUser runs
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="text-center animate-fade-in">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return children;
}
