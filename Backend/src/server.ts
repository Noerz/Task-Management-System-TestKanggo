import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { prisma } from './shared/db/prisma';
import logger from './shared/utils/logger';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Successfully connected to the database');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`, {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
      });
    });
  } catch (error) {
    logger.error('Failed to start the server', { error });
    process.exit(1);
  }
};

startServer();
