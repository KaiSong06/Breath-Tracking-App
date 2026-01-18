"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceAuth = deviceAuth;
exports.optionalDeviceAuth = optionalDeviceAuth;
const config_1 = require("../config");
const errors_1 = require("../types/errors");
/**
 * Middleware to validate device API key
 * Checks X-Device-Key header against configured API key
 */
function deviceAuth(req, _res, next) {
    const apiKey = req.headers['x-device-key'];
    if (!apiKey) {
        throw new errors_1.AuthenticationError('Missing X-Device-Key header');
    }
    if (apiKey !== config_1.config.deviceApiKey) {
        throw new errors_1.AuthenticationError('Invalid API key');
    }
    next();
}
/**
 * Optional auth - allows requests without key but marks them
 */
function optionalDeviceAuth(req, _res, next) {
    const apiKey = req.headers['x-device-key'];
    // Add flag to request for downstream use
    req.isAuthenticated = apiKey === config_1.config.deviceApiKey;
    next();
}
//# sourceMappingURL=auth.middleware.js.map