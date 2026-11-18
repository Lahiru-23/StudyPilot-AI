import type { Response } from 'express';
import type { AuthRequest } from '../types/index.js';
import Task from '../models/Task.js';
import Subject from '../models/Subject.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await Task.find({ userId: req.user!.id }).populate('subjectId', 'name color').sort({ dueDate: 1 });
  res.json({ success: true, data: items });
});
export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { subjectId, title, dueDate, description, priority } = req.body;
  if (!subjectId || !title?.trim() || !dueDate) return res.status(400).json({ success: false, message: 'Subject, title and due date are required' });
  const subject = await Subject.findOne({ _id: subjectId, userId: req.user!.id });
  if (!subject) return res.status(400).json({ success: false, message: 'Select one of your own subjects' });
  const item = await Task.create({ userId: req.user!.id, subjectId, title, dueDate, description, priority });
  res.status(201).json({ success: true, data: await item.populate('subjectId', 'name color') });
});
export const getOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Task.findOne({ _id: req.params.id, userId: req.user!.id }).populate('subjectId', 'name color');
  if (!item) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, data: item });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    subjectId,
    title,
    dueDate,
    description,
    priority,
    status
  } = req.body;

  const allowedUpdates: Record<string, unknown> = {};

  if (subjectId !== undefined) {
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

    allowedUpdates.subjectId = subjectId;
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title must be a non-empty string'
      });
    }

    allowedUpdates.title = title.trim();
  }

  if (dueDate !== undefined) {
    const parsedDate = new Date(dueDate);

    if (typeof dueDate !== 'string' || !dueDate.trim() ||
        Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date'
      });
    }

    allowedUpdates.dueDate = parsedDate;
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Description must be a string'
      });
    }

    allowedUpdates.description = description;
  }

  if (priority !== undefined) {
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority'
      });
    }

    allowedUpdates.priority = priority;
  }

  if (status !== undefined) {
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task status'
      });
    }

    allowedUpdates.status = status;
  }

  if (Object.keys(allowedUpdates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields provided for update'
    });
  }

  const item = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  ).populate('subjectId', 'name color');

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
  if (!item) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, message: 'Task deleted' });
});
