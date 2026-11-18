import type { Response } from 'express';
import type { AuthRequest } from '../types/index.js';
import Subject from '../models/Subject.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await Subject.find({ userId: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});
export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, code, description, difficulty, color } = req.body;
  if (!name?.trim()) return res.status(400).json({ success: false, message: 'Subject name is required' });
  const item = await Subject.create({ userId: req.user!.id, name, code, description, difficulty, color });
  res.status(201).json({ success: true, data: item });
});
export const getOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Subject.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!item) return res.status(404).json({ success: false, message: 'Subject not found' });
  res.json({ success: true, data: item });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, code, description, difficulty, color } = req.body;

  const allowedUpdates: Record<string, unknown> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject name must be a non-empty string'
      });
    }
    allowedUpdates.name = name.trim();
  }

  if (code !== undefined) allowedUpdates.code = code;
  if (description !== undefined) allowedUpdates.description = description;
  if (difficulty !== undefined) allowedUpdates.difficulty = difficulty;
  if (color !== undefined) allowedUpdates.color = color;

  if (Object.keys(allowedUpdates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields provided for update'
    });
  }

  const item = await Subject.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
  if (!item) return res.status(404).json({ success: false, message: 'Subject not found' });
  res.json({ success: true, message: 'Subject deleted' });
});
