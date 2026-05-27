"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * HTTP Request Logger Middleware
 *
 * Logs every incoming request and its response:
 *  - Method, URL, IP, status code, response time
 *  - 4xx → warn, 5xx → error, else → http
 */
const httpLogger = (req, res, next) => {
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
            logger_1.default.error(message, meta);
        }
        else if (status >= 400) {
            logger_1.default.warn(message, meta);
        }
        else {
            logger_1.default.http(message, meta);
        }
    });
    next();
};
exports.httpLogger = httpLogger;
