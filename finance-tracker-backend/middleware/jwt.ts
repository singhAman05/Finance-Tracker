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

type TokenEnvelope = JwtPayload & { payload?: AuthPayload };

export const tokenGenerator = (payload: AuthPayload) =>
  jwt.sign({ payload }, SECRET_KEY, { expiresIn: '1h', algorithm: 'HS256' });

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '').trim();

  if (!token) {
    res.status(401).json({ success: false, message: 'Authorization token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] }) as TokenEnvelope;
    (req as Request & { user?: TokenEnvelope }).user = decoded;
    next();
  } catch {
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
