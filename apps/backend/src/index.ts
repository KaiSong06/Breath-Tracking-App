import { createServer } from 'http';
import { createApp } from './app';
import { config, validateConfig } from './config';
import { initDatabase, closeDatabase, initSchema } from './storage';
import { wsServer } from './websocket';
import { logger } from './utils/logger';

/**
 * Main entry point
 */
async function main(): Promise<void> {
  logger.info('Starting Breath Monitor API...', { 
    nodeEnv: config.nodeEnv,
    port: config.port 
  });

  // Validate configuration
  try {
    validateConfig();
  } catch (error) {
    logger.error('Configuration validation failed', { error });
    process.exit(1);
  }

  // Initialize database
  try {
    await initDatabase();
    await initSchema();
  } catch (error) {
    logger.error('Database initialization failed', { error });
    process.exit(1);
  }

  // Create Express app
  const app = createApp();

  // Create HTTP server
  const server = createServer(app);

  // Initialize WebSocket server
  wsServer.init(server);

  // Start server
  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    logger.info(`REST API: http://localhost:${config.port}/api/${config.api.version}`);
    logger.info(`WebSocket: ws://localhost:${config.port}${config.websocket.path}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    
    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed');
      
      // Close WebSocket connections
      await wsServer.close();
      
      // Close database
      await closeDatabase();
      
      logger.info('Shutdown complete');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Run
main().catch((error) => {
  logger.error('Fatal error', { error });
  process.exit(1);
});

