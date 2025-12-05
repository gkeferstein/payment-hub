/**
 * Payments Routes
 * Defines routes for payment endpoints
 */

import { Router } from 'express';
import { paymentsController } from './payments.controller';
import {
  authenticateApiKey,
  strictRateLimiter,
  apiRateLimiter,
  checkIdempotency,
} from '../../middleware';

const router = Router();

// All routes require authentication
router.use(authenticateApiKey);

// GET /api/v1/payments - List all payments
router.get('/', apiRateLimiter, (req, res) => paymentsController.listPayments(req, res));

// POST /api/v1/payments - Create payment (rate limited, idempotent)
router.post('/', checkIdempotency, strictRateLimiter, (req, res) =>
  paymentsController.createPayment(req, res)
);

// GET /api/v1/payments/:id - Get payment by ID
router.get('/:id', apiRateLimiter, (req, res) => paymentsController.getPaymentById(req, res));

// GET /api/v1/payments/order/:orderId - Get all payments for an order
router.get('/order/:orderId', apiRateLimiter, (req, res) =>
  paymentsController.getPaymentsByOrderId(req, res)
);

// GET /api/v1/payments/:id/history - Get payment history
router.get('/:id/history', apiRateLimiter, (req, res) =>
  paymentsController.getPaymentHistory(req, res)
);

export default router;
