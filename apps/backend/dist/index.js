"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const config_1 = require("./config");
const storage_1 = require("./storage");
const websocket_1 = require("./websocket");
const logger_1 = require("./utils/logger");
/**
 * Main entry point
 */
async function main() {
    logger_1.logger.info('Starting Breath Monitor API...', {
        nodeEnv: config_1.config.nodeEnv,
        port: config_1.config.port
    });
    // Validate configuration
    try {
        (0, config_1.validateConfig)();
    }
    catch (error) {
        logger_1.logger.error('Configuration validation failed', { error });
        process.exit(1);
    }
    // Initialize database
    try {
        await (0, storage_1.initDatabase)();
        await (0, storage_1.initSchema)();
    }
    catch (error) {
        logger_1.logger.error('Database initialization failed', { error });
        process.exit(1);
    }
    // Create Express app
    const app = (0, app_1.createApp)();
    // Create HTTP server
    const server = (0, http_1.createServer)(app);
    // Initialize WebSocket server
    websocket_1.wsServer.init(server);
    // Start server
    server.listen(config_1.config.port, () => {
        logger_1.logger.info(`Server running on port ${config_1.config.port}`);
        logger_1.logger.info(`REST API: http://localhost:${config_1.config.port}/api/${config_1.config.api.version}`);
        logger_1.logger.info(`WebSocket: ws://localhost:${config_1.config.port}${config_1.config.websocket.path}`);
    });
    // Graceful shutdown
    const shutdown = async (signal) => {
        logger_1.logger.info(`Received ${signal}, shutting down gracefully...`);
        // Stop accepting new connections
        server.close(async () => {
            logger_1.logger.info('HTTP server closed');
            // Close WebSocket connections
            await websocket_1.wsServer.close();
            // Close database
            await (0, storage_1.closeDatabase)();
            logger_1.logger.info('Shutdown complete');
            process.exit(0);
        });
        // Force shutdown after 10 seconds
        setTimeout(() => {
            logger_1.logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
// Run
main().catch((error) => {
    logger_1.logger.error('Fatal error', { error });
    process.exit(1);
});
//# sourceMappingURL=index.js.map