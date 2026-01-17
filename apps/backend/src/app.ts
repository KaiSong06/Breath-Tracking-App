import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware';
import { logger } from './utils/logger';

/**
 * Create and configure Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Trust proxy (for Railway and other PaaS)
  app.set('trust proxy', 1);

  // CORS
  app.use(cors({
    origin: config.api.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Device-Key'],
  }));

  // Body parsing
  app.use(express.json({ limit: config.api.maxBodySize }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('Request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
      });
    });
    
    next();
  });

  // API routes
  app.use(`/api/${config.api.version}`, routes);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'Breath Monitor API',
      version: '1.0.0',
      docs: `/api/${config.api.version}/health`,
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

