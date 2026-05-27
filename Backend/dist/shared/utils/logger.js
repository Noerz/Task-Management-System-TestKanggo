"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const { combine, timestamp, printf, colorize, errors, json } = winston_1.default.format;
const isDev = process.env.NODE_ENV !== 'production';
// ─── Log directory ───────────────────────────────────────────────────────────
const LOG_DIR = path_1.default.join(process.cwd(), 'logs');
// ─── Custom console format (dev) ─────────────────────────────────────────────
const devFormat = combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), printf((_a) => {
    var { timestamp, level, message, stack } = _a, meta = __rest(_a, ["timestamp", "level", "message", "stack"]);
    const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${stack !== null && stack !== void 0 ? stack : message}${metaStr}`;
}));
// ─── JSON format (production / file) ─────────────────────────────────────────
const fileFormat = combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), json());
// ─── Transports ───────────────────────────────────────────────────────────────
// All logs (info and above) → combined-YYYY-MM-DD.log, kept 14 days
const combinedTransport = new winston_daily_rotate_file_1.default({
    dirname: LOG_DIR,
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    zippedArchive: true,
    level: 'info',
    format: fileFormat,
});
// Error-only → error-YYYY-MM-DD.log, kept 30 days
const errorTransport = new winston_daily_rotate_file_1.default({
    dirname: LOG_DIR,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    zippedArchive: true,
    level: 'error',
    format: fileFormat,
});
// ─── Logger instance ─────────────────────────────────────────────────────────
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    transports: [
        new winston_1.default.transports.Console({
            format: isDev ? devFormat : fileFormat,
        }),
        combinedTransport,
        errorTransport,
    ],
    // Catch uncaught exceptions & unhandled rejections
    exceptionHandlers: [
        new winston_daily_rotate_file_1.default({
            dirname: LOG_DIR,
            filename: 'exceptions-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            format: fileFormat,
        }),
    ],
    rejectionHandlers: [
        new winston_daily_rotate_file_1.default({
            dirname: LOG_DIR,
            filename: 'rejections-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            format: fileFormat,
        }),
    ],
});
exports.default = logger;
