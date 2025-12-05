/**
 * Authentication Middleware
 * Validates API keys for protected endpoints
 */

import { Request, Response, NextFunction } from 'express';

/**
 * API Key authentication middleware
 * Validates the API key from the Authorization header
 * 
 * Usage: Authorization: Bearer <api_key>
 */
export function authenticateApiKey(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Missing Authorization header',
        code: 'UNAUTHORIZED',
      },
    });
    return;
  }

  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid Authorization header format. Use: Bearer <api_key>',
        code: 'UNAUTHORIZED',
      },
    });
    return;
  }

  const apiKey = authHeader.substring(7);

  if (!apiKey || apiKey.length < 10) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid API key format',
        code: 'UNAUTHORIZED',
      },
    });
    return;
  }

  (req as any).apiKey = apiKey;
  next();
}
