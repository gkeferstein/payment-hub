/**
 * Terminal Routes
 * API routes for Stripe Terminal endpoints
 */

import { Router } from 'express';
import { terminalController } from './terminal.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { idempotencyMiddleware } from '../../middleware/idempotency.middleware';

const router = Router();

/**
 * POST /api/v1/terminal/connection-token
 * Generate connection token for Terminal SDK
 * Requires: Authentication
 */
router.post(
  '/connection-token',
  authMiddleware,
  terminalController.createConnectionToken.bind(terminalController)
);

/**
 * POST /api/v1/terminal/payment-intent
 * Create Payment Intent for Terminal payment
 * Requires: Authentication, Idempotency-Key (recommended)
 */
router.post(
  '/payment-intent',
  authMiddleware,
  idempotencyMiddleware,
  terminalController.createTerminalPaymentIntent.bind(terminalController)
);

/**
 * GET /api/v1/terminal/payment/:paymentId/status
 * Get status of terminal payment
 * Requires: Authentication
 */
router.get(
  '/payment/:paymentId/status',
  authMiddleware,
  terminalController.getTerminalPaymentStatus.bind(terminalController)
);

export default router;

