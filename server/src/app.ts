
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { connectDatabase } from './config/database.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Request body limit
app.use(express.json({ limit: '1mb' }));

// Cookie parser
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'StudyPilot AI API is running'
  });
});

// MongoDB connection middleware
app.use('/api', async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
