"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("../utils/logger"));
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
exports.redis = new ioredis_1.default(REDIS_URL);
exports.redis.on('connect', () => {
    logger_1.default.info('Successfully connected to Redis', { url: REDIS_URL.replace(/:\/\/.*@/, '://***@') });
});
exports.redis.on('ready', () => {
    logger_1.default.debug('Redis client is ready');
});
exports.redis.on('error', (err) => {
    logger_1.default.error('Redis connection error', { message: err.message });
});
exports.redis.on('close', () => {
    logger_1.default.warn('Redis connection closed');
});
exports.redis.on('reconnecting', () => {
    logger_1.default.warn('Redis is reconnecting...');
});
