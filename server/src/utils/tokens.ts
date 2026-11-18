
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.length < 64) {
    throw new Error('JWT_ACCESS_SECRET must contain at least 64 characters');
  }

  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret || secret.length < 64) {
    throw new Error('JWT_REFRESH_SECRET must contain at least 64 characters');
  }

  return secret;
}

export function createAccessToken(
  userId: string,
  role: 'student' | 'admin'
): string {
  return jwt.sign(
    { sub: userId, role, type: 'access' },
    getAccessSecret(),
    {
      expiresIn: '15m',
      algorithm: 'HS256'
    }
  );
}

export function createRefreshToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      type: 'refresh',
      jti: randomUUID()
    },
    getRefreshSecret(),
    {
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  );
}

export function verifyAccess(token: string): jwt.JwtPayload {
  const payload = jwt.verify(token, getAccessSecret(), {
    algorithms: ['HS256']
  }) as jwt.JwtPayload;

  if (
    payload.type !== 'access' ||
    typeof payload.sub !== 'string' ||
    !['student', 'admin'].includes(payload.role)
  ) {
    throw new Error('Invalid access token payload');
  }

  return payload;
}

export function verifyRefresh(token: string): jwt.JwtPayload {
  const payload = jwt.verify(token, getRefreshSecret(), {
    algorithms: ['HS256']
  }) as jwt.JwtPayload;

  if (
    payload.type !== 'refresh' ||
    typeof payload.sub !== 'string' ||
    typeof payload.jti !== 'string'
  ) {
    throw new Error('Invalid refresh token payload');
  }

  return payload;
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'none',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}
