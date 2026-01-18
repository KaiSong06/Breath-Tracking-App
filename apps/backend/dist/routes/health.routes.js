"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storage_1 = require("../storage");
const websocket_1 = require("../websocket");
const router = (0, express_1.Router)();
// Track server start time for uptime
const startTime = Date.now();
/**
 * GET /api/v1/health
 * Health check endpoint
 */
router.get('/', async (_req, res) => {
    const dbHealthy = await (0, storage_1.checkDatabaseHealth)();
    const health = {
        status: dbHealthy ? 'healthy' : 'degraded',
        version: '1.0.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        database: dbHealthy ? 'connected' : 'disconnected',
    };
    const response = {
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
router.get('/detailed', async (_req, res) => {
    const dbHealthy = await (0, storage_1.checkDatabaseHealth)();
    const detailed = {
        status: dbHealthy ? 'healthy' : 'degraded',
        version: '1.0.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        database: dbHealthy ? 'connected' : 'disconnected',
        websocket: {
            clients: websocket_1.wsServer.getClientCount(),
        },
        memory: {
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            unit: 'MB',
        },
    };
    const response = {
        success: true,
        data: detailed,
        timestamp: Date.now(),
    };
    res.json(response);
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map