import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { loginWithPhone, loginWithGoogle } from '../services/service_auth';
import { validatePhone } from '../utils/validationUtils';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const handleAuth = asyncHandler(async (req: Request, res: Response) => {
  const phone = validatePhone(req.body.phone);
  const authData = await loginWithPhone(phone);

  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    user: authData.user,
    token: authData.token,
  });
});

export const handleGoogleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { idToken, name } = req.body as { idToken?: string; name?: string };
  if (!idToken) {
    throw AppError.validation('Google ID token is required');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw AppError.unauthorized('Invalid Google ID token');
  }

  const authData = await loginWithGoogle(payload.email, payload.name || name || '');

  res.status(200).json({
    success: true,
    message: 'Google authentication successful',
    user: authData.user,
    token: authData.token,
  });
});
