
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  ClipboardList,
  TrendingUp,
  Loader2,
  AlertCircle
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

export default function Reports() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center text-slate-400">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin" size={22} />
          Loading reports...
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        <div className="flex items-center gap-3">
          <AlertCircle size={22} />
          <p>{error || 'No report data available.'}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm hover:bg-red-500/30"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Subjects',
      value: report.totalSubjects,
      icon: BookOpen,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10'
    },
    {
      label: 'Total Tasks',
      value: report.totalTasks,
      icon: ClipboardList,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Completed Tasks',
      value: report.completedTasks,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Study Hours',
      value: `${report.totalStudyHours}h`,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    }
  ];

  const maxHours = Math.max(
    ...report.weeklyStudyHours.map(day => day.studyHours),
    1
  );

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
            <BarChart3 size={25} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Reports & Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Track your learning progress and study performance.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-[#10182b] p-5"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-400">
                {stat.label}
              </p>

              <h2 className="mt-1 text-3xl font-bold text-white">
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Task Progress */}
      <div className="rounded-2xl border border-white/10 bg-[#10182b] p-6">
        <div className="mb-5 flex items-center gap-3">
          <TrendingUp className="text-violet-400" size={22} />
          <h2 className="text-lg font-semibold text-white">
            Task Completion Progress
          </h2>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-400">
            Overall completion rate
          </span>
          <span className="text-lg font-bold text-violet-300">
            {report.completionRate}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{
              width: `${Math.min(report.completionRate, 100)}%`
            }}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-emerald-400">
              {report.completedTasks}
            </p>
            <p className="text-xs text-slate-400">Completed</p>
          </div>

          <div>
            <p className="text-xl font-bold text-blue-400">
              {report.inProgressTasks}
            </p>
            <p className="text-xs text-slate-400">In Progress</p>
          </div>

          <div>
            <p className="text-xl font-bold text-amber-400">
              {report.pendingTasks}
            </p>
            <p className="text-xs text-slate-400">Pending</p>
          </div>
        </div>
      </div>

      {/* Weekly Study Activity */}
      <div className="rounded-2xl border border-white/10 bg-[#10182b] p-6">
        <h2 className="mb-6 text-lg font-semibold text-white">
          Last 7 Days Study Activity
        </h2>

        <div className="flex h-52 items-end justify-between gap-3">
          {report.weeklyStudyHours.map((day) => {
            const height =
              day.studyHours > 0
                ? Math.max((day.studyHours / maxHours) * 100, 5)
                : 0;

            return (
              <div
                key={day.date}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs text-slate-400">
                  {day.studyHours}h
                </span>

                <div className="flex h-36 w-full items-end">
                  <div
                    className="w-full rounded-t-lg bg-violet-500 transition-all hover:bg-violet-400"
                    style={{ height: `${height}%` }}
                    title={`${day.studyHours} study hours`}
                  />
                </div>

                <span className="text-xs text-slate-500">
                  {new Date(`${day.date}T00:00:00`).toLocaleDateString(
                    'en-US',
                    { weekday: 'short' }
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject-wise Study Hours */}
      <div className="rounded-2xl border border-white/10 bg-[#10182b] p-6">
        <h2 className="mb-5 text-lg font-semibold text-white">
          Subject-wise Study Hours
        </h2>

        {report.subjectStudyHours.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No study sessions recorded yet.
          </p>
        ) : (
          <div className="space-y-5">
            {report.subjectStudyHours.map((subject) => {
              const maxSubjectHours = Math.max(
                ...report.subjectStudyHours.map(
                  item => item.studyHours
                ),
                1
              );

              return (
                <div key={subject.subjectName}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-200">
                      {subject.subjectName}
                    </span>

                    <span className="text-sm text-slate-400">
                      {subject.studyHours}h
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(subject.studyHours / maxSubjectHours) * 100}%`,
                        backgroundColor: subject.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
