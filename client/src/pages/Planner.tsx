import { useEffect, useState } from 'react';
import { Sparkles, CalendarDays, Clock3, Target, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

type PlanItem = {
  subjectName: string;
  subjectDifficulty?: 'easy' | 'medium' | 'hard';
  taskTitle?: string;
  taskPriority?: 'low' | 'medium' | 'high';
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  activity: string;
  reason?: string;
};
type Plan = {
  _id: string;
  title: string;
  availableHoursPerDay?: number;
  durationDays?: number;
  schedule: PlanItem[];
};
type PlanInsights = {
  scheduledTasks: number;
  totalPendingTasks: number;
  unscheduledTasks: number;
  dailyStudyMinutes: number;
  message: string;
};

export default function Planner() {
  const [hours, setHours] = useState(2);
  const [days, setDays] = useState(5);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState<PlanInsights | null>(null);

  async function load() {
    const response = await api.get('/study-plans');
    setPlans(response.data.data);
  }

  useEffect(() => {
    load().catch(() => setError('Could not load your saved study plans.'));
  }, []);

  async function generate() {
    setBusy(true);
    setError('');
    setInsights(null);
    try {
      const response = await api.post('/ai/study-plans/generate', {
        availableHours: hours,
        days
      });
      setInsights(response.data.insights || null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not generate plan. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const latestPlan = plans[0];

  return (
    <div>
      <div className="mb-7 flex items-center gap-3">
        <div className="rounded-xl bg-violet-500/20 p-3 text-violet-300"><Sparkles /></div>
        <div>
          <h1 className="text-3xl font-bold">AI Study Planner</h1>
          <p className="mt-1 text-slate-400">Build a timetable around your subjects, deadlines and priorities.</p>
        </div>
      </div>

      <section className="rounded-2xl border border-violet-400/20 bg-[#111b30] p-6">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Target size={18} className="text-violet-300" /> Intelligent plan settings
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="text-sm text-slate-400">
            Available study hours per day: <strong className="text-white">{hours} {hours === 1 ? 'hour' : 'hours'}</strong>
            <input type="range" min="1" max="12" step="1" value={hours}
              onChange={event => setHours(Number(event.target.value))}
              className="mt-3 block w-full accent-violet-500" />
          </label>
          <label className="text-sm text-slate-400">
            Plan duration: <strong className="text-white">{days} days</strong>
            <input type="range" min="1" max="14" step="1" value={days}
              onChange={event => setDays(Number(event.target.value))}
              className="mt-3 block w-full accent-violet-500" />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={generate} disabled={busy}
            className="rounded-xl bg-violet-500 px-5 py-3 font-semibold text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? 'Building your timetable...' : 'Generate intelligent study plan'}
          </button>
          <span className="text-xs text-slate-500">Provider-independent smart scheduling • No external AI key required</span>
        </div>

        <div className="mt-5 grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
          <p className="rounded-lg bg-white/5 p-3">Difficulty-aware subject allocation</p>
          <p className="rounded-lg bg-white/5 p-3">Deadline and task-priority ranking</p>
          <p className="rounded-lg bg-white/5 p-3">Daily study-hour limit and conflict-free sessions</p>
        </div>
        {error && <p className="mt-4 flex items-center gap-2 text-sm text-rose-300"><AlertCircle size={16} />{error}</p>}
      </section>

      {insights && (
        <section className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
          <h2 className="font-semibold text-emerald-200">Plan generation summary</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div><p className="text-xs text-slate-400">Tasks scheduled</p><p className="text-2xl font-bold">{insights.scheduledTasks}/{insights.totalPendingTasks}</p></div>
            <div><p className="text-xs text-slate-400">Daily study time</p><p className="text-2xl font-bold">{Math.floor(insights.dailyStudyMinutes / 60)}h {insights.dailyStudyMinutes % 60}m</p></div>
            <div><p className="text-xs text-slate-400">Not scheduled</p><p className="text-2xl font-bold">{insights.unscheduledTasks}</p></div>
          </div>
          <p className="mt-3 text-sm text-slate-300">{insights.message}</p>
        </section>
      )}

      <div className="mt-7 space-y-5">
        {plans.map(plan => (
          <section key={plan._id} className="rounded-2xl border border-white/10 bg-[#111b30] p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{plan.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {plan.durationDays || '—'} days • {plan.availableHoursPerDay || '—'} study hours per day
                </p>
              </div>
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-200">Smart timetable</span>
            </div>
            <div className="space-y-3">
              {plan.schedule.map((session, index) => (
                <article key={`${plan._id}-${index}`} className="rounded-xl bg-white/5 p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{session.subjectName}</p>
                        {session.subjectDifficulty && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] capitalize text-slate-300">
                            {session.subjectDifficulty}
                          </span>
                        )}
                        {session.taskPriority && (
                          <span className={`rounded-full px-2 py-0.5 text-[11px] capitalize ${
                            session.taskPriority === 'high' ? 'bg-rose-500/15 text-rose-300' :
                            session.taskPriority === 'medium' ? 'bg-amber-500/15 text-amber-300' :
                            'bg-sky-500/15 text-sky-300'
                          }`}>{session.taskPriority} priority</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{session.activity}</p>
                      {session.reason && <p className="mt-1 text-xs text-slate-500">{session.reason}</p>}
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <CalendarDays size={13} /> {new Date(session.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-sm text-violet-300">
                      <p className="flex items-center justify-end gap-1"><Clock3 size={14} />{session.startTime} – {session.endTime}</p>
                      <p className="mt-1 text-xs text-slate-500">{session.durationMinutes} min</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      {!plans.length && !busy && (
        <p className="mt-8 text-center text-slate-500">Your generated study plans will appear here. Add subjects and tasks first.</p>
      )}
      {latestPlan && <p className="mt-4 text-center text-xs text-slate-600">Your latest generated plan is shown first.</p>}
    </div>
  );
}
