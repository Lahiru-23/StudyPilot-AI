
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  GraduationCap,
  Layers3,
  Sparkles,
  AlertCircle,
  Code2,
  Signal,
  BookMarked
} from 'lucide-react';

import { api } from '../services/api';
import type { Subject } from '../types';

export default function Subjects() {
  const [items, setItems] = useState<Subject[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await api.get('/subjects');
    setItems(response.data.data);
  }

  useEffect(() => {
    load()
      .catch(() => setError('Could not load subjects. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await api.post('/subjects', {
        name,
        code,
        difficulty
      });

      setName('');
      setCode('');
      setDifficulty('medium');

      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not add subject');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this subject?')) return;

    setError('');

    try {
      await api.delete(`/subjects/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete subject');
    }
  }

  const easy = items.filter(s => s.difficulty === 'easy').length;
  const medium = items.filter(s => s.difficulty === 'medium').length;
  const hard = items.filter(s => s.difficulty === 'hard').length;

  const stats = [
    {
      label: 'Total Subjects',
      value: items.length,
      icon: BookOpen,
      color: 'text-violet-300',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20'
    },
    {
      label: 'Easy',
      value: easy,
      icon: Signal,
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      label: 'Medium',
      value: medium,
      icon: Layers3,
      color: 'text-amber-300',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      label: 'Hard',
      value: hard,
      icon: GraduationCap,
      color: 'text-rose-300',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    }
  ];

  function difficultyStyle(value: string) {
    switch (value?.toLowerCase()) {
      case 'easy':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
      case 'medium':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
      case 'hard':
        return 'border-rose-500/20 bg-rose-500/10 text-rose-300';
      default:
        return 'border-white/10 bg-white/5 text-slate-300';
    }
  }

  return (
    <div className="space-y-8">

      {/* Page Heading */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-[#211747] via-[#17152D] to-[#101827] p-6 md:p-8">

        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5">
              <BookOpen size={14} className="text-violet-300" />
              <span className="text-xs font-medium text-violet-200">
                LEARNING WORKSPACE
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Your learning universe.
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300/70">
              Organize your academic subjects, track their difficulty
              and build a stronger learning journey.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10">
            <GraduationCap size={31} className="text-violet-300" />
          </div>
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
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            SUBJECT OVERVIEW
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">
            Your academic portfolio
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className="group rounded-2xl border border-white/[0.07] bg-[#111725]/90 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{label}</span>

                <div className={`rounded-xl border ${border} ${bg} p-3`}>
                  <Icon size={19} className={color} />
                </div>
              </div>

              <p className="mt-3 text-3xl font-bold text-white">
                {loading ? '—' : value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {label === 'Total Subjects'
                  ? 'Your registered subjects'
                  : `${label} difficulty subjects`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Add Subject Form */}
      <section className="rounded-2xl border border-white/[0.07] bg-[#111725]/90 p-5 md:p-6">

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/10 p-3">
            <Plus size={21} className="text-violet-300" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Add a new subject
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Expand your learning portfolio.
            </p>
          </div>
        </div>

        <form onSubmit={add} className="grid gap-4 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">
              SUBJECT NAME
            </label>

            <input
              required
              placeholder="e.g. Programming Fundamentals"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B101C] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">
              SUBJECT CODE
              <span className="ml-2 font-normal text-slate-600">
                (Optional)
              </span>
            </label>

            <input
              placeholder="e.g. ITS1010"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B101C] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">
              DIFFICULTY LEVEL
            </label>

            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B101C] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-400/50"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={17} />
              {saving ? 'Adding subject...' : 'Add subject'}
            </button>
          </div>

        </form>
      </section>

      {/* Subject Cards */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
              YOUR COLLECTION
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">
              All Subjects
            </h2>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
            {items.length} subjects
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className="animate-pulse rounded-2xl border border-white/[0.06] bg-[#111725] p-6"
              >
                <div className="h-12 w-12 rounded-xl bg-white/10" />
                <div className="mt-5 h-4 w-2/3 rounded bg-white/10" />
                <div className="mt-3 h-3 w-1/3 rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {items.map(subject => {
              const subjectColor = subject.color || '#A78BFA';

              return (
                <div
                  key={subject._id}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111725]/90 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-[#171D2E]"
                >
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-3xl transition-all group-hover:opacity-25"
                    style={{ backgroundColor: subjectColor }}
                  />

                  <div className="relative z-10">

                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl border"
                        style={{
                          color: subjectColor,
                          backgroundColor: `${subjectColor}18`,
                          borderColor: `${subjectColor}35`
                        }}
                      >
                        <BookMarked size={23} />
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(subject._id)}
                        title="Delete subject"
                        aria-label={`Delete ${subject.name}`}
                        className="rounded-lg border border-white/[0.06] p-2 text-slate-500 transition hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-5">
                      <span className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${difficultyStyle(subject.difficulty)}`}>
                        {subject.difficulty}
                      </span>

                      <h3 className="mt-3 break-words text-lg font-bold text-white">
                        {subject.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <Code2 size={14} />
                        {subject.code || 'No subject code'}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                      <span className="text-xs text-slate-500">
                        Learning subject
                      </span>

                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: subjectColor,
                          boxShadow: `0 0 10px ${subjectColor}80`
                        }}
                      />
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#111725]/50 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
              <BookOpen size={27} className="text-violet-300" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-200">
              No subjects yet
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              Add your first subject using the form above.
            </p>
          </div>
        )}
      </section>

      {/* Bottom Information */}
      <div className="flex items-center gap-3 rounded-xl border border-violet-400/10 bg-violet-500/[0.04] p-4">
        <Sparkles size={18} className="shrink-0 text-violet-300" />
        <p className="text-xs leading-5 text-slate-400">
          Organizing subjects by difficulty helps you understand
          where to focus your study time.
        </p>
      </div>

    </div>
  );
}
