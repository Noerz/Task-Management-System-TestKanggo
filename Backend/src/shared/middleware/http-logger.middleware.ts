import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * HTTP Request Logger Middleware
 *
 * Logs every incoming request and its response:
 *  - Method, URL, IP, status code, response time
 *  - 4xx → warn, 5xx → error, else → http
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    const meta = {
      method: req.method,
      url: req.originalUrl,
      status,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    const message = `${req.method} ${req.originalUrl} ${status} ${duration}ms`;

    if (status >= 500) {
      logger.error(message, meta);
    } else if (status >= 400) {
      logger.warn(message, meta);
    } else {
      logger.http(message, meta);
    }
  });

  next();
};
