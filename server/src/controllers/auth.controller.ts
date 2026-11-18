import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  saveRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken
} from '../services/refreshToken.service.js';
import { createAccessToken, createRefreshToken, setRefreshCookie, verifyRefresh } from '../utils/tokens.js';
import type { AuthRequest } from '../types/index.js';


export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    password.length < 8
  ) {
    return res.status(400).json({
      success: false,
      message: 'Valid name, email and password (minimum 8 characters) are required'
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (await User.findOne({ email: normalizedEmail })) {
    return res.status(409).json({
      success: false,
      message: 'Email is already registered'
    });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    role: 'student'
  });

  const userId = String(user._id);
  const accessToken = createAccessToken(userId, user.role);
  const refreshToken = createRefreshToken(userId);

  await saveRefreshToken(userId, refreshToken);
  setRefreshCookie(res, refreshToken);

  return res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    }
  });
});


export const login = asyncHandler(async (req: Request, res: Response) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');

  const user = await User.findOne({ email }).select('+password');

  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const userId = String(user._id);
  const refreshToken = createRefreshToken(userId);

  await saveRefreshToken(userId, refreshToken);
  setRefreshCookie(res, refreshToken);

  return res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken: createAccessToken(userId, user.role)
    }
  });
});


export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token missing'
    });
  }

  try {
    const payload = verifyRefresh(token);

    if (!payload.sub || !payload.jti) {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new Error('User not available');
    }

    const newRefreshToken = createRefreshToken(String(user._id));

const rotated = await rotateRefreshToken(
  String(user._id),
  token,
  newRefreshToken
);

if (!rotated) {
  throw new Error('Refresh token has already been used');
}

    setRefreshCookie(res, newRefreshToken);

    return res.json({
      success: true,
      data: {
        accessToken: createAccessToken(String(user._id), user.role)
      }
    });
  } catch {
    res.clearCookie('refreshToken', { path: '/api/auth' });

    return res.status(401).json({
      success: false,
      message: 'Refresh token is invalid, expired or revoked'
    });
  }
});


export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    await revokeRefreshToken(token);
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: '/api/auth'
  });

  return res.json({
    success: true,
    message: 'Logged out'
  });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
});
