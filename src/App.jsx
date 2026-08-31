import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CreateRoomPage from './pages/CreateRoomPage.jsx';
import JoinRoomPage from './pages/JoinRoomPage.jsx';
import RoomPage from './pages/RoomPage.jsx';
import ProtectedRoute from './pages/ProtectedRoute.jsx';

function App() {
  const { fetchCurrentUser } = useAuthStore();

  // On app load, if a token exists, rehydrate user data
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <div className="min-h-screen bg-navy-950">
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-room"
          element={
            <ProtectedRoute>
              <CreateRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join-room"
          element={
            <ProtectedRoute>
              <JoinRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomCode"
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
                <p className="text-gray-400 text-lg mb-6">Page not found</p>
                <a href="/" className="btn-primary inline-block">
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
