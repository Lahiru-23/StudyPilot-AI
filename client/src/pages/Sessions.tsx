
import { useEffect, useState } from 'react';
import {
  Clock,
  BookOpen,
  Timer,
  CalendarDays,
  Plus,
  Sparkles,
  Activity,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  NotebookPen,
  ArrowUpRight
} from 'lucide-react';

import { api } from '../services/api';
import type { Subject, Session } from '../types';

export default function Sessions() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [items, setItems] = useState<Session[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState('45');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [s, r] = await Promise.all([
      api.get('/subjects'),
      api.get('/study-sessions')
    ]);

    setSubjects(s.data.data);
    setItems(r.data.data);

    if (!subjectId && s.data.data[0]) {
      setSubjectId(s.data.data[0]._id);
    }
  }

  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);
        setError('');
        await load();
      } catch {
        setError('Could not load study sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      await api.post('/study-sessions', {
        subjectId,
        duration: Number(duration),
        notes
      });

      setNotes('');
      await load();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Could not save study session'
      );
    } finally {
      setSaving(false);
    }
  }

  const totalMinutes = items.reduce(
    (total, session) => total + session.duration,
    0
  );

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const averageDuration = items.length
    ? Math.round(totalMinutes / items.length)
    : 0;

  const stats = [
    {
      label: 'Total Sessions',
      value: items.length,
      icon: Activity,
      color: 'text-violet-300',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20'
    },
    {
      label: 'Total Study Time',
      value: `${totalHours}h ${remainingMinutes}m`,
      icon: Clock,
      color: 'text-cyan-300',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      label: 'Subjects Studied',
      value: new Set(
        items.map(session =>
          typeof session.subjectId === 'object'
            ? session.subjectId._id
            : session.subjectId
        )
      ).size,
      icon: BookOpen,
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      label: 'Average Session',
      value: `${averageDuration} min`,
      icon: Timer,
      color: 'text-amber-300',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    }
  ];

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-violet-400" size={32} />
          <p className="text-sm text-slate-400">
            Loading your study sessions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-10">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#191532] via-[#11172c] to-[#0c1728] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-cyan-200">
              <Sparkles size={14} />
              FOCUS. LEARN. GROW.
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Study <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Sessions.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Build consistency, track your focused study time,
              and make every learning session count.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
              <GraduationCap size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Your learning journey</p>
              <p className="mt-1 text-xl font-bold text-white">
                Keep going!
              </p>
              <p className="mt-1 text-xs text-emerald-400">
                Every minute matters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity size={18} className="text-violet-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-300">
            STUDY OVERVIEW
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(stat => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={`group rounded-2xl border ${stat.border} bg-gradient-to-br from-white/[0.04] to-[#111827] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20`}
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl ${stat.bg} p-3 ${stat.color}`}>
                    <Icon size={22} />
                  </div>
                  <ArrowUpRight
                    size={17}
                    className="text-slate-600 transition group-hover:text-slate-300"
                  />
                </div>

                <p className="mt-5 text-sm text-slate-400">
                  {stat.label}
                </p>

                <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
                  {stat.value}
                </h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Main Content */}
      <section className="grid gap-5 xl:grid-cols-5">

        {/* Create Session */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#111827] p-6 xl:col-span-3 sm:p-7">
          <div className="mb-7 flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-300">
              <Plus size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-white">
                Record Study Session
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Add your latest focused learning activity
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Select Subject
              </label>

              <select
                required
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0b1020] p-3.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="">Choose a subject</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>

              {!subjects.length && (
                <p className="mt-2 text-xs text-amber-400">
                  Add a subject before recording a study session.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Study Duration
              </label>

              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max="1440"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0b1020] p-3.5 pr-20 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Enter minutes"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  MINUTES
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {['25', '45', '60', '90', '120'].map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDuration(value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      duration === value
                        ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {value} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Session Notes
                <span className="ml-2 text-xs font-normal text-slate-500">
                  Optional
                </span>
              </label>

              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] p-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                placeholder="What did you learn during this session?"
              />
            </div>

            <button
              type="submit"
              disabled={!subjects.length || !subjectId || saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving session...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Save Study Session
                </>
              )}
            </button>
          </form>
        </div>

        {/* Study Summary */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#17213a] to-[#111827] p-6 xl:col-span-2">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
                <Timer size={22} />
              </div>
              <h2 className="font-semibold text-white">
                Focus Summary
              </h2>
            </div>

            <p className="mt-8 text-xs font-medium tracking-wider text-slate-500">
              TOTAL FOCUSED TIME
            </p>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight text-white">
                {totalHours}
              </span>
              <span className="text-lg text-slate-400">hrs</span>
              <span className="ml-1 text-2xl font-semibold text-cyan-300">
                {remainingMinutes}
              </span>
              <span className="text-sm text-slate-400">min</span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <BookOpen size={19} className="text-violet-300" />
                  <span className="text-sm text-slate-400">
                    Recorded sessions
                  </span>
                </div>
                <span className="font-bold text-white">{items.length}</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <Clock size={19} className="text-cyan-300" />
                  <span className="text-sm text-slate-400">
                    Average duration
                  </span>
                </div>
                <span className="font-bold text-white">
                  {averageDuration} min
                </span>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.05] p-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles size={16} />
                <span className="text-sm font-semibold">
                  Stay consistent
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Small focused sessions can create powerful learning habits.
                Keep recording your progress!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Session History */}
      <section className="rounded-3xl border border-white/[0.08] bg-[#111827] p-5 sm:p-7">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-300">
              <NotebookPen size={21} />
            </div>
            <div>
              <h2 className="font-semibold text-white">
                Session History
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your previously recorded study sessions
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
            {items.length} RECORDS
          </span>
        </div>

        {!items.length ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
              <Clock size={26} />
            </div>
            <h3 className="mt-4 font-semibold text-white">
              No study sessions yet
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Your study history will appear here once you record your first session.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(session => (
              <div
                key={session._id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition duration-300 hover:border-violet-500/20 hover:bg-violet-500/[0.03] sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-300 transition group-hover:bg-violet-500/20">
                    <BookOpen size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-200">
                      {typeof session.subjectId === 'object'
                        ? session.subjectId.name
                        : 'Subject'}
                    </h3>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={13} />
                      <span>
                        {new Date(session.date).toLocaleString()}
                      </span>
                    </div>

                    {session.notes && (
                      <p className="mt-2 break-words text-xs leading-5 text-slate-400">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="text-lg font-bold text-violet-300">
                      {session.duration} min
                    </p>
                    <p className="text-[10px] font-medium tracking-wider text-slate-500">
                      STUDY TIME
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-center gap-2 pb-2 text-xs text-slate-600">
        <Sparkles size={14} />
        <span>Stay focused. Your future self will thank you.</span>
      </div>
    </div>
  );
}
