import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [timerDuration, setTimerDuration] = useState(25);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      toast.error('Room name must be at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/rooms', {
        name: name.trim(),
        timerDuration: Number(timerDuration),
      });
      toast.success('Room created!');
      navigate(`/room/${data.room.roomCode}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
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
            <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-1">Create a Room</h1>
            <p className="text-slate-500 text-sm">
              A unique 6-character code will be generated automatically.
            </p>
          </div>

          <div className="card p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Room name */}
              <div>
                <label className="label">Room Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Deep Work Session"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  required
                  autoFocus
                />
                <p className="text-slate-400 text-xs mt-1.5">{name.length}/50</p>
              </div>

              {/* Timer duration */}
              <div>
                <label className="label">
                  Focus Duration
                  <span className="text-slate-400 font-normal ml-1">(minutes)</span>
                </label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  max={120}
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(e.target.value)}
                />
                <p className="text-slate-400 text-xs mt-1.5">1 – 120 minutes (default 25)</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Creating…' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
