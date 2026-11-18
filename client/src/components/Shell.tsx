import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  NotebookPen,
  Timer,
  Sparkles,
  LogOut,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { clearCredentials } from '../features/auth/authSlice';
import { setAccessToken, api } from '../services/api';

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/tasks', label: 'Tasks', icon: NotebookPen },
  { to: '/sessions', label: 'Study sessions', icon: Timer },
  { to: '/planner', label: 'AI study planner', icon: Sparkles },
  { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 }
];
export default function Shell() {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch(); const navigate = useNavigate();
  async function logout() { try { await api.post('/auth/logout'); } finally { setAccessToken(null); dispatch(clearCredentials()); navigate('/login'); } }
  return <div className="min-h-screen bg-[#0b1020] text-slate-100 md:flex">
    <aside className="w-full border-b border-white/10 bg-[#10182b] p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="mb-8 flex items-center gap-3"><div className="rounded-xl bg-violet-500 p-2"><GraduationCap size={23}/></div><div><div className="font-bold">StudyPilot <span className="text-violet-400">AI</span></div><div className="text-xs text-slate-400">Your study co-pilot</div></div></div>
      <nav className="flex gap-2 overflow-x-auto md:flex-col">{links.map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm ${isActive?'bg-violet-500/20 text-violet-200':'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5"><div className="min-w-0"><p className="truncate text-sm font-medium">{user?.name}</p><p className="text-xs text-slate-500">{user?.role}</p></div><button onClick={logout} title="Logout" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><LogOut size={18}/></button></div>
    </aside>
    <main className="min-w-0 flex-1 p-5 md:p-9"><div className="mx-auto max-w-6xl"><Outlet/></div></main>
  </div>;
}
