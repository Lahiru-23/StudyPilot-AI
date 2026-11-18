import type { Response } from 'express';
import type { AuthRequest } from '../types/index.js';
import StudySession from '../models/StudySession.js';
import StudyPlan from '../models/StudyPlan.js';
import Subject from '../models/Subject.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

type Difficulty = 'easy' | 'medium' | 'hard';
type Priority = 'low' | 'medium' | 'high';

const difficultyWeight: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };
const priorityWeight: Record<Priority, number> = { low: 1, medium: 2, high: 3 };

function dateAtMidnight(value: Date | string) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function deadlineWeight(dueDate: Date | string, today: Date) {
  const due = dateAtMidnight(dueDate);
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
  if (daysUntilDue < 0) return { score: 6, label: 'Overdue task – highest priority' };
  if (daysUntilDue === 0) return { score: 7, label: 'Due today' };
  if (daysUntilDue <= 2) return { score: 6, label: 'Deadline approaching' };
  if (daysUntilDue <= 5) return { score: 4, label: 'Due soon' };
  if (daysUntilDue <= 10) return { score: 2, label: 'Upcoming deadline' };
  return { score: 1, label: 'Scheduled task' };
}

function formatTime(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export const listSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await StudySession.find({ userId: req.user!.id }).populate('subjectId', 'name color').sort({ date: -1 });
  res.json({ success: true, data: items });
});


export const createSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { subjectId, duration, notes } = req.body;

  const parsedDuration = Number(duration);

  if (
    !subjectId ||
    duration === undefined ||
    duration === null ||
    duration === '' ||
    !Number.isFinite(parsedDuration) ||
    !Number.isInteger(parsedDuration) ||
    parsedDuration < 1 ||
    parsedDuration > 1440
  ) {
    return res.status(400).json({
      success: false,
      message: 'Duration must be a whole number between 1 and 1440 minutes'
    });
  }

  if (notes !== undefined && (
    typeof notes !== 'string' || notes.length > 1000
  )) {
    return res.status(400).json({
      success: false,
      message: 'Notes must be a string with a maximum of 1000 characters'
    });
  }

  const subject = await Subject.findOne({
    _id: subjectId,
    userId: req.user!.id
  });

  if (!subject) {
    return res.status(400).json({
      success: false,
      message: 'Invalid subject'
    });
  }

  const item = await StudySession.create({
    userId: req.user!.id,
    subjectId,
    duration: parsedDuration,
    notes: notes?.trim()
  });

  res.status(201).json({
    success: true,
    data: await item.populate('subjectId', 'name color')
  });
});

/**
 * Provider-independent intelligent planner.
 * It prioritises pending tasks using deadline, task priority and subject difficulty,
 * then fills remaining daily study time with balanced subject revision sessions.
 */
export const generatePlan = asyncHandler(async (req: AuthRequest, res: Response) => {
  const requestedHours = Number(req.body.availableHours ?? 2);
  const requestedDays = Number(req.body.days ?? 3);

  if (!Number.isFinite(requestedHours) || requestedHours < 1 || requestedHours > 12) {
    return res.status(400).json({ success: false, message: 'Available hours must be between 1 and 12' });
  }
  if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 14) {
    return res.status(400).json({ success: false, message: 'Plan duration must be between 1 and 14 days' });
  }

  const userId = req.user!.id;
  const [subjects, tasks] = await Promise.all([
    Subject.find({ userId }),
    Task.find({ userId, status: { $ne: 'completed' } }).populate('subjectId', 'name difficulty')
  ]);

  if (!subjects.length) {
    return res.status(400).json({ success: false, message: 'Add at least one subject before generating a plan' });
  }

  const subjectById = new Map(subjects.map((subject: any) => [String(subject._id), subject]));
  const today = dateAtMidnight(new Date());
  const scheduledTaskIds = new Set<string>();
  const subjectUseCount = new Map<string, number>();
  const schedule: Array<Record<string, unknown>> = [];
  const dailyMinutes = Math.round(requestedHours * 60);
  const sessionLength = 60;
  const startOfDayMinutes = 9 * 60;

  for (let day = 0; day < requestedDays; day++) {
    const planDate = new Date(today);
    planDate.setDate(today.getDate() + day);
    let remainingMinutes = dailyMinutes;
    let cursorMinutes = startOfDayMinutes;

    while (remainingMinutes > 0) {
      const durationMinutes = Math.min(sessionLength, remainingMinutes);

      const availableTasks = tasks
        .filter((task: any) => !scheduledTaskIds.has(String(task._id)))
        .map((task: any) => {
          const subject = subjectById.get(String(task.subjectId?._id ?? task.subjectId));
          if (!subject) return null;
          const deadline = deadlineWeight(task.dueDate, today);
          const difficulty = difficultyWeight[(subject.difficulty || 'medium') as Difficulty];
          const priority = priorityWeight[(task.priority || 'medium') as Priority];
          const score = deadline.score * 2 + priority * 2 + difficulty;
          return { task, subject, score, reason: `${deadline.label} • ${task.priority || 'medium'} priority • ${subject.difficulty || 'medium'} difficulty` };
        })
        .filter(Boolean) as Array<{ task: any; subject: any; score: number; reason: string }>;

      availableTasks.sort((a, b) => b.score - a.score || new Date(a.task.dueDate).getTime() - new Date(b.task.dueDate).getTime());
      const topTask = availableTasks[0];

      let selectedSubject: any;
      let activity: string;
      let taskId: string | undefined;
      let taskTitle: string | undefined;
      let taskPriority: string | undefined;
      let reason: string;

      // Reserve a session for the most urgent task when one is still unscheduled.
      if (topTask) {
        selectedSubject = topTask.subject;
        activity = `Work on: ${topTask.task.title}`;
        taskId = String(topTask.task._id);
        taskTitle = topTask.task.title;
        taskPriority = topTask.task.priority;
        reason = topTask.reason;
        scheduledTaskIds.add(taskId);
      } else {
        // No remaining pending task: revise the hardest / least recently selected subject.
        const rankedSubjects = [...subjects].sort((a: any, b: any) => {
          const aCount = subjectUseCount.get(String(a._id)) || 0;
          const bCount = subjectUseCount.get(String(b._id)) || 0;
          const aScore = difficultyWeight[(a.difficulty || 'medium') as Difficulty] * 3 - aCount;
          const bScore = difficultyWeight[(b.difficulty || 'medium') as Difficulty] * 3 - bCount;
          return bScore - aScore;
        });
        selectedSubject = rankedSubjects[0];
        activity = `Review and practise ${selectedSubject.name}`;
        reason = `${selectedSubject.difficulty || 'medium'} difficulty subject • balanced revision`;
      }

      const subjectId = String(selectedSubject._id);
      subjectUseCount.set(subjectId, (subjectUseCount.get(subjectId) || 0) + 1);
      const entry: Record<string, unknown> = {
        subjectId: selectedSubject._id,
        subjectName: selectedSubject.name,
        subjectDifficulty: selectedSubject.difficulty || 'medium',
        date: planDate,
        startTime: formatTime(cursorMinutes),
        endTime: formatTime(cursorMinutes + durationMinutes),
        durationMinutes,
        activity,
        reason
      };
      if (taskId) {
        entry.taskId = taskId;
        entry.taskTitle = taskTitle;
        entry.taskPriority = taskPriority;
      }
      schedule.push(entry);

      cursorMinutes += durationMinutes;
      remainingMinutes -= durationMinutes;
    }
  }

  const unscheduledTasks = tasks.length - scheduledTaskIds.size;
  const plan = await StudyPlan.create({
    userId,
    title: 'My intelligent study plan',
    availableHoursPerDay: requestedHours,
    durationDays: requestedDays,
    schedule
  });

  res.status(201).json({
    success: true,
    data: plan,
    provider: 'mock',
    insights: {
      scheduledTasks: scheduledTaskIds.size,
      totalPendingTasks: tasks.length,
      unscheduledTasks,
      dailyStudyMinutes: dailyMinutes,
      message: unscheduledTasks > 0
        ? `${unscheduledTasks} pending task(s) could not fit into this plan. Increase the plan duration or daily study hours.`
        : 'All pending tasks have been included in the plan.'
    }
  });
});

export const listPlans = asyncHandler(async (req: AuthRequest, res: Response) => {
  const plans = await StudyPlan.find({ userId: req.user!.id }).sort({ generatedAt: -1 });
  res.json({ success: true, data: plans });
});

export const dashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const [subjects, pending, completed, sessions, upcoming] = await Promise.all([
    Subject.countDocuments({ userId }),
    Task.countDocuments({ userId, status: { $ne: 'completed' } }),
    Task.countDocuments({ userId, status: 'completed' }),
    StudySession.find({ userId }),
    Task.find({ userId, status: { $ne: 'completed' }, dueDate: { $gte: new Date() } }).sort({ dueDate: 1 }).limit(5).populate('subjectId', 'name')
  ]);
  const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
  res.json({ success: true, data: { subjects, pendingTasks: pending, completedTasks: completed, totalStudyHours: Math.round(totalMinutes / 60 * 10) / 10, upcomingTasks: upcoming } });
});
