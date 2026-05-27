import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ZodError) {
    const errors = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    const message = err.issues.map((e: any) => e.message).join(', ');
    res.status(400).json({ success: false, message, errors });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  logger.error('Unhandled error', {
    message: err?.message,
    stack: err?.stack,
    url: req.originalUrl,
    method: req.method,
  });
  res.status(500).json({ success: false, message: 'Internal Server Error' });
};
