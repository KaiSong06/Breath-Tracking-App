interface LogContext {
    [key: string]: unknown;
}
/**
 * Simple structured logger
 * In production, consider using winston or pino
 */
declare class Logger {
    private shouldLog;
    private formatMessage;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map