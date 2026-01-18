import { Request, Response, NextFunction } from 'express';
/**
 * Global error handling middleware
 */
export declare function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction): void;
/**
 * 404 handler for unknown routes
 */
export declare function notFoundHandler(req: Request, res: Response, _next: NextFunction): void;
/**
 * Async handler wrapper to catch errors in async route handlers
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map