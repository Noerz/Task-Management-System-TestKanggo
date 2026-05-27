import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { AppError } from './error.middleware';
import { redis } from '../db/redis';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: No token provided', 401));
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Check if token is blacklisted in Redis
    const isBlacklisted = await redis.get(`bl_${token}`);

    if (isBlacklisted) {
      return next(new AppError('Unauthorized: Token has been revoked', 401));
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return next(new AppError('Unauthorized: Invalid or expired token', 401));
    }

    req.user = decoded as { userId: string; email: string };
    next();
  } catch (error) {
    next(error);
  }
};
