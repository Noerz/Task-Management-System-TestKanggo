import Redis from 'ioredis';
import logger from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL);

redis.on('connect', () => {
  logger.info('Successfully connected to Redis', { url: REDIS_URL.replace(/:\/\/.*@/, '://***@') });
});

redis.on('ready', () => {
  logger.debug('Redis client is ready');
});

redis.on('error', (err) => {
  logger.error('Redis connection error', { message: err.message });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.warn('Redis is reconnecting...');
});
