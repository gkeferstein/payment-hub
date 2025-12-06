/**
 * Authentication Middleware
 * Validates API keys for protected endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../../infrastructure/auth/api-key.service';

// Cache for API key service (singleton)
let apiKeyService: ApiKeyService | null = null;

function getApiKeyService(): ApiKeyService {
  if (!apiKeyService) {
    apiKeyService = new ApiKeyService();
  }
  return apiKeyService;
}

/**
 * API Key authentication middleware
 * Validates the API key from the Authorization header against database
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

  const plainKey = authHeader.substring(7);

  if (!plainKey || plainKey.length < 10) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid API key format',
        code: 'UNAUTHORIZED',
      },
    });
    return;
  }

  // Validate against database (async)
  const service = getApiKeyService();
  service.validate(plainKey)
    .then((apiKey) => {
      if (!apiKey) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid or expired API key',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      // Attach API key info to request
      (req as any).apiKey = plainKey;
      (req as any).apiKeyInfo = apiKey;
      next();
    })
    .catch((error: any) => {
      console.error('Error validating API key:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error validating API key',
          code: 'INTERNAL_ERROR',
        },
      });
    });
}
