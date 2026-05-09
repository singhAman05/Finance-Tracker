// import { Request, Response, NextFunction } from 'express';
// import crypto from 'crypto';
// import { appConfig } from '../config/appConfig';

// const csrfConfig = appConfig.auth.csrf;
// const CSRF_COOKIE = csrfConfig.cookieName;
// const CSRF_HEADER = csrfConfig.headerName;

// /** Set a CSRF token cookie (readable by JS) on the response */
// export const setCsrfCookie = (res: Response): string => {
//   const token = crypto.randomBytes(csrfConfig.tokenBytes).toString('hex');
//   res.cookie(CSRF_COOKIE, token, {
//     httpOnly: csrfConfig.httpOnly,
//     secure: csrfConfig.secure,
//     sameSite: csrfConfig.sameSite,
//     maxAge: csrfConfig.maxAgeMs,
//     path: csrfConfig.path,
//   });
//   return token;
// };

// /**
//  * CSRF middleware — validates that the `X-CSRF-Token` header matches
//  * the `csrf-token` cookie (double-submit cookie pattern).
//  * Only enforced on state-changing methods (POST, PUT, PATCH, DELETE).
//  */
// export const verifyCsrf = (req: Request, res: Response, next: NextFunction) => {
//   const safeMethods = csrfConfig.safeMethods;
//   if (safeMethods.includes(req.method)) {
//     return next();
//   }

//   const cookieToken = (req.cookies as Record<string, string>)?.[CSRF_COOKIE];
//   const headerToken = req.header(CSRF_HEADER);

//   if (!cookieToken || !headerToken || cookieToken !== headerToken) {
//     res.status(403).json({ success: false, message: 'CSRF token validation failed' });
//     return;
//   }

//   next();
// };
