
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  ClipboardList,
  TrendingUp,
  Loader2,
  AlertCircle,
  Target,
  Activity,
  CalendarDays,
  GraduationCap,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';

interface SubjectStudy {
  subjectName: string;
  color: string;
  totalMinutes: number;
  studyHours: number;
}

interface DailyStudy {
  date: string;
  studyHours: number;
}

interface ReportData {
  totalSubjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  totalStudyMinutes: number;
  totalStudyHours: number;
  subjectStudyHours: SubjectStudy[];
  weeklyStudyHours: DailyStudy[];
}

const statConfig = [
  {
    label: 'Total Subjects',
    icon: BookOpen,
    color: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'from-violet-500/10'
  },
  {
    label: 'Total Tasks',
    icon: ClipboardList,
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    glow: 'from-cyan-500/10'
  },
  {
    label: 'Completed Tasks',
    icon: CheckCircle2,
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'from-emerald-500/10'
  },
  {
    label: 'Study Hours',
    icon: Clock,
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'from-amber-500/10'
  }
];

export default function Reports() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadReports() {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/reports/summary');
      setReport(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Unable to load reports. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
            <Loader2 className="animate-spin text-violet-300" size={30} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white">Analyzing your progress</p>
            <p className="mt-1 text-sm text-slate-500">
              Preparing your learning insights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-[#111827] p-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-2xl bg-red-500/10 p-4 text-red-300">
            <AlertCircle size={28} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">
            Unable to load analytics
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            {error || 'No report data available.'}
          </p>
          <button
            onClick={loadReports}
            className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    report.totalSubjects,
    report.totalTasks,
    report.completedTasks,
    `${report.totalStudyHours}h`
  ];

  const maxHours = Math.max(
    ...report.weeklyStudyHours.map(day => day.studyHours),
    1
  );

  const maxSubjectHours = Math.max(
    ...report.subjectStudyHours.map(subject => subject.studyHours),
    1
  );

  const completionRate = Math.min(
    Math.max(report.completionRate, 0),
    100
  );

  const totalTrackedMinutes = report.totalStudyMinutes || 0;
  const remainingMinutes = totalTrackedMinutes % 60;
  const trackedHours = Math.floor(totalTrackedMinutes / 60);

  return (
    <div className="space-y-7 pb-10">

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#191532] via-[#11172c] to-[#0c1728] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-violet-200">
              <Sparkles size={14} />
              YOUR LEARNING INSIGHTS
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Reports & <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Analytics.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Every study session brings you closer to your goals.
              Explore your learning activity and track your progress.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:min-w-52">
            <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
              <GraduationCap size={27} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                Overall completion
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {report.completionRate}%
              </p>
            </div>
            <ArrowUpRight className="ml-auto text-emerald-400" size={20} />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity size={18} className="text-violet-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-300">
            PERFORMANCE OVERVIEW
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statConfig.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`group relative overflow-hidden rounded-2xl border ${item.border} bg-gradient-to-br ${item.glow} to-[#111827] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20`}
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl ${item.bg} p-3 ${item.color}`}>
                    <Icon size={22} />
                  </div>
                  <ArrowUpRight
                    size={17}
                    className="text-slate-600 transition group-hover:text-slate-300"
                  />
                </div>

                <p className="mt-5 text-sm text-slate-400">
                  {item.label}
                </p>

                <h3 className="mt-1 text-3xl font-bold tracking-tight text-white">
                  {stats[index]}
                </h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Task Completion */}
      <section className="grid gap-5 xl:grid-cols-5">

        <div className="rounded-3xl border border-white/[0.08] bg-[#111827] p-6 xl:col-span-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-300">
              <Target size={21} />
            </div>
            <div>
              <h2 className="font-semibold text-white">
                Task Completion Progress
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your overall task performance
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  COMPLETION RATE
                </p>
                <p className="mt-1 text-4xl font-bold text-white">
                  {report.completionRate}%
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {report.completedTasks} of {report.totalTasks} tasks
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-violet-400 to-cyan-400 transition-all duration-1000"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.06] p-3 sm:p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={16} />
                <span className="text-xs">Completed</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {report.completedTasks}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.06] p-3 sm:p-4">
              <div className="mb-2 flex items-center gap-2 text-cyan-400">
                <Activity size={16} />
                <span className="text-xs">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {report.inProgressTasks}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.06] p-3 sm:p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <Clock size={16} />
                <span className="text-xs">Pending</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {report.pendingTasks}
              </p>
            </div>
          </div>
        </div>

        {/* Study Time Summary */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#17213a] to-[#111827] p-6 xl:col-span-2">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300">
                <Clock size={21} />
              </div>
              <h2 className="font-semibold text-white">
                Study Time Summary
              </h2>
            </div>

            <p className="mt-8 text-xs font-medium tracking-wider text-slate-500">
              TOTAL FOCUSED TIME
            </p>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight text-white">
                {trackedHours}
              </span>
              <span className="text-lg text-slate-400">hrs</span>
              <span className="ml-1 text-2xl font-semibold text-cyan-300">
                {remainingMinutes}
              </span>
              <span className="text-sm text-slate-400">min</span>
            </div>

            <div className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Recorded study hours
                </span>
                <span className="font-semibold text-cyan-300">
                  {report.totalStudyHours}h
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Keep building your study habit. Consistency is the key to progress.
            </p>
          </div>
        </div>
      </section>

      {/* Weekly Activity */}
      <section className="rounded-3xl border border-white/[0.08] bg-[#111827] p-5 sm:p-7">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-300">
              <CalendarDays size={21} />
            </div>
            <div>
              <h2 className="font-semibold text-white">
                Weekly Study Activity
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your study hours over the last 7 days
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
            LAST 7 DAYS
          </span>
        </div>

        <div className="flex h-56 items-end justify-between gap-2 sm:gap-4">
          {report.weeklyStudyHours.map((day) => {
            const height = day.studyHours > 0
              ? Math.max((day.studyHours / maxHours) * 100, 5)
              : 0;

            const dayLabel = new Date(
              `${day.date}T00:00:00`
            ).toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div
                key={day.date}
                className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-3"
              >
                <span className="text-[10px] font-medium text-slate-400 sm:text-xs">
                  {day.studyHours}h
                </span>

                <div className="flex h-40 w-full items-end justify-center">
                  <div
                    className="relative w-full max-w-12 overflow-hidden rounded-t-xl bg-gradient-to-t from-violet-700 via-violet-500 to-cyan-400 transition-all duration-500 group-hover:brightness-125"
                    style={{ height: `${height}%` }}
                    title={`${day.studyHours} study hours`}
                  >
                    {height > 0 && (
                      <div className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-medium text-slate-500 transition group-hover:text-white sm:text-xs">
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Subject Performance */}
      <section className="rounded-3xl border border-white/[0.08] bg-[#111827] p-5 sm:p-7">
        <div className="mb-7 flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300">
            <BarChart3 size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-white">
              Subject-wise Study Performance
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              See how your study time is distributed
            </p>
          </div>
        </div>

        {report.subjectStudyHours.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
            <BookOpen className="mx-auto text-slate-600" size={30} />
            <p className="mt-3 text-sm font-medium text-slate-300">
              No study sessions recorded yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Your subject performance will appear here when you start studying.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {report.subjectStudyHours.map((subject) => {
              const percentage = Math.min(
                (subject.studyHours / maxSubjectHours) * 100,
                100
              );

              return (
                <div key={subject.subjectName} className="group">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="h-9 w-1 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="truncate text-sm font-medium text-slate-200">
                        {subject.subjectName}
                      </span>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-white">
                      {subject.studyHours}h
                    </span>
                  </div>

                  <div className="ml-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-700 group-hover:brightness-125"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: subject.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 pb-2 text-xs text-slate-600">
        <TrendingUp size={14} />
        <span>Your progress is built one session at a time.</span>
      </div>
    </div>
  );
}
