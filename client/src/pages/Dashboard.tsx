
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  ListTodo,
  Sparkles,
  ArrowUpRight,
  CalendarDays,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import { api } from '../services/api';

type UpcomingTask = {
  _id: string;
  title: string;
  dueDate: string;
  priority: string;
  subjectId?: {
    name?: string;
  };
};

type Summary = {
  subjects: number;
  pendingTasks: number;
  completedTasks: number;
  totalStudyHours: number;
  upcomingTasks: UpcomingTask[];
};

export default function Dashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((response) => {
        setData(response.data.data);
      })
      .catch(() => {
        setError('Could not load dashboard. Please refresh.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const completed = data?.completedTasks ?? 0;
  const pending = data?.pendingTasks ?? 0;
  const totalTasks = completed + pending;

  const completionRate = totalTasks > 0
    ? Math.round((completed / totalTasks) * 100)
    : 0;

  const cards = [
    {
      label: 'Total Subjects',
      value: data?.subjects ?? 0,
      description: 'Your learning subjects',
      icon: BookOpen,
      color: 'text-violet-300',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20'
    },
    {
      label: 'Pending Tasks',
      value: pending,
      description: 'Tasks waiting for you',
      icon: ListTodo,
      color: 'text-amber-300',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      label: 'Completed Tasks',
      value: completed,
      description: 'Tasks completed',
      icon: CheckCircle2,
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      label: 'Study Hours',
      value: data?.totalStudyHours ?? 0,
      description: 'Your total study time',
      icon: Clock3,
      color: 'text-cyan-300',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    }
  ];

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const priorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-8">

      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-[#211747] via-[#17152D] to-[#101827] p-6 md:p-9">

        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-28 right-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-[90px]" />

        <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">

          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5">
              <Sparkles size={14} className="text-violet-300" />
              <span className="text-xs font-medium text-violet-200">
                YOUR PERSONAL STUDY SPACE
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Welcome back,
              <br />
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                ready to grow?
              </span>
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300/70">
              Every study session brings you closer to your goals.
              Let's make today productive.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/planner"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-400"
              >
                <Sparkles size={17} />
                Open AI Planner
                <ArrowUpRight size={16} />
              </Link>

              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                View Tasks
              </Link>
            </div>
          </div>

          <div className="relative hidden h-36 w-36 shrink-0 items-center justify-center rounded-full border border-violet-300/20 bg-violet-300/[0.06] md:flex">
            <div className="absolute inset-3 rounded-full border border-dashed border-violet-300/30" />
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30">
              <GraduationCapIcon />
            </div>
            <div className="absolute right-0 top-5 rounded-xl border border-cyan-300/20 bg-[#101827] p-2">
              <Sparkles size={17} className="text-cyan-300" />
            </div>
          </div>

        </div>

        <div className="relative z-10 mt-8 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-400">
          <CalendarDays size={15} className="text-violet-300" />
          {formattedDate}
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
              YOUR OVERVIEW
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              Study Statistics
            </h2>
          </div>

          <TrendingUp size={20} className="text-slate-500" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, description, icon: Icon, color, bg, border }, index) => (
            <div
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111725]/90 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-[#171D2E]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    {label}
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                    {loading ? '—' : value}
                  </p>
                </div>

                <div className={`rounded-xl border ${border} ${bg} p-3 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon size={20} className={color} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {description}
              </p>

              <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-violet-500/[0.04] blur-2xl transition-all duration-300 group-hover:bg-violet-500/10" />
            </div>
          ))}
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">

        {/* Upcoming Tasks */}
        <section className="rounded-2xl border border-white/[0.07] bg-[#111725]/90 p-5 md:p-6">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
                STAY ON TRACK
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">
                Upcoming Tasks
              </h2>
            </div>

            <Link
              to="/tasks"
              className="flex items-center gap-1 text-xs font-semibold text-violet-300 transition hover:text-white"
            >
              View all
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="mt-5 space-y-3">

            {loading ? (
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03] p-4"
                >
                  <div className="h-4 w-2/3 rounded bg-white/10" />
                  <div className="mt-3 h-3 w-1/3 rounded bg-white/[0.06]" />
                </div>
              ))
            ) : data?.upcomingTasks?.length ? (
              data.upcomingTasks.map((task) => (
                <div
                  key={task._id}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.025] p-4 transition-all duration-300 hover:border-violet-400/20 hover:bg-violet-500/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                      <Target size={18} className="text-violet-300" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-200">
                        {task.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {task.subjectId?.name || 'Subject'}
                        {' · '}
                        {task.dueDate && !Number.isNaN(new Date(task.dueDate).getTime())
                          ? new Date(task.dueDate).toLocaleDateString()
                          : 'Date unavailable'}
                      </p>
                    </div>
                  </div>

                  <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${priorityStyle(task.priority)}`}>
                    {task.priority || 'Normal'}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
                <CheckCircle2 size={30} className="mx-auto text-slate-600" />
                <p className="mt-3 text-sm font-medium text-slate-300">
                  No upcoming tasks
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add a task and start organizing your studies.
                </p>

                <Link
                  to="/tasks"
                  className="mt-4 inline-flex rounded-lg bg-violet-500/15 px-4 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/25"
                >
                  Create a task
                </Link>
              </div>
            )}

          </div>
        </section>

        {/* Progress Card */}
        <section className="rounded-2xl border border-white/[0.07] bg-[#111725]/90 p-5 md:p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">
            YOUR ACHIEVEMENTS
          </p>

          <h2 className="mt-1 text-lg font-bold text-white">
            Task Progress
          </h2>

          <div className="my-7 flex flex-col items-center">

            <div
              className="relative flex h-40 w-40 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#A78BFA ${completionRate * 3.6}deg, #25283A 0deg)`
              }}
            >
              <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-[#111725]">
                <span className="text-4xl font-bold text-white">
                  {loading ? '—' : `${completionRate}%`}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  Completed
                </span>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              {loading
                ? 'Loading your progress...'
                : totalTasks > 0
                  ? `${completed} of ${totalTasks} tasks completed`
                  : 'Your progress starts with your first task.'}
            </p>
          </div>

          <div className="space-y-4 border-t border-white/[0.07] pt-5">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Completed
              </div>
              <span className="text-sm font-semibold text-white">
                {loading ? '—' : completed}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Pending
              </div>
              <span className="text-sm font-semibold text-white">
                {loading ? '—' : pending}
              </span>
            </div>

          </div>

          <Link
            to="/reports"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20 hover:text-white"
          >
            View detailed analytics
            <ArrowUpRight size={16} />
          </Link>

        </section>
      </div>

      {/* AI Planner Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-gradient-to-r from-[#101C32] via-[#15182D] to-[#211747] p-6 md:p-7">

        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-[80px]" />

        <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3">
              <Sparkles size={24} className="text-cyan-300" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">
                PLAN YOUR NEXT MOVE
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Study smarter with AI
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Organize your subjects, manage your time and generate
                a personalized study plan.
              </p>
            </div>
          </div>

          <Link
            to="/planner"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-[#07111D] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300"
          >
            Generate Study Plan
            <ArrowUpRight size={17} />
          </Link>

        </div>
      </section>

    </div>
  );
}

function GraduationCapIcon() {
  return <BookOpen size={34} className="text-white" />;
}
