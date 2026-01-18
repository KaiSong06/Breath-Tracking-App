"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const config_1 = require("../config");
/**
 * Simple structured logger
 * In production, consider using winston or pino
 */
class Logger {
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const minLevel = config_1.config.nodeEnv === 'production' ? 'info' : 'debug';
        return levels.indexOf(level) >= levels.indexOf(minLevel);
    }
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const base = { timestamp, level, message };
        const logObject = context ? { ...base, ...context } : base;
        return JSON.stringify(logObject);
    }
    debug(message, context) {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', message, context));
        }
    }
    info(message, context) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message, context));
        }
    }
    warn(message, context) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, context));
        }
    }
    error(message, context) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, context));
        }
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map