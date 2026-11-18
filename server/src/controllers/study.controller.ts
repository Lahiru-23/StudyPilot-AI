import type { Response } from 'express';
import type { AuthRequest } from '../types/index.js';
import StudySession from '../models/StudySession.js';
import StudyPlan from '../models/StudyPlan.js';
import Subject from '../models/Subject.js';
import Task from '../models/Task.js';
import { generateStudyPlanAdvice } from '../services/studyPlanAI.service.js';
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
  const [subjects, tasks, previousSessions] = await Promise.all([
  Subject.find({ userId }),

  Task.find({
    userId,
    status: { $ne: 'completed' }
  }).populate('subjectId', 'name difficulty'),

  StudySession.find({ userId }).sort({ date: -1 })
]);

  if (!subjects.length) {
    return res.status(400).json({ success: false, message: 'Add at least one subject before generating a plan' });
  }

  const subjectById = new Map(subjects.map((subject: any) => [String(subject._id), subject]));
  const today = dateAtMidnight(new Date());
  // Track the most recent study date for each subject.
const lastStudiedDates = new Map<string, Date>();

for (const session of previousSessions) {
  const subjectId = String(session.subjectId);

  if (!lastStudiedDates.has(subjectId)) {
    lastStudiedDates.set(
      subjectId,
      dateAtMidnight(session.date)
    );
  }
}
  // Schedule revisions using spaced repetition intervals.
const revisionIntervals = [1, 3, 7];

const revisionSubjectsByDay = new Map<number, any[]>();

for (const subject of subjects) {
  const subjectId = String(subject._id);
  const lastStudied = lastStudiedDates.get(subjectId);

  if (!lastStudied) {
    continue;
  }

  const daysSinceLastStudy = Math.floor(
    (today.getTime() - lastStudied.getTime()) / 86_400_000
  );

  for (const interval of revisionIntervals) {
    const daysUntilRevision = interval - daysSinceLastStudy;

    if (
      daysUntilRevision >= 0 &&
      daysUntilRevision < requestedDays
    ) {
      const existing =
        revisionSubjectsByDay.get(daysUntilRevision) || [];

      if (!existing.some(
        (item: any) => String(item._id) === subjectId
      )) {
        existing.push(subject);
      }

      revisionSubjectsByDay.set(daysUntilRevision, existing);
    }
  }

  // Schedule overdue revisions for today.
  if (daysSinceLastStudy >= 7) {
    const existing = revisionSubjectsByDay.get(0) || [];

    if (!existing.some(
      (item: any) => String(item._id) === subjectId
    )) {
      existing.push(subject);
    }

    revisionSubjectsByDay.set(0, existing);
  }
}

  const scheduledTaskIds = new Set<string>();
  const subjectUseCount = new Map<string, number>();
  const schedule: Array<Record<string, unknown>> = [];
  const dailyMinutes = Math.round(requestedHours * 60);
  // const sessionLength = 60;
  const startOfDayMinutes = 9 * 60;
  // Distribute pending tasks evenly across the selected days.
  const targetTasksPerDay = Math.ceil(tasks.length / requestedDays);

  for (let day = 0; day < requestedDays; day++) {
    const planDate = new Date(today);
    planDate.setDate(today.getDate() + day);
    let remainingMinutes = dailyMinutes;
    let cursorMinutes = startOfDayMinutes;
    let tasksScheduledToday = 0;
    // Prevent scheduling the same revision subject more than once per day.
    const revisionSubjectsScheduledToday = new Set<string>();

    while (remainingMinutes > 0) {
      // const durationMinutes = Math.min(sessionLength, remainingMinutes);

      const availableTasks = tasks
        .filter(
          (task: any) =>
            !scheduledTaskIds.has(String(task._id)) &&
            tasksScheduledToday < targetTasksPerDay
        )
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
        // Check due revisions before scheduling pending tasks.
      const dueRevisions = revisionSubjectsByDay.get(day) || [];

      const availableRevisions = dueRevisions.filter(
        (subject: any) =>
          !revisionSubjectsScheduledToday.has(String(subject._id))
      );
      let selectedSubject: any;
      let activity: string;
      let taskId: string | undefined;
      let taskTitle: string | undefined;
      let taskPriority: string | undefined;
      let reason: string;

      // Reserve a session for the most urgent task when one is still unscheduled.
      if (topTask && availableRevisions.length === 0) {
        selectedSubject = topTask.subject;
        activity = `Work on: ${topTask.task.title}`;
        taskId = String(topTask.task._id);
        taskTitle = topTask.task.title;
        taskPriority = topTask.task.priority;
        reason = topTask.reason;
        scheduledTaskIds.add(taskId);
        tasksScheduledToday++;
      } else {
 
  if (availableRevisions.length > 0) {
    selectedSubject = availableRevisions[0];

    revisionSubjectsScheduledToday.add(
      String(selectedSubject._id)
    );

    activity = `Spaced Revision: ${selectedSubject.name}`;

    reason = 'Scheduled spaced repetition revision (1, 3, or 7-day interval)';
  } else {
    // No due revision: use the existing balanced revision strategy.
    const rankedSubjects = [...subjects].sort((a: any, b: any) => {
      const aCount = subjectUseCount.get(String(a._id)) || 0;
      const bCount = subjectUseCount.get(String(b._id)) || 0;

      const aScore =
        difficultyWeight[(a.difficulty || 'medium') as Difficulty] * 3 - aCount;

      const bScore =
        difficultyWeight[(b.difficulty || 'medium') as Difficulty] * 3 - bCount;

      return bScore - aScore;
    });

    selectedSubject = rankedSubjects[0];

    activity = `Review and practise ${selectedSubject.name}`;

    reason = `${selectedSubject.difficulty || 'medium'} difficulty subject • balanced revision`;
  }
}
      // Allocate study time based on subject difficulty.
      const difficulty = (selectedSubject.difficulty || 'medium') as Difficulty;

      let sessionLength: number;

      switch (difficulty) {
        case 'easy':
          sessionLength = 40;
          break;

        case 'hard':
          sessionLength = 80;
          break;

        default:
          sessionLength = 60;
      }

      const durationMinutes = Math.min(sessionLength, remainingMinutes);
      
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

        // Add a 10-minute break between study sessions.
        if (remainingMinutes > 0) {
          cursorMinutes += 10;
        }
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
  
let aiAdvice = '';
let provider = 'rule-based';

try {
  const aiSchedule = schedule.map((item) => ({
    subjectName: String(item.subjectName ?? ''),
    subjectDifficulty: String(item.subjectDifficulty ?? 'medium'),
    activity: String(item.activity ?? ''),
    durationMinutes: Number(item.durationMinutes ?? 0),
    startTime: String(item.startTime ?? ''),
    endTime: String(item.endTime ?? '')
  }));

  aiAdvice = await generateStudyPlanAdvice(aiSchedule);
  provider = 'gemini';
} catch (error) {
  console.error(
    'Gemini AI advice generation failed:',
    error instanceof Error ? error.message : error
  );

  console.warn(
    'Using rule-based planner as fallback.'
  );
}
  res.status(201).json({
    success: true,
    data: plan,
    provider,
    
insights: {
  scheduledTasks: scheduledTaskIds.size,
  totalPendingTasks: tasks.length,
  unscheduledTasks,
  dailyStudyMinutes: dailyMinutes,
  message: unscheduledTasks > 0
    ? `${unscheduledTasks} pending task(s) could not fit into this plan. Increase the plan duration or daily study hours.`
    : 'All pending tasks have been included in the plan.',
  aiAdvice
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
