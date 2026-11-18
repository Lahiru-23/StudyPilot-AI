
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  NotebookPen,
  Timer,
  Sparkles,
  LogOut,
  GraduationCap,
  BarChart3,
  ChevronRight,
  Zap,
  Command,
  Menu,
  X,
  MessageCircle,
} from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { clearCredentials } from '../features/auth/authSlice';
import { setAccessToken, api } from '../services/api';

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/tasks', label: 'Tasks', icon: NotebookPen },
  { to: '/sessions', label: 'Study Sessions', icon: Timer },
  { to: '/planner', label: 'AI Study Planner', icon: Sparkles },
  { to: '/chat', label: 'AI Study Assistant', icon: MessageCircle },
  { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 }
];

export default function Shell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      dispatch(clearCredentials());
      navigate('/login');
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080B14] text-slate-100 md:flex">

      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-30 flex w-full flex-col border-b border-white/[0.07] bg-[#0D111D]/95 backdrop-blur-xl md:min-h-screen md:w-[270px] md:shrink-0 md:border-b-0 md:border-r">

        {/* Brand and Mobile Menu Button */}
        <div className="flex items-center justify-between px-5 py-5 md:px-6 md:pb-8 md:pt-6">

          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
              <GraduationCap size={24} className="text-white" />
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0D111D] bg-cyan-400" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                StudyPilot <span className="text-violet-400">AI</span>
              </h1>
              <p className="text-[11px] tracking-wide text-slate-500">
                YOUR LEARNING COMPANION
              </p>
            </div>
          </div>

          {/* Desktop Command Icon */}
          <div className="hidden rounded-lg border border-white/10 bg-white/[0.04] p-2 md:block">
            <Command size={15} className="text-slate-500" />
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300 md:hidden"
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* Navigation */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} px-4 pb-4 md:block md:px-3 md:pb-0`}>

          <p className="mb-3 hidden px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 md:block">
            Workspace
          </p>

          <nav className="flex flex-col gap-1.5">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/10 text-violet-200 shadow-sm shadow-violet-500/5'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
                    )}

                    <Icon
                      size={19}
                      className={`shrink-0 transition-all duration-300 ${
                        isActive
                          ? 'text-violet-400'
                          : 'text-slate-500 group-hover:text-slate-200'
                      }`}
                    />

                    <span>{label}</span>

                    {isActive && (
                      <ChevronRight
                        size={15}
                        className="ml-auto text-violet-400"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* AI Feature Card */}
        <div className="mx-4 my-5 hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.13] to-indigo-500/[0.04] p-4 md:block">

          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/20 p-2">
              <Zap size={16} className="text-violet-300" />
            </div>

            <span className="text-xs font-semibold text-violet-200">
              Study smarter
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-400">
            Turn your study goals into a smarter learning journey with AI.
          </p>

          <NavLink
            to="/planner"
            className="mt-4 flex items-center justify-between text-xs font-semibold text-violet-300 transition hover:text-white"
          >
            Explore AI Planner
            <ChevronRight size={15} />
          </NavLink>
        </div>

        <div className="hidden flex-1 md:block" />

        {/* User Profile */}
        <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-4 md:px-4 md:py-5">

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-sm font-bold text-violet-200">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-200">
                {user?.name || 'Student'}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {user?.role || 'Student Account'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            aria-label="Logout"
            className="rounded-xl border border-white/[0.06] p-2.5 text-slate-500 transition-all duration-300 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 min-w-0 flex-1">

        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-[#080B14]/80 px-5 py-4 backdrop-blur-xl md:px-9">

          <div>
            <p className="text-xs font-medium text-slate-500">
              STUDYPILOT AI / WORKSPACE
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-200">
              Your learning space
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

            <span className="text-[11px] font-medium text-emerald-300">
              Workspace active
            </span>
          </div>
        </header>

        {/* Page Container */}
        <div className="mx-auto w-full max-w-[1500px] p-5 md:p-8 lg:p-10">
          <Outlet />
        </div>

      </main>
    </div>
  );
}
