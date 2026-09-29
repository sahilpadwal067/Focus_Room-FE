import { Timer, Users, Zap, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Timer,
    title: 'Shared Pomodoro Timer',
    description: 'A server-authoritative timer that stays perfectly in sync for every person in the room — no drift, no desync.',
  },
  {
    icon: Users,
    title: 'Real-Time Presence',
    description: "See who's focusing and who's on break. Stay accountable with live co-working companions.",
  },
  {
    icon: Zap,
    title: 'Instant Rooms',
    description: 'Create a focus room in seconds and invite teammates via a shareable link or room code.',
  },
  {
    icon: BarChart3,
    title: 'Focus Analytics',
    description: 'Track your daily focus minutes, completed sessions, weekly trends, and current streak.',
  },
];

const benefits = [
  'Server-authoritative timer — never desyncs',
  'Join from any device, any browser',
  'Focus session history & statistics',
  'Weekly focus streak tracking',
  'Shareable room links',
  'Mobile-friendly interface',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/*  Nav */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Timer className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">Focus Room</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="btn-ghost text-sm">
              Sign In
            </a>
            <a href="/register" className="btn-primary text-sm py-2 px-4">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/*  Hero */}
      <section className="relative overflow-hidden bg-slate-50">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-36 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Real-time collaborative focus
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-slate-900">
            Stay focused,{' '}
            <span className="text-gradient">together.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create a focus room, invite your team, and share a perfectly synchronized
            Pomodoro timer. Accountability made effortless.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="btn-primary flex items-center gap-2 text-base px-8 py-3 w-full sm:w-auto justify-center"
            >
              Start Focusing Free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/login"
              className="btn-secondary flex items-center gap-2 text-base px-8 py-3 w-full sm:w-auto justify-center"
            >
              Sign In
            </a>
          </div>

          {/* Hero visual */}
          <div className="mt-20 relative max-w-2xl mx-auto">
            <div className="card p-8 text-center shadow-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Example Room · 3 participants
              </div>
              <div className="text-7xl sm:text-8xl font-mono font-bold text-slate-900 mb-2 tracking-tight">
                24:37
              </div>
              <div className="text-emerald-600 font-semibold text-sm tracking-widest uppercase mb-8">
                Focus Session
              </div>
              <div className="flex items-center justify-center gap-3 mb-8">
                <button className="btn-secondary px-5 py-2 text-sm">Reset</button>
                <button className="btn-primary px-8 py-2 text-sm">Pause</button>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Alice — Focusing
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Bob — Focusing
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" />
                  Carol — Break
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  Features */}
      <section className="py-24 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to stay in flow
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Built for teams and individuals who take deep work seriously.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="card p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  Benefits */}
      <section className="py-24 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                The timer that actually{' '}
                <span className="text-gradient">stays in sync</span>
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Unlike other tools, Focus Room uses a server-authoritative timer.
                When you refresh, disconnect, or join mid-session — you instantly
                see the correct time, always.
              </p>
              <ul className="space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Analytics Preview */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                Sample Analytics Preview
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Today's Focus", value: '3h 45m', sub: 'across 9 sessions (sample)' },
                  { label: 'Current Streak', value: '12 days', sub: 'keep it up! 🔥' },
                  { label: 'Weekly Sessions', value: '47', sub: 'sample weekly summary' },
                  { label: 'Focus Target', value: '8 rooms', sub: 'weekly target' },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="card p-6 shadow-sm">
                    <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                      {label}
                    </div>
                    <div className="text-xs text-slate-400">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  CTA*/}
      <section className="py-24 border-t border-slate-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to focus?
          </h2>
          <p className="text-slate-500 text-lg mb-8">
            Create your first focus room in under 30 seconds.
          </p>
          <a
            href="/register"
            className="btn-primary inline-flex items-center gap-2 text-base px-10 py-3"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/*  Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center">
              <Timer className="w-3 h-3 text-white" />
            </div>
            <span className="text-slate-600 font-medium">Focus Room</span>
          </div>
          <span>© {new Date().getFullYear()} Focus Room. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
