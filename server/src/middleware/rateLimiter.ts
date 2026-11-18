
import express from 'express';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rateLimit = require('express-rate-limit').rateLimit as (
  options: express.RequestHandler extends never ? never : any
) => express.RequestHandler;

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.'
  }
});
