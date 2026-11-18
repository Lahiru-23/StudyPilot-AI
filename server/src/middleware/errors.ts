
import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  console.error(err);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'This record already exists'
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID'
    });
  }

  const status = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(status).json({
    success: false,
    message:
      status >= 500 && isProduction
        ? 'Internal server error'
        : err.message || 'Internal server error'
  });
};
