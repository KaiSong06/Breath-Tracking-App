import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { AuthenticationError } from '../types/errors';

/**
 * Middleware to validate device API key
 * Checks X-Device-Key header against configured API key
 */
export function deviceAuth(
  req: Request, 
  _res: Response, 
  next: NextFunction
): void {
  const apiKey = req.headers['x-device-key'];

  if (!apiKey) {
    throw new AuthenticationError('Missing X-Device-Key header');
  }

  if (apiKey !== config.deviceApiKey) {
    throw new AuthenticationError('Invalid API key');
  }

  next();
}

/**
 * Optional auth - allows requests without key but marks them
 */
export function optionalDeviceAuth(
  req: Request, 
  _res: Response, 
  next: NextFunction
): void {
  const apiKey = req.headers['x-device-key'];
  
  // Add flag to request for downstream use
  (req as any).isAuthenticated = apiKey === config.deviceApiKey;
  
  next();
}

