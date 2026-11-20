
import { useEffect, useState } from 'react';
import {
  Sparkles,
  CalendarDays,
  Clock3,
  Target,
  AlertCircle,
  BrainCircuit,
  BookOpen,
  Zap,
  CheckCircle2,
  Hourglass,
  WandSparkles,
  ArrowRight,
  CalendarCheck,
  Layers3
} from 'lucide-react';
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
  aiAdvice?: string;
};

export default function Planner() {
  const [hours, setHours] = useState(2);
  const [days, setDays] = useState(5);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState<PlanInsights | null>(null);
  const [provider, setProvider] = useState('');

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
    setProvider(response.data.provider || 'rule-based');
      await load();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Could not generate plan. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  const latestPlan = plans[0];

  const totalSessions = plans.reduce(
    (total, plan) => total + plan.schedule.length,
    0
  );

  const totalMinutes = plans.reduce(
    (total, plan) =>
      total +
      plan.schedule.reduce(
        (minutes, session) => minutes + session.durationMinutes,
        0
      ),
    0
  );

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const difficultyStyles = {
    easy: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    medium: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    hard: 'border-rose-400/20 bg-rose-400/10 text-rose-300'
  };

  const priorityStyles = {
    high: 'bg-rose-500/10 text-rose-300',
    medium: 'bg-amber-500/10 text-amber-300',
    low: 'bg-sky-500/10 text-sky-300'
  };

  return (
    <div className="space-y-8 pb-10">

      {/* Hero section */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#211744] via-[#171b38] to-[#102b38] p-7 md:p-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-100px] right-1/3 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-violet-200">
              <Sparkles size={14} />
              INTELLIGENT LEARNING SYSTEM
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              AI Study Planner<span className="text-violet-400">.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
              Turn your academic goals into an organized study journey.
              Build a smarter timetable around your subjects, deadlines
              and priorities.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                <BrainCircuit className="mr-1 inline" size={14} />
                Smart scheduling
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                <Target className="mr-1 inline" size={14} />
                Goal focused
              </span>
            </div>
          </div>

          <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-violet-300/20 bg-violet-300/10 md:flex">
            <WandSparkles size={54} className="text-violet-200" />
          </div>
        </div>
      </section>

      {/* Overview statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Saved plans',
            value: plans.length,
            icon: Layers3,
            color: 'text-violet-300',
            bg: 'bg-violet-400/10'
          },
          {
            label: 'Study sessions',
            value: totalSessions,
            icon: CalendarCheck,
            color: 'text-cyan-300',
            bg: 'bg-cyan-400/10'
          },
          {
            label: 'Total study time',
            value: formatDuration(totalMinutes),
            icon: Clock3,
            color: 'text-emerald-300',
            bg: 'bg-emerald-400/10'
          }
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-[#111b30] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Across your saved study plans
              </p>
            </div>
          );
        })}
      </section>

      {/* Planner configuration */}
      <section className="overflow-hidden rounded-2xl border border-violet-400/20 bg-[#111b30]">
        <div className="border-b border-white/5 p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
              <Target size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Intelligent plan settings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Customize your available study time.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-7 p-5 md:p-6">
          <div className="grid gap-8 md:grid-cols-2">

           {/* Daily hours */}
<div>
  <div className="mb-4 flex items-center justify-between">
    <label
      htmlFor="study-hours"
      className="text-sm font-medium text-slate-300"
    >
      Available study hours per day
    </label>

    <span className="rounded-lg border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-sm font-semibold text-violet-200">
      {hours} {hours === 1 ? 'hour' : 'hours'}
    </span>
  </div>

  <input
    id="study-hours"
    type="range"
    min="1"
    max="12"
    step="1"
    value={hours}
    onChange={(event) => setHours(Number(event.target.value))}
    className="block w-full cursor-pointer accent-violet-500"
  />

  <div className="mt-2 flex justify-between text-xs text-slate-600">
    <span>1 hour</span>
    <span>12 hours</span>
  </div>
</div>
           {/* Duration */}
<div>
  <div className="mb-4 flex items-center justify-between">
    <label
      htmlFor="plan-days"
      className="text-sm font-medium text-slate-300"
    >
      Plan duration
    </label>

    <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm font-semibold text-cyan-200">
      {days} days
    </span>
  </div>

  <input
    id="plan-days"
    type="range"
    min="1"
    max="14"
    step="1"
    value={days}
    onChange={(event) => setDays(Number(event.target.value))}
    className="block w-full cursor-pointer accent-cyan-400"
  />

  <div className="mt-2 flex justify-between text-xs text-slate-600">
    <span>1 day</span>
    <span>14 days</span>
  </div>
</div>
</div>

          {/* Configuration preview */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#0b1020] p-4">
              <div className="rounded-lg bg-violet-400/10 p-2.5 text-violet-300">
                <Clock3 size={19} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Available weekly time</p>
                <p className="mt-1 font-semibold text-white">
                  {formatDuration(hours * 60 * days)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#0b1020] p-4">
              <div className="rounded-lg bg-cyan-400/10 p-2.5 text-cyan-300">
                <CalendarDays size={19} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Planning period</p>
                <p className="mt-1 font-semibold text-white">
                  {days} {days === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={busy}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-semibold text-white shadow-lg shadow-violet-950/30 transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Building your timetable...
              </>
            ) : (
              <>
                <Sparkles size={19} />
                Generate intelligent study plan
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
           AI-powered study recommendations • Smart scheduling with automatic fallback
          </p>

          {/* Features */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: BookOpen, text: 'Difficulty-aware subject allocation' },
              { icon: Zap, text: 'Deadline and task-priority ranking' },
              { icon: CalendarCheck, text: 'Daily limits and conflict-free sessions' }
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.text}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
                >
                  <Icon size={17} className="shrink-0 text-violet-300" />
                  <p className="text-xs leading-5 text-slate-400">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Generation insights */}
      {insights && (
        <section className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.08] to-[#111b30] p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-emerald-200">
                Plan generation summary
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your latest planning results
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: 'Tasks scheduled',
                value: `${insights.scheduledTasks}/${insights.totalPendingTasks}`,
                icon: CheckCircle2
              },
              {
                label: 'Daily study time',
                value: `${Math.floor(insights.dailyStudyMinutes / 60)}h ${insights.dailyStudyMinutes % 60}m`,
                icon: Clock3
              },
              {
                label: 'Not scheduled',
                value: insights.unscheduledTasks,
                icon: Hourglass
              }
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/5 bg-[#0b1020]/70 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">{stat.label}</p>
                    <Icon size={17} className="text-emerald-300" />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-4 rounded-xl bg-emerald-400/5 p-4 text-sm leading-6 text-slate-300">
            {insights.message}
          </p>
          
<div className="mt-5 space-y-4">

  {/* AI Provider Status */}
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-400/20 bg-violet-400/5 p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-violet-400/10 p-2 text-violet-300">
        <BrainCircuit size={20} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">
          AI Study Coach
        </p>
        <p className="text-xs text-slate-500">
          Study plan analysis provider
        </p>
      </div>
    </div>

    <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
      provider === 'gemini'
        ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
        : 'border border-amber-400/20 bg-amber-400/10 text-amber-300'
    }`}>
      {provider === 'gemini' ? 'Gemini AI Active' : 'Rule-Based Fallback'}
    </span>
  </div>

  {/* Gemini AI Recommendations */}
  {insights.aiAdvice ? (
    <div className="overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 via-[#111b30] to-cyan-500/5">

      <div className="flex items-center gap-3 border-b border-white/5 p-5">
        <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
          <Sparkles size={22} />
        </div>

        <div>
          <h3 className="font-semibold text-white">
            Your Personalized AI Study Advice
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Powered by Google Gemini
          </p>
        </div>
      </div>

      <div className="p-5">
        <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
          {insights.aiAdvice}
        </p>
      </div>
    </div>
  ) : (
    <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
      <p className="text-sm text-amber-200">
        AI recommendations are currently unavailable.
        Your study timetable was generated using the rule-based planner.
      </p>
    </div>
  )}

</div>

        </section>
      )}

      {/* Saved plans */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-violet-300">
              YOUR STUDY SCHEDULE
            </p>
            <h2 className="text-2xl font-bold text-white">
              Saved study plans
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review your generated timetables and study sessions.
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
            {plans.length} {plans.length === 1 ? 'plan' : 'plans'}
          </span>
        </div>

        {plans.length > 0 ? (
          <div className="space-y-5">
            {plans.map((plan) => (
              <section
                key={plan._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#111b30]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
                      <CalendarDays size={21} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{plan.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {plan.durationDays || '—'} days
                        {' · '}
                        {plan.availableHoursPerDay || '—'} study hours per day
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs text-violet-200">
                    <Sparkles className="mr-1 inline" size={12} />
                    Smart timetable
                  </span>
                </div>

                <div className="space-y-3 p-4 md:p-5">
                  {plan.schedule.map((session, index) => (
                    <article
                      key={`${plan._id}-${index}`}
                      className="rounded-xl border border-white/5 bg-[#0b1020]/70 p-4 transition hover:border-violet-400/20 hover:bg-white/[0.03]"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-white">
                              {session.subjectName}
                            </h4>

                            {session.subjectDifficulty && (
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${
                                  difficultyStyles[session.subjectDifficulty]
                                }`}
                              >
                                {session.subjectDifficulty}
                              </span>
                            )}

                            {session.taskPriority && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] capitalize ${
                                  priorityStyles[session.taskPriority]
                                }`}
                              >
                                {session.taskPriority} priority
                              </span>
                            )}
                          </div>

                          {session.taskTitle && (
                            <p className="mt-2 text-xs text-violet-300">
                              Task: {session.taskTitle}
                            </p>
                          )}

                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {session.activity}
                          </p>

                          {session.reason && (
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {session.reason}
                            </p>
                          )}

                          <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays size={14} className="text-violet-300" />
                            {new Date(session.date).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-xl border border-violet-400/10 bg-violet-400/5 p-3 sm:min-w-[145px] sm:text-right">
                          <p className="flex items-center gap-2 text-sm font-semibold text-violet-200 sm:justify-end">
                            <Clock3 size={15} />
                            {session.startTime} – {session.endTime}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {session.durationMinutes} minutes
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#111b30]/60 px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
              <CalendarDays size={28} />
            </div>

            <h3 className="text-lg font-semibold text-white">
              Your schedule starts here
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your generated study plans will appear here. Add subjects
              and tasks first, then generate your personalized timetable.
            </p>
          </div>
        )}

        {latestPlan && (
          <p className="mt-4 text-center text-xs text-slate-600">
            Your latest generated plan is shown first.
          </p>
        )}
      </section>
    </div>
  );
}
