import { setCsrfCookie, verifyCsrf } from '../../middleware/csrf';
import { Request, Response, NextFunction } from 'express';

function mockResponse() {
  const res: Partial<Response> = {
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis() as any,
    json: jest.fn().mockReturnThis() as any,
  };
  return res as Response;
}

function mockRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: 'POST',
    cookies: {},
    header: jest.fn(),
    ...overrides,
  } as unknown as Request;
}

describe('CSRF middleware', () => {
  describe('setCsrfCookie', () => {
    it('sets a non-httpOnly cookie', () => {
      const res = mockResponse();
      const token = setCsrfCookie(res);

      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes hex
      expect(res.cookie).toHaveBeenCalledWith(
        'csrf-token',
        token,
        expect.objectContaining({ httpOnly: false })
      );
    });
  });

  describe('verifyCsrf', () => {
    it('allows GET requests without CSRF token', () => {
      const req = mockRequest({ method: 'GET' });
      const res = mockResponse();
      const next: NextFunction = jest.fn();

      verifyCsrf(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('blocks POST without CSRF token', () => {
      const req = mockRequest({ method: 'POST', cookies: {} });
      const res = mockResponse();
      const next: NextFunction = jest.fn();

      verifyCsrf(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('blocks POST with mismatched tokens', () => {
      const req = mockRequest({
        method: 'POST',
        cookies: { 'csrf-token': 'token-a' },
      });
      (req.header as jest.Mock).mockReturnValue('token-b');
      const res = mockResponse();
      const next: NextFunction = jest.fn();

      verifyCsrf(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('allows POST with matching tokens', () => {
      const token = 'valid-csrf-token-123';
      const req = mockRequest({
        method: 'POST',
        cookies: { 'csrf-token': token },
      });
      (req.header as jest.Mock).mockReturnValue(token);
      const res = mockResponse();
      const next: NextFunction = jest.fn();

      verifyCsrf(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
