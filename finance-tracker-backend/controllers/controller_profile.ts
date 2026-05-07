import { Request, Response } from 'express';
import { updatingProfile } from '../services/service_profile';
import { validateEmail, validatePhone } from '../utils/validationUtils';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { getUser } from '../middleware/jwt';

export const handleProfile = asyncHandler(async (req: Request, res: Response) => {
  const { full_name, email, phone, profession, profile_complete } = req.body as {
    full_name?: string;
    email?: string;
    phone?: string;
    profession?: string;
    profile_complete?: boolean;
  };

  const user = getUser(req);

  if (!full_name || !profession) {
    throw AppError.validation('full_name and profession are required');
  }

  const normalizedEmail = validateEmail(email);
  const normalizedPhone = validatePhone(phone);

  const result = await updatingProfile(user.id, {
    full_name: String(full_name).trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    profession: String(profession).trim(),
    profile_complete: Boolean(profile_complete),
  });

  if (result.error || !result.data) {
    const dbErr = result.error as { code?: string; details?: string; message?: string } | null;
    if (dbErr?.code === '23505') {
      const details = String(dbErr.details || dbErr.message || '').toLowerCase();
      if (details.includes('email')) {
        throw AppError.conflict('This email is already linked to another account. Please use a different email.');
      }
      if (details.includes('phone')) {
        throw AppError.conflict('This phone number is already linked to another account. Please use a different number.');
      }
      throw AppError.conflict('Profile details already exist for another account. Please use different credentials.');
    }
    throw AppError.internal('Failed to update profile', result.error);
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: result.data,
  });
});
