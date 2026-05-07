import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../utils/AppError';
import { AuthPayload } from '../types';
import { appConfig } from '../config/appConfig';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}

const jwtConfig = appConfig.auth.jwt;

type TokenEnvelope = JwtPayload & { payload?: AuthPayload };

export const tokenGenerator = (payload: AuthPayload) =>
  jwt.sign({ payload }, SECRET_KEY, { expiresIn: jwtConfig.expiresIn, algorithm: jwtConfig.algorithm });

/** Set JWT as an httpOnly cookie on the response */
export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(jwtConfig.cookieName, token, {
    httpOnly: jwtConfig.httpOnly,
    secure: jwtConfig.secure,
    sameSite: jwtConfig.sameSite,
    maxAge: jwtConfig.maxAgeMs,
    path: jwtConfig.path,
  });
};

/** Clear the JWT cookie */
export const clearAuthCookie = (res: Response) => {
  res.clearCookie(jwtConfig.cookieName, {
    httpOnly: jwtConfig.httpOnly,
    secure: jwtConfig.secure,
    sameSite: jwtConfig.sameSite,
    path: jwtConfig.path,
  });
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Read token from httpOnly cookie (primary) or Authorization header (fallback)
  const token =
    (req.cookies as Record<string, string>)?.[jwtConfig.cookieName] ||
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
