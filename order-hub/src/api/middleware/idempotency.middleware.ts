/**
 * Idempotency Middleware
 * Ensures that duplicate requests with the same Idempotency-Key return the same response
 * 
 * Usage: Add "Idempotency-Key: <unique-key>" header to POST/PUT/PATCH requests
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../../infrastructure/database';

/**
 * Idempotency middleware
 * Checks if request with this Idempotency-Key was already processed
 */
export async function checkIdempotency(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    next();
    return;
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    next();
    return;
  }

  try {
    const existing = await db('idempotency_keys')
      .where({
        key: idempotencyKey,
        endpoint: req.path,
        method: req.method,
      })
      .where('expires_at', '>', new Date())
      .first();

    if (existing) {
      res.status(existing.status_code).json(existing.response_body);
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      db('idempotency_keys')
        .insert({
          key: idempotencyKey,
          endpoint: req.path,
          method: req.method,
          status_code: res.statusCode,
          response_body: body,
          created_at: new Date(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        })
        .catch((err) => {
          console.error('Error storing idempotency key:', err);
        });

      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('Error checking idempotency:', error);
    next();
  }
}
