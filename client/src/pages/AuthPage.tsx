
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  BrainCircuit,
  CalendarCheck,
  ChartNoAxesCombined,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

import { api, setAccessToken } from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isRegister = mode === 'register';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const response = await api.post(
        `/auth/${mode}`,
        isRegister ? { name, email, password } : { email, password }
      );

      setAccessToken(response.data.data.accessToken);
      dispatch(setCredentials(response.data.data.user));
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Unable to connect to server'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#080d1b] text-white">

      {/* Background effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* Left branding section */}
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/[0.06] p-12 lg:flex xl:p-16">

        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
              <GraduationCap size={27} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                StudyPilot <span className="text-violet-400">AI</span>
              </h1>
              <p className="text-xs text-slate-500">
                Your intelligent learning space
              </p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-xl">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs font-medium text-violet-300">
            <Sparkles size={14} />
            YOUR PERSONAL AI STUDY COMPANION
          </div>

          <h2 className="text-5xl font-bold leading-[1.15] tracking-tight xl:text-6xl">
            Study smarter.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
              Achieve more.
            </span>
          </h2>

          <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
            Transform the way you learn. Organize your academic life,
            build consistent habits, and reach your goals with
            intelligent study planning.
          </p>

          {/* Feature cards */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2">

            <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-violet-500/[0.06]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <BrainCircuit size={21} />
              </div>
              <h3 className="font-semibold">AI Study Planning</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create smarter study schedules based on your goals.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-500/[0.06]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                <CalendarCheck size={21} />
              </div>
              <h3 className="font-semibold">Task Management</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep your subjects, tasks, and deadlines organized.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-500/[0.06]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                <ChartNoAxesCombined size={21} />
              </div>
              <h3 className="font-semibold">Progress Analytics</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Understand your progress and improve every day.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-violet-500/[0.06]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <BookOpen size={21} />
              </div>
              <h3 className="font-semibold">Focused Learning</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Build better habits with consistent study sessions.
              </p>
            </div>

          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>© 2026 StudyPilot AI</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            FOCUS. LEARN. GROW.
          </span>
        </div>
      </section>

      {/* Right authentication section */}
      <section className="relative flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2">

        <div className="w-full max-w-md">

          {/* Mobile branding */}
          <Link to="/" className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <GraduationCap size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                StudyPilot <span className="text-violet-400">AI</span>
              </h1>
              <p className="text-xs text-slate-500">
                Plan smarter. Learn better.
              </p>
            </div>
          </Link>

          <div className="rounded-3xl border border-white/[0.08] bg-[#111a2d]/90 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">

            <div className="mb-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                {isRegister ? <Sparkles size={23} /> : <GraduationCap size={24} />}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                {isRegister ? 'GET STARTED' : 'WELCOME BACK'}
              </p>

              <h2 className="text-3xl font-bold tracking-tight">
                {isRegister ? 'Create your account' : 'Welcome back!'}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {isRegister
                  ? 'Start your journey towards smarter learning.'
                  : 'Sign in to continue your learning journey.'}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">

              {isRegister && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Full name
                  </span>

                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-white/10 bg-[#0a1120] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Email address
                </span>

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-[#0a1120] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </span>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    required
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/10 bg-[#0a1120] px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-violet-300"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {isRegister && (
                  <p className="mt-2 text-xs text-slate-500">
                    Password must contain at least 8 characters.
                  </p>
                )}
              </label>

              {error && (
                <div
                   role="alert"
                   className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-semibold shadow-lg shadow-violet-600/20 transition duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? 'Please wait...'
                  : isRegister
                    ? 'Create account'
                    : 'Sign in'}

                {!busy && (
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>

            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.07]" />
              <span className="text-xs text-slate-600">STUDYPILOT AI</span>
              <div className="h-px flex-1 bg-white/[0.07]" />
            </div>

            <p className="text-center text-sm text-slate-400">
              {isRegister
                ? 'Already have an account?'
                : 'New to StudyPilot?'}{' '}

              <Link
                className="font-semibold text-violet-300 transition hover:text-cyan-300"
                to={isRegister ? '/login' : '/register'}
              >
                {isRegister ? 'Sign in' : 'Create account'}
              </Link>
            </p>

          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
            <ShieldCheck size={15} className="text-emerald-400" />
            Secure authentication · Study with confidence
          </div>

        </div>
      </section>
    </main>
  );
}
