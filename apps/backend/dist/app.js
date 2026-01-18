"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const middleware_1 = require("./middleware");
const logger_1 = require("./utils/logger");
/**
 * Create and configure Express application
 */
function createApp() {
    const app = (0, express_1.default)();
    // Trust proxy (for Railway and other PaaS)
    app.set('trust proxy', 1);
    // CORS
    app.use((0, cors_1.default)({
        origin: config_1.config.api.corsOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'X-Device-Key'],
    }));
    // Body parsing
    app.use(express_1.default.json({ limit: config_1.config.api.maxBodySize }));
    app.use(express_1.default.urlencoded({ extended: true }));
    // Request logging
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger_1.logger.info('Request', {
                method: req.method,
                path: req.path,
                status: res.statusCode,
                duration,
            });
        });
        next();
    });
    // API routes
    app.use(`/api/${config_1.config.api.version}`, routes_1.default);
    // Root endpoint
    app.get('/', (_req, res) => {
        res.json({
            name: 'Breath Monitor API',
            version: '1.0.0',
            docs: `/api/${config_1.config.api.version}/health`,
        });
    });
    // 404 handler
    app.use(middleware_1.notFoundHandler);
    // Error handler (must be last)
    app.use(middleware_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map