import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Create a validation middleware for request body
 */
export declare function validateBody<T>(schema: ZodSchema<T>): (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Create a validation middleware for query parameters
 */
export declare function validateQuery<T>(schema: ZodSchema<T>): (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Create a validation middleware for URL parameters
 */
export declare function validateParams<T>(schema: ZodSchema<T>): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map