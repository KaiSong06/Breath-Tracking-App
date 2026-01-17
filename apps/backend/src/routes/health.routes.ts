import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../storage';
import { wsServer } from '../websocket';
import type { ApiResponse, HealthResponse } from '../types';

const router = Router();

// Track server start time for uptime
const startTime = Date.now();

/**
 * GET /api/v1/health
 * Health check endpoint
 */
router.get('/', async (_req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseHealth();
  
  const health: HealthResponse = {
    status: dbHealthy ? 'healthy' : 'degraded',
    version: '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    database: dbHealthy ? 'connected' : 'disconnected',
  };

  const response: ApiResponse<HealthResponse> = {
    success: true,
    data: health,
    timestamp: Date.now(),
  };

  // Return 503 if database is down
  const statusCode = dbHealthy ? 200 : 503;
  res.status(statusCode).json(response);
});

/**
 * GET /api/v1/health/detailed
 * Detailed health check with more metrics
 */
router.get('/detailed', async (_req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseHealth();
  
  const detailed = {
    status: dbHealthy ? 'healthy' : 'degraded',
    version: '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    database: dbHealthy ? 'connected' : 'disconnected',
    websocket: {
      clients: wsServer.getClientCount(),
    },
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
  };

  const response: ApiResponse<typeof detailed> = {
    success: true,
    data: detailed,
    timestamp: Date.now(),
  };

  res.json(response);
});

export default router;

