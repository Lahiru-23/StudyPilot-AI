import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Clock3, ListTodo, Sparkles } from 'lucide-react';
import { api } from '../services/api';
type Summary={subjects:number;pendingTasks:number;completedTasks:number;totalStudyHours:number;upcomingTasks:any[]};
export default function Dashboard(){
 const [data,setData]=useState<Summary|null>(null); const [error,setError]=useState('');
 useEffect(()=>{api.get('/dashboard/summary').then(r=>setData(r.data.data)).catch(()=>setError('Could not load dashboard. Please refresh.'));},[]);
 const cards=[{label:'Subjects',value:data?.subjects??'—',icon:BookOpen},{label:'Pending tasks',value:data?.pendingTasks??'—',icon:ListTodo},{label:'Completed tasks',value:data?.completedTasks??'—',icon:CheckCircle2},{label:'Study hours',value:data?.totalStudyHours??'—',icon:Clock3}];
 return <div><div className="mb-8"><p className="text-sm text-violet-300">YOUR LEARNING SPACE</p><h1 className="mt-2 text-3xl font-bold">Dashboard</h1><p className="mt-2 text-slate-400">A clear view of your academic progress.</p></div>
 {error&&<p className="mb-4 text-rose-300">{error}</p>}
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({label,value,icon:Icon})=><div key={label} className="rounded-2xl border border-white/10 bg-[#111b30] p-5"><div className="mb-4 flex items-center justify-between text-slate-400"><span className="text-sm">{label}</span><Icon size={19} className="text-violet-300"/></div><p className="text-3xl font-bold">{value}</p></div>)}</div>
 <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]"><section className="rounded-2xl border border-white/10 bg-[#111b30] p-6"><h2 className="text-lg font-semibold">Upcoming tasks</h2><div className="mt-4 space-y-3">{data?.upcomingTasks?.length?data.upcomingTasks.map((task:any)=><div key={task._id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-4"><div><p className="font-medium">{task.title}</p><p className="mt-1 text-xs text-slate-400">{task.subjectId?.name||'Subject'} · {new Date(task.dueDate).toLocaleDateString()}</p></div><span className="text-xs text-amber-300">{task.priority}</span></div>):<p className="py-8 text-center text-sm text-slate-500">No upcoming tasks yet. Add a task to get started.</p>}</div></section>
 <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-[#111b30] p-6"><Sparkles className="mb-4 text-violet-300"/><h2 className="text-lg font-semibold">Study smarter with AI</h2><p className="mt-2 text-sm leading-6 text-slate-400">Generate a starter study plan using your subjects and available hours. AI provider connection can be added later.</p><a href="/planner" className="mt-5 inline-block rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold hover:bg-violet-400">Open study planner</a></section></div>
 </div>;
}
