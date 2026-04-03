import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
dotenv.config();

// --- #5: Crash on startup if JWT_SECRET is not set (no fallback) ---
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    throw new Error("FATAL: JWT_SECRET environment variable is not set. Server cannot start.");
}

export const tokenGenerator = async (payload: Record<string, unknown>) => {
    const token = jwt.sign({ payload }, SECRET_KEY, { expiresIn: '1 hour' });
    return token;
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        res.status(401).json({ success: false, message: 'Authorization token required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        (req as any).user = decoded;
        next();
    } catch (_err) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
        return;
    }
};
