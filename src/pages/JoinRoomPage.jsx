import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    // Allow only alphanumeric, uppercase, max 6 chars
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setRoomCode(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (roomCode.length !== 6) {
      toast.error('Room code must be exactly 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/rooms/join', { roomCode });
      toast.success(`Joined "${data.room.name}"!`);
      navigate(`/room/${data.room.roomCode}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold text-gradient">
          Focus Room
        </Link>
        <span className="text-slate-500 text-sm">
          Hi, <span className="text-slate-900 font-medium">{user?.name}</span>
        </span>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <Link
              to="/dashboard"
              className="text-slate-400 text-sm hover:text-slate-600 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-1">Join a Room</h1>
            <p className="text-slate-500 text-sm">
              Enter the 6-character room code shared with you.
            </p>
          </div>

          <div className="card p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Room code input */}
              <div>
                <label className="label">Room Code</label>
                <input
                  type="text"
                  className="input text-center text-2xl font-bold tracking-[0.3em] uppercase"
                  placeholder="XXXXXX"
                  value={roomCode}
                  onChange={handleChange}
                  maxLength={6}
                  required
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className="text-slate-400 text-xs mt-1.5 text-center">
                  {roomCode.length}/6 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || roomCode.length !== 6}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Joining…' : 'Join Room'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
