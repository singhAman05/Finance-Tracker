import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key-for-local-only";

export const tokenGenerator = async (payload: any) => {
    const token = jwt.sign({ payload }, SECRET_KEY, { expiresIn: '1 hour' });
    return token;
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // console.log(token);
    if (!token) {
        res.status(401).json({ message: 'Authorization token required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        (req as any).user = decoded;
        // console.log((req as any).user)
        next();
    } catch (err) {
        console.log(`Token Error : ${err}`);
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
};

