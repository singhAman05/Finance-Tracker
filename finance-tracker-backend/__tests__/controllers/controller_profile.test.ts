import { Request, Response, NextFunction } from 'express';
import { handleProfile } from '../../controllers/controller_profile';
import { AppError } from '../../utils/AppError';

jest.mock('../../services/service_profile', () => ({
  updatingProfile: jest.fn(),
}));

jest.mock('../../middleware/jwt', () => ({
  getUser: jest.fn(() => ({ id: 'user-1' })),
}));

import { updatingProfile } from '../../services/service_profile';

function mockResponse() {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis() as any,
    json: jest.fn().mockReturnThis() as any,
  };
  return res as Response;
}

function mockRequest(body: Record<string, unknown>): Request {
  return { body } as Request;
}

describe('handleProfile', () => {
  const baseBody = {
    full_name: 'Test User',
    email: 'user@example.com',
    phone: '+14155552671',
    profession: 'Engineer',
    profile_complete: true,
  };

  it('maps unique email conflict to 409 AppError', async () => {
    (updatingProfile as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { code: '23505', details: 'Key (email)=(user@example.com) already exists.' },
    });

    const req = mockRequest(baseBody);
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    handleProfile(req, res, next);
    await new Promise(process.nextTick);

    expect(next).toHaveBeenCalledTimes(1);
    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(409);
    expect(err.message).toContain('email');
  });

  it('maps unique phone conflict to 409 AppError', async () => {
    (updatingProfile as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { code: '23505', details: 'Key (phone)=(+14155552671) already exists.' },
    });

    const req = mockRequest(baseBody);
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    handleProfile(req, res, next);
    await new Promise(process.nextTick);

    expect(next).toHaveBeenCalledTimes(1);
    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(409);
    expect(err.message).toContain('phone');
  });

  it('returns success payload when profile update succeeds', async () => {
    const updatedUser = {
      id: 'user-1',
      full_name: 'Test User',
      email: 'user@example.com',
      phone: '+14155552671',
      profession: 'Engineer',
      profile_complete: true,
    };

    (updatingProfile as jest.Mock).mockResolvedValueOnce({
      data: updatedUser,
      error: null,
    });

    const req = mockRequest(baseBody);
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    handleProfile(req, res, next);
    await new Promise(process.nextTick);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        user: updatedUser,
      })
    );
  });
});