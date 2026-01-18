import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to validate device API key
 * Checks X-Device-Key header against configured API key
 */
export declare function deviceAuth(req: Request, _res: Response, next: NextFunction): void;
/**
 * Optional auth - allows requests without key but marks them
 */
export declare function optionalDeviceAuth(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map