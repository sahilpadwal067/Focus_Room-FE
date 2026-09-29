import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Timer, Copy, Check, Wifi, WifiOff, LogOut } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import useAuthStore from '../store/authStore';

//  Helpers 

function formatMs(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const SESSION_LABELS = {
  focus: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
};

/** Derive a user-facing status from the current timer state */
function deriveStatus(timerStatus, sessionType) {
  if (timerStatus === 'running') {
    return sessionType === 'focus' ? 'focusing' : 'on break';
  }
  return 'idle';
}

/** Colour chip for a status badge */
function statusBadgeClass(status) {
  if (status === 'focusing') return 'bg-emerald-100 text-emerald-700';
  if (status === 'on break') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-500';
}

// Component 

export default function RoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [room, setRoom] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Timer display
  const [displayMs, setDisplayMs] = useState(0);
  const [timerStatus, setTimerStatus] = useState('idle');
  const [sessionType, setSessionType] = useState('focus');

  // Presence
  const [presenceUsers, setPresenceUsers] = useState([]);

  // Socket
  const [connected, setConnected] = useState(false);

  const serverState = useRef(null);
  const intervalRef = useRef(null);

  // Local tick 
  const startTick = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const s = serverState.current;
      if (!s || s.timerStatus !== 'running') return;
      const elapsed = Date.now() - s.timerStartedAt - s.clockOffset;
      const remaining = Math.max(0, s.remainingMs - elapsed);
      setDisplayMs(remaining);
      if (remaining === 0) clearInterval(intervalRef.current);
    }, 250);
  }, []);

  const stopTick = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  //  Apply timer-state from server 
  const applyTimerState = useCallback((state) => {
    const clockOffset = Date.now() - state.serverNow;
    serverState.current = { ...state, clockOffset };
    setTimerStatus(state.timerStatus);
    setSessionType(state.currentSessionType);

    if (state.timerStatus === 'running') {
      const elapsed = clockOffset;
      setDisplayMs(Math.max(0, state.remainingMs - elapsed));
      startTick();
    } else {
      stopTick();
      setDisplayMs(state.remainingMs);
    }

    // Inform server of our own derived status so presence updates
    const myStatus = deriveStatus(state.timerStatus, state.currentSessionType);
    getSocket().emit('presence-status', { roomCode, status: myStatus });
  }, [startTick, stopTick, roomCode]);

  //  Fetch room metadata 
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await api.get(`/rooms/${roomCode}`);
        setRoom(data.room);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Room not found');
        navigate('/dashboard');
      } finally {
        setPageLoading(false);
      }
    };
    fetchRoom();
  }, [roomCode, navigate]);

  //  Socket setup 
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setConnected(true);
      socket.emit('join-room', { roomCode });
    };
    const onDisconnect = () => setConnected(false);
    const onTimerState = (state) => applyTimerState(state);
    const onPresence = ({ users }) => setPresenceUsers(users);
    const onError = ({ message }) => toast.error(message);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('timer-state', onTimerState);
    socket.on('presence-update', onPresence);
    socket.on('room-error', onError);
    socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
      setConnected(false);
    });

    if (!socket.connected) socket.connect();
    else { setConnected(true); socket.emit('join-room', { roomCode }); }

    return () => {
      socket.emit('leave-room', { roomCode });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('timer-state', onTimerState);
      socket.off('presence-update', onPresence);
      socket.off('room-error', onError);
      socket.off('connect_error');
      stopTick();
    };
  }, [roomCode, applyTimerState, stopTick]);

  const emit = (event, payload = {}) => getSocket().emit(event, { roomCode, ...payload });
  const handleStart  = (type = 'focus', duration) => emit('timer-start', { sessionType: type, durationMinutes: duration });
  const handlePause  = () => emit('timer-pause');
  const handleResume = () => emit('timer-resume');
  const handleReset  = () => emit('timer-reset');

  const handleLeave = () => {
    getSocket().emit('leave-room', { roomCode });
    navigate('/dashboard');
  };

  const handleCopy = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.roomCode).then(() => {
      setCopied(true);
      toast.success('Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading room…</p>
        </div>
      </div>
    );
  }

  if (!room) return null;

  const canStart  = timerStatus === 'idle' || timerStatus === 'completed';
  const canPause  = timerStatus === 'running';
  const canResume = timerStatus === 'paused';
  const canReset  = timerStatus !== 'idle';

  // Timer colour: emerald when focusing, amber on break, green on completed
  const timerColour =
    timerStatus === 'completed'
      ? 'text-emerald-500'
      : sessionType === 'focus'
      ? 'text-slate-900'
      : 'text-amber-500';

  const sessionPill =
    sessionType === 'focus'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-amber-50 text-amber-700 border border-amber-200';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/*  Header  */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Timer className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900">Focus Room</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5">
            {connected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className={`text-xs font-medium ${connected ? 'text-emerald-600' : 'text-red-400'}`}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
          <span className="text-slate-500 text-sm hidden sm:inline">
            <span className="text-slate-900 font-medium">{user?.name}</span>
          </span>
          <button onClick={handleLeave} className="btn-secondary text-sm py-1.5 px-4 flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" />
            Leave
          </button>
        </div>
      </header>

      {/*  Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-4 animate-fade-in">

          {/* Room info card */}
          <div className="card px-5 py-4 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">{room.name}</h1>
              <p className="text-slate-400 text-xs mt-0.5">
                by <span className="text-slate-600">{room.createdBy?.name || 'Unknown'}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">Code</p>
                <p className="text-lg font-bold tracking-[0.2em] text-slate-900">{room.roomCode}</p>
              </div>
              <button
                onClick={handleCopy}
                className="btn-ghost p-2 rounded-xl"
                title="Copy room code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Timer card  visual focus */}
          <div className="card p-8 text-center shadow-sm">
            {/* Session type pill */}
            <div className="mb-4">
              <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${sessionPill}`}>
                {SESSION_LABELS[sessionType] || sessionType}
              </span>
            </div>

            {/* Timer display */}
            <p className={`text-8xl sm:text-9xl font-bold tabular-nums mb-2 transition-colors leading-none ${timerColour}`}>
              {formatMs(displayMs)}
            </p>

            {/* Status line */}
            <p className="text-slate-400 text-sm capitalize mb-8 h-5">
              {timerStatus === 'completed' ? '✅ Session complete!' : timerStatus}
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {canStart && (
                <>
                  <button onClick={() => handleStart('focus')} className="btn-primary px-8 py-3 text-base flex items-center gap-2">
                    ▶ Focus
                  </button>
                  <button onClick={() => handleStart('short_break', 5)} className="btn-secondary px-6 py-3 text-base flex items-center gap-1.5" title="Start a 5-minute break">
                    ☕ 5m Break
                  </button>
                </>
              )}
              {canPause && (
                <button onClick={handlePause} className="btn-primary px-10 py-3 text-base">
                  ⏸ Pause
                </button>
              )}
              {canResume && (
                <button onClick={handleResume} className="btn-primary px-10 py-3 text-base">
                  ▶ Resume
                </button>
              )}
              {canReset && (
                <button onClick={handleReset} className="btn-secondary px-6 py-3 text-base">
                  ↺ Reset
                </button>
              )}
            </div>

            <p className="text-slate-300 text-xs mt-6">
              {room.timerDuration} min · room {room.roomCode}
            </p>
          </div>

          {/* Presence panel */}
          <div className="card px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                People in Room
              </h2>
              <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full font-medium">
                {presenceUsers.length} {presenceUsers.length === 1 ? 'person' : 'people'}
              </span>
            </div>

            {presenceUsers.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-3">No one here yet</p>
            ) : (
              <ul className="space-y-2">
                {presenceUsers.map((u) => {
                  const isMe = u.userId === String(user?._id);
                  return (
                    <li
                      key={u.userId}
                      className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm select-none flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-800 text-sm font-medium">
                          {u.name}
                          {isMe && (
                            <span className="text-slate-400 font-normal ml-1 text-xs">(you)</span>
                          )}
                        </span>
                      </div>
                      {/* Status badge */}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusBadgeClass(u.status)}`}>
                        {u.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Leave button */}
          <div className="text-center">
            <button
              onClick={handleLeave}
              className="btn-danger text-sm flex items-center gap-1.5 mx-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              Leave Room
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
