import app from './app.js';
import { closeDatabase, connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    await connectDatabase();
    logger.info('PostgreSQL connection established');

    const server = app.listen(env.port, () => {
      logger.info(`Backend server running on port ${env.port}`);
    });

    async function shutdown(signal) {
      logger.info(`${signal} received. Closing server...`);

      server.close(async () => {
        await closeDatabase();
        logger.info('Server and database connections closed');
        process.exit(0);
      });
    }

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start backend server', { error: error.message });
    process.exit(1);
  }
}

startServer();
