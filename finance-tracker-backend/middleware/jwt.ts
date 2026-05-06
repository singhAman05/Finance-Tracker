import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../utils/AppError';
import { AuthPayload } from '../types';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const JWT_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

type TokenEnvelope = JwtPayload & { payload?: AuthPayload };

export const tokenGenerator = (payload: AuthPayload) =>
  jwt.sign({ payload }, SECRET_KEY, { expiresIn: '1h', algorithm: 'HS256' });

/** Set JWT as an httpOnly cookie on the response */
export const setAuthCookie = (res: Response, token: string) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    maxAge: JWT_MAX_AGE_MS,
    path: '/',
  });
};

/** Clear the JWT cookie */
export const clearAuthCookie = (res: Response) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
  });
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Read token from httpOnly cookie (primary) or Authorization header (fallback)
  const token =
    (req.cookies as Record<string, string>)?.jwt ||
    req.header('Authorization')?.replace('Bearer ', '').trim();

  if (!token) {
    res.status(401).json({ success: false, message: 'Authorization token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] }) as TokenEnvelope;
    (req as Request & { user?: TokenEnvelope }).user = decoded;
    next();
  } catch {
    clearAuthCookie(res);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const getUser = (req: Request): AuthPayload => {
  const decoded = (req as Request & { user?: TokenEnvelope }).user;
  const payload = decoded?.payload;
  if (!payload?.id) {
    throw AppError.unauthorized('Invalid authentication payload');
  }
  return payload;
};
