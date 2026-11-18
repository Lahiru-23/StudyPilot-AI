
import type { Response } from 'express';
import type { AuthRequest } from '../types/index.js';

import Subject from '../models/Subject.js';
import Task from '../models/Task.js';
import StudySession from '../models/StudySession.js';

import { asyncHandler } from '../middleware/asyncHandler.js';

export const getReportSummary = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // Fetch all report data belonging to this user.
    const [totalSubjects, tasks, sessions] = await Promise.all([
      Subject.countDocuments({ userId }),
      Task.find({ userId }).lean(),
      StudySession.find({ userId })
        .populate('subjectId', 'name color')
        .lean()
    ]);

    // Task statistics.
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === 'completed'
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === 'in-progress'
    ).length;

    const pendingTasks = tasks.filter(
      (task) => task.status === 'pending'
    ).length;

    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Total study time.
    const totalStudyMinutes = sessions.reduce(
      (total, session) => total + Number(session.duration || 0),
      0
    );

    const totalStudyHours = Math.round(
      (totalStudyMinutes / 60) * 10
    ) / 10;

    // Subject-wise study time.
    const subjectMap = new Map<
      string,
      { subjectName: string; color: string; totalMinutes: number }
    >();

    sessions.forEach((session: any) => {
      const subject = session.subjectId;

      if (!subject || !subject._id) return;

      const subjectId = String(subject._id);

      const existing = subjectMap.get(subjectId) || {
        subjectName: subject.name,
        color: subject.color || '#8b5cf6',
        totalMinutes: 0
      };

      existing.totalMinutes += Number(session.duration || 0);

      subjectMap.set(subjectId, existing);
    });

    const subjectStudyHours = Array.from(subjectMap.values()).map(
      (subject) => ({
        ...subject,
        studyHours: Math.round(
          (subject.totalMinutes / 60) * 10
        ) / 10
      })
    );

    // Last seven days of study activity.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weeklyStudyHours = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const dailyMinutes = sessions
        .filter((session) => {
          const sessionDate = new Date(session.date);

          return sessionDate >= day && sessionDate < nextDay;
        })
        .reduce(
          (total, session) => total + Number(session.duration || 0),
          0
        );

      weeklyStudyHours.push({
        date: day.toISOString().slice(0, 10),
        studyHours: Math.round(
          (dailyMinutes / 60) * 10
        ) / 10
      });
    }

    res.json({
      success: true,
      data: {
        totalSubjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        completionRate,
        totalStudyMinutes,
        totalStudyHours,
        subjectStudyHours,
        weeklyStudyHours
      }
    });
  }
);
