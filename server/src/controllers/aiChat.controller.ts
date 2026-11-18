
import type { Response } from 'express';
import type { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  generateAIChatResponse,
  type ChatMessage
} from '../services/aiChat.service.js';

export const chat = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { message, history } = req.body;

    // Validate the latest student message.
    if (
      typeof message !== 'string' ||
      !message.trim() ||
      message.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must not exceed 2000 characters'
      });
    }

    // Validate conversation history.
    if (history !== undefined && !Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        message: 'History must be an array'
      });
    }

    const chatHistory: ChatMessage[] = history || [];

    if (chatHistory.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 previous messages are allowed'
      });
    }

    const validHistory = chatHistory.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        ['user', 'assistant'].includes(item.role) &&
        typeof item.content === 'string' &&
        item.content.trim().length > 0 &&
        item.content.length <= 2000
    );

    if (!validHistory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation history'
      });
    }

    const response = await generateAIChatResponse(
      message.trim(),
      chatHistory
    );

    return res.status(200).json({
      success: true,
      data: {
        message: response
      }
    });
  }
);
