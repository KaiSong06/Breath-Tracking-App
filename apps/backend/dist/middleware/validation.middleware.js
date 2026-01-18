"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const zod_1 = require("zod");
const errors_1 = require("../types/errors");
/**
 * Create a validation middleware for request body
 */
function validateBody(schema) {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.errors.reduce((acc, err) => {
                    acc[err.path.join('.')] = err.message;
                    return acc;
                }, {});
                throw new errors_1.ValidationError('Invalid request body', details);
            }
            throw error;
        }
    };
}
/**
 * Create a validation middleware for query parameters
 */
function validateQuery(schema) {
    return (req, _res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.errors.reduce((acc, err) => {
                    acc[err.path.join('.')] = err.message;
                    return acc;
                }, {});
                throw new errors_1.ValidationError('Invalid query parameters', details);
            }
            throw error;
        }
    };
}
/**
 * Create a validation middleware for URL parameters
 */
function validateParams(schema) {
    return (req, _res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.errors.reduce((acc, err) => {
                    acc[err.path.join('.')] = err.message;
                    return acc;
                }, {});
                throw new errors_1.ValidationError('Invalid URL parameters', details);
            }
            throw error;
        }
    };
}
//# sourceMappingURL=validation.middleware.js.map