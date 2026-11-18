import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { api, setAccessToken } from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

export default function AuthPage({ mode }: { mode: 'login'|'register' }) {
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const dispatch=useDispatch(); const navigate=useNavigate(); const isRegister=mode==='register';
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const response=await api.post(`/auth/${mode}`, isRegister?{name,email,password}:{email,password});
      setAccessToken(response.data.data.accessToken); dispatch(setCredentials(response.data.data.user)); navigate('/');
    } catch(err: any) { setError(err.response?.data?.message || 'Unable to connect to server'); }
    finally { setBusy(false); }
  }
  return <div className="flex min-h-screen items-center justify-center bg-[#0b1020] p-4"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111b30] p-8 shadow-2xl">
    <div className="mb-7 flex items-center gap-3"><div className="rounded-xl bg-violet-500 p-3"><GraduationCap/></div><div><h1 className="text-xl font-bold">StudyPilot <span className="text-violet-400">AI</span></h1><p className="text-xs text-slate-400">Plan smarter. Learn better.</p></div></div>
    <h2 className="text-2xl font-bold">{isRegister?'Create your account':'Welcome back'}</h2><p className="mb-6 mt-1 text-sm text-slate-400">{isRegister?'Start organizing your academic life.':'Sign in to continue your study journey.'}</p>
    <form onSubmit={submit} className="space-y-4">
      {isRegister&&<label className="block text-sm text-slate-300">Full name<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-violet-400"/></label>}
      <label className="block text-sm text-slate-300">Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-violet-400"/></label>
      <label className="block text-sm text-slate-300">Password<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-violet-400"/></label>
      {error&&<p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-violet-500 py-3 font-semibold hover:bg-violet-400 disabled:opacity-50">{busy?'Please wait...':isRegister?'Create account':'Sign in'}</button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-400">{isRegister?'Already have an account?':'New to StudyPilot?'} <Link className="text-violet-300 hover:underline" to={isRegister?'/login':'/register'}>{isRegister?'Sign in':'Create account'}</Link></p>
  </div></div>;
}
