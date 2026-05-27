"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const error_middleware_1 = require("./error.middleware");
const redis_1 = require("../db/redis");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new error_middleware_1.AppError('Unauthorized: No token provided', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        // Check if token is blacklisted in Redis
        const isBlacklisted = yield redis_1.redis.get(`bl_${token}`);
        if (isBlacklisted) {
            return next(new error_middleware_1.AppError('Unauthorized: Token has been revoked', 401));
        }
        const decoded = (0, jwt_util_1.verifyToken)(token);
        if (!decoded) {
            return next(new error_middleware_1.AppError('Unauthorized: Invalid or expired token', 401));
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.authMiddleware = authMiddleware;
