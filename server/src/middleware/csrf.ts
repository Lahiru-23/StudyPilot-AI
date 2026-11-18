
import type { Request, Response, NextFunction } from 'express';

export function verifyOrigin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowedOrigin =
    process.env.CLIENT_URL || 'http://localhost:5173';

  const origin = req.get('Origin');

  if (origin !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      message: 'Request origin is not allowed'
    });
  }

  next();
}
