import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isDev = process.env.NODE_ENV !== 'production';

// ─── Log directory ───────────────────────────────────────────────────────────
const LOG_DIR = path.join(process.cwd(), 'logs');

// ─── Custom console format (dev) ─────────────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${stack ?? message}${metaStr}`;
  })
);

// ─── JSON format (production / file) ─────────────────────────────────────────
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  json()
);

// ─── Transports ───────────────────────────────────────────────────────────────

// All logs (info and above) → combined-YYYY-MM-DD.log, kept 14 days
const combinedTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  zippedArchive: true,
  level: 'info',
  format: fileFormat,
});

// Error-only → error-YYYY-MM-DD.log, kept 30 days
const errorTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  zippedArchive: true,
  level: 'error',
  format: fileFormat,
});

// ─── Logger instance ─────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transports: [
    new winston.transports.Console({
      format: isDev ? devFormat : fileFormat,
    }),
    combinedTransport,
    errorTransport,
  ],
  // Catch uncaught exceptions & unhandled rejections
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
});

export default logger;
