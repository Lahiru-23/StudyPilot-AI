
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import { verifyAccess } from '../utils/tokens.js';

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    const payload = verifyAccess(header.slice(7));

    if (
      typeof payload.sub !== 'string' ||
      !/^[a-fA-F0-9]{24}$/.test(payload.sub) ||
      (payload.role !== 'student' && payload.role !== 'admin')
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = {
      id: payload.sub,
      role: payload.role
    };

    // Pass the request to the next middleware/controller
    next();

  } catch {
    return res.status(401).json({
      success: false,
      message: 'Access token is invalid or expired'
    });
  }
}

export function requireRole(...roles: Array<'student' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}
