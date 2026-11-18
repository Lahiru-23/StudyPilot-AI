
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Plus,
  ListTodo,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Trash2,
  CalendarDays,
  Flag,
  Sparkles,
  ClipboardList
} from 'lucide-react';

import { api } from '../services/api';
import type { Subject, Task } from '../types';

export default function Tasks() {
  const [items, setItems] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [taskResponse, subjectResponse] = await Promise.all([
      api.get('/tasks'),
      api.get('/subjects')
    ]);

    setItems(taskResponse.data.data);
    setSubjects(subjectResponse.data.data);

    if (!subjectId && subjectResponse.data.data[0]) {
      setSubjectId(subjectResponse.data.data[0]._id);
    }
  }

  useEffect(() => {
    load()
      .catch(() => setError('Could not load tasks. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await api.post('/tasks', {
        title,
        subjectId,
        dueDate,
        priority
      });

      setTitle('');
      setDueDate('');
      setPriority('medium');

      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create task');
    } finally {
      setSaving(false);
    }
  }

  async function update(task: Task, status: string) {
    setError('');

    try {
      await api.put(`/tasks/${task._id}`, { status });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not update task');
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this task?')) return;

    setError('');

    try {
      await api.delete(`/tasks/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete task');
    }
  }

  const completed = items.filter(t => t.status === 'completed').length;
  const inProgress = items.filter(t => t.status === 'in-progress').length;
  const pending = items.filter(t => t.status === 'pending').length;

  const stats = [
    {
      label: 'Total Tasks',
      value: items.length,
      icon: ListTodo,
      color: 'text-violet-300',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20'
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock3,
      color: 'text-amber-300',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: ClipboardList,
      color: 'text-cyan-300',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    }
  ];

  function priorityStyle(value: string) {
    switch (value?.toLowerCase()) {
      case 'high':
        return 'border-rose-500/20 bg-rose-500/10 text-rose-300';
      case 'medium':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
      case 'low':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
      default:
        return 'border-white/10 bg-white/5 text-slate-300';
    }
  }

  function statusStyle(value: string) {
    switch (value) {
      case 'completed':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
      case 'in-progress':
        return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300';
      default:
        return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
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
              <ClipboardList size={14} className="text-violet-300" />
              <span className="text-xs font-medium text-violet-200">
                TASK MANAGEMENT
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Manage your tasks.
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300/70">
              Stay organized, prioritize your assignments and keep
              moving towards your academic goals.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10">
            <Sparkles size={30} className="text-violet-300" />
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
            TASK OVERVIEW
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">
            Your productivity
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
                {label === 'Total Tasks'
                  ? 'All your assignments'
                  : `${label} assignments`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Create Task Form */}
      <section className="rounded-2xl border border-white/[0.07] bg-[#111725]/90 p-5 md:p-6">

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/10 p-3">
            <Plus size={21} className="text-violet-300" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Create a new task
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Add an assignment to your study schedule.
            </p>
          </div>
        </div>

        <form onSubmit={add} className="grid gap-4 md:grid-cols-2">

          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold text-slate-400">
              TASK TITLE
            </label>

            <input
              required
              placeholder="e.g. Complete Java OOP assignment"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B101C] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">
              SUBJECT
            </label>

            <select
              required
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B101C] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-400/50"
            >
              <option value="">Select subject</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">
              DUE DATE
            </label>

            <input
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B101C] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-400/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">
              PRIORITY
            </label>

            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B101C] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-400/50"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!subjects.length || saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={17} />
              {saving ? 'Creating task...' : 'Add task'}
            </button>
          </div>

        </form>
      </section>

      {/* Task List */}
      <section className="rounded-2xl border border-white/[0.07] bg-[#111725]/90 p-5 md:p-6">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
              YOUR WORKSPACE
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">
              All Tasks
            </h2>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
            {items.length} tasks
          </div>
        </div>

        <div className="space-y-3">

          {loading ? (
            [1, 2, 3].map(n => (
              <div
                key={n}
                className="animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03] p-5"
              >
                <div className="h-4 w-1/2 rounded bg-white/10" />
                <div className="mt-3 h-3 w-1/3 rounded bg-white/[0.06]" />
              </div>
            ))
          ) : items.length > 0 ? (
            items.map(task => (
              <div
                key={task._id}
                className="group flex flex-col justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 transition-all duration-300 hover:border-violet-400/20 hover:bg-violet-500/[0.035] sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-start gap-3">

                  <div className={`mt-0.5 rounded-xl p-2.5 ${
                    task.status === 'completed'
                      ? 'bg-emerald-500/10'
                      : 'bg-violet-500/10'
                  }`}>
                    {task.status === 'completed' ? (
                      <CheckCircle2 size={19} className="text-emerald-300" />
                    ) : (
                      <ListTodo size={19} className="text-violet-300" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className={`break-words text-sm font-semibold ${
                      task.status === 'completed'
                        ? 'text-slate-500 line-through'
                        : 'text-slate-200'
                    }`}>
                      {task.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpenIcon />
                        {typeof task.subjectId === 'object' && task.subjectId
                          ? task.subjectId.name
                          : 'Subject'}
                      </span>

                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} />
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-1">
                        <Flag size={13} />
                        {task.priority} priority
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">

                  <span className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${priorityStyle(task.priority)}`}>
                    {task.priority}
                  </span>

                  <select
                    aria-label={`Update status for ${task.title}`}
                    value={task.status}
                    onChange={e => update(task, e.target.value)}
                    className={`max-w-[145px] rounded-lg border px-2.5 py-2 text-xs font-medium outline-none ${statusStyle(task.status)} bg-[#101522]`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => remove(task._id)}
                    title="Delete task"
                    aria-label={`Delete ${task.title}`}
                    className="rounded-lg border border-white/[0.06] p-2 text-slate-500 transition hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
                <ClipboardList size={26} className="text-violet-300" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-200">
                No tasks yet
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                Create your first task using the form above.
              </p>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}

function BookOpenIcon() {
  return <CalendarDays size={13} />;
}
