import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { appConfig } from '../config/appConfig';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const TOKEN_BYTES = 32;

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Generate a cryptographically random CSRF token and set it as a
 * readable (non-httpOnly) cookie so the frontend can echo it back
 * in the X-CSRF-Token header (double-submit cookie pattern).
 */
export function issueCsrfToken(res: Response): string {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const jwtConfig = appConfig.auth.jwt;
  console.log('Issuing CSRF token:', token);
  console.log("Cookie Name:", CSRF_COOKIE);
  console.log("JWT Config:", jwtConfig);

  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,          // frontend must read this
    secure: jwtConfig.secure,
    sameSite: jwtConfig.sameSite,
    maxAge: jwtConfig.maxAgeMs,
    path: '/',
  });

  return token;
}

/** Clear the CSRF cookie (call alongside clearAuthCookie on logout). */
export function clearCsrfCookie(res: Response) {
  const jwtConfig = appConfig.auth.jwt;

  res.clearCookie(CSRF_COOKIE, {
    httpOnly: false,
    secure: jwtConfig.secure,
    sameSite: jwtConfig.sameSite,
    path: '/',
  });
}

/**
 * Middleware: verify CSRF token on state-changing requests.
 *
 * Reads the token from the cookie and compares it (timing-safe) against
 * the value sent in the X-CSRF-Token header. Safe methods (GET, HEAD,
 * OPTIONS) are allowed through without a check.
 */
export function verifyCsrf(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const cookieToken = (req.cookies as Record<string, string>)?.[CSRF_COOKIE];
  const headerToken = req.header(CSRF_HEADER);
  console.log('Verifying CSRF token:', { cookieToken, headerToken });

  if (!cookieToken || !headerToken) {
    res.status(403).json({ success: false, message: 'Missing CSRF token' });
    return;
  }

  // Timing-safe comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    res.status(403).json({ success: false, message: 'Invalid CSRF token' });
    return;
  }

  const valid = crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken),
  );

  console.log('CSRF token valid:', valid);

  if (!valid) {
    res.status(403).json({ success: false, message: 'Invalid CSRF token' });
    return;
  }

  next();
}
