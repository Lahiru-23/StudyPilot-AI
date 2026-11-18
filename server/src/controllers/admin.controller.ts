import { asyncHandler } from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Task from '../models/Task.js';

export const getOverview = asyncHandler(async (_req, res) => {
  const [users, subjects, tasks] = await Promise.all([
    User.countDocuments(),
    Subject.countDocuments(),
    Task.countDocuments()
  ]);

  return res.json({
    success: true,
    data: {
      totals: {
        users,
        subjects,
        tasks
      }
    }
  });
});