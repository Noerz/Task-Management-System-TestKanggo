"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = exports.AppError = void 0;
const zod_1 = require("zod");
const logger_1 = __importDefault(require("../utils/logger"));
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof zod_1.ZodError) {
        const errors = err.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        const message = err.issues.map((e) => e.message).join(', ');
        res.status(400).json({ success: false, message, errors });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    logger_1.default.error('Unhandled error', {
        message: err === null || err === void 0 ? void 0 : err.message,
        stack: err === null || err === void 0 ? void 0 : err.stack,
        url: req.originalUrl,
        method: req.method,
    });
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};
exports.errorMiddleware = errorMiddleware;
