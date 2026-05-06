import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const CSRF_COOKIE = 'csrf-token';
const CSRF_HEADER = 'x-csrf-token';

/** Set a CSRF token cookie (readable by JS) on the response */
export const setCsrfCookie = (res: Response): string => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false, // JS must read this to send back as header
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
    path: '/',
  });
  return token;
};

/**
 * CSRF middleware — validates that the `X-CSRF-Token` header matches
 * the `csrf-token` cookie (double-submit cookie pattern).
 * Only enforced on state-changing methods (POST, PUT, PATCH, DELETE).
 */
export const verifyCsrf = (req: Request, res: Response, next: NextFunction) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const cookieToken = (req.cookies as Record<string, string>)?.[CSRF_COOKIE];
  const headerToken = req.header(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ success: false, message: 'CSRF token validation failed' });
    return;
  }

  next();
};
