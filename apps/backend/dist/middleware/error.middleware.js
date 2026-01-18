"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
const errors_1 = require("../types/errors");
const logger_1 = require("../utils/logger");
/**
 * Global error handling middleware
 */
function errorHandler(error, _req, res, _next) {
    // Log error
    logger_1.logger.error('Request error', {
        error: error.message,
        stack: error.stack,
        name: error.name,
    });
    // Handle known API errors
    if (error instanceof errors_1.ApiError) {
        const response = {
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
            },
            timestamp: Date.now(),
        };
        res.status(error.statusCode).json(response);
        return;
    }
    // Handle unknown errors
    const response = {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        },
        timestamp: Date.now(),
    };
    res.status(500).json(response);
}
/**
 * 404 handler for unknown routes
 */
function notFoundHandler(req, res, _next) {
    const response = {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
        timestamp: Date.now(),
    };
    res.status(404).json(response);
}
/**
 * Async handler wrapper to catch errors in async route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=error.middleware.js.map