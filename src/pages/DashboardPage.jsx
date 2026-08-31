import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Timer, Plus, Users, RefreshCw, Flame } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, accent = 'emerald' }) {
  const colours = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    sky:     'bg-sky-50 text-sky-600',
  };
  return (
    <div className="card p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colours[accent]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-0.5 leading-none">{value}</p>
      {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function WeeklyBar({ day, minutes, maxMinutes }) {
  const pct = maxMinutes > 0 ? Math.round((minutes / maxMinutes) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <p className="text-slate-400 text-xs h-4">{minutes > 0 ? `${minutes}m` : ''}</p>
      <div className="w-full bg-slate-100 rounded-lg h-20 flex items-end justify-center overflow-hidden">
        <div
          className="w-full bg-emerald-500 rounded-t-md transition-all duration-500"
          style={{ height: `${pct}%`, minHeight: minutes > 0 ? '4px' : '0' }}
        />
      </div>
      <p className="text-slate-500 text-xs font-medium">{day}</p>
    </div>
  );
}

const EMPTY_STATS = {
  todayFocusMinutes: 0,
  todaySessions: 0,
  currentStreak: 0,
  weekFocusMinutes: 0,
  totalSessions: 0,
  weeklyData: [
    { day: 'Mon', minutes: 0 }, { day: 'Tue', minutes: 0 }, { day: 'Wed', minutes: 0 },
    { day: 'Thu', minutes: 0 }, { day: 'Fri', minutes: 0 }, { day: 'Sat', minutes: 0 },
    { day: 'Sun', minutes: 0 },
  ],
};

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError('Could not load your stats. Please try again.');
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const s = stats ?? EMPTY_STATS;
  const maxWeekMinutes = Math.max(...s.weeklyData.map(d => d.minutes), 1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Timer className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">Focus Room</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-sm hidden sm:inline">
            Hi, <span className="text-slate-900 font-medium">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full animate-fade-in">
        {/* Page title + refresh */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Welcome back, <span className="text-emerald-600 font-medium">{user?.name}</span>
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="btn-ghost text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Stat cards */}
        {loading && !stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse shadow-sm">
                <div className="h-2 bg-slate-100 rounded w-2/3 mb-3" />
                <div className="h-7 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Today's Focus"
              value={`${s.todayFocusMinutes}m`}
              sub={`${s.todaySessions} session${s.todaySessions !== 1 ? 's' : ''}`}
              icon={Timer}
              accent="emerald"
            />
            <StatCard
              label="Sessions Today"
              value={s.todaySessions}
              icon={Timer}
              accent="sky"
            />
            <StatCard
              label="Current Streak"
              value={s.currentStreak > 0 ? `${s.currentStreak} 🔥` : '0'}
              sub={s.currentStreak === 1 ? 'day' : 'days'}
              icon={Flame}
              accent="amber"
            />
            <StatCard
              label="This Week"
              value={`${s.weekFocusMinutes}m`}
              sub={`${s.totalSessions} total sessions`}
              icon={Timer}
              accent="emerald"
            />
          </div>
        )}

        {/* Weekly bar chart */}
        <div className="card p-6 mb-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-4">Weekly Focus Activity</p>
          {loading && !stats ? (
            <div className="flex gap-2 items-end h-20">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 h-full bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : s.weeklyData.every(d => d.minutes === 0) ? (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm">No focus sessions this week yet.</p>
              <p className="text-slate-400 text-xs mt-1">Start a session to see your progress here!</p>
            </div>
          ) : (
            <div className="flex gap-2">
              {s.weeklyData.map(({ day, minutes }) => (
                <WeeklyBar key={day} day={day} minutes={minutes} maxMinutes={maxWeekMinutes} />
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/create-room"
            className="card p-5 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group flex items-center gap-4"
          >
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors flex-shrink-0">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-slate-900 font-semibold">Create Room</p>
              <p className="text-slate-400 text-xs mt-0.5">Start a new focus session</p>
            </div>
          </Link>

          <Link
            to="/join-room"
            className="card p-5 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group flex items-center gap-4"
          >
            <div className="w-11 h-11 bg-sky-50 rounded-xl flex items-center justify-center group-hover:bg-sky-100 transition-colors flex-shrink-0">
              <Users className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-slate-900 font-semibold">Join Room</p>
              <p className="text-slate-400 text-xs mt-0.5">Enter a room code to join</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
