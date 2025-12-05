/**
 * Orders Routes
 * Defines routes for order endpoints
 */

import { Router } from 'express';
import { ordersController } from './orders.controller';
import {
  authenticateApiKey,
  strictRateLimiter,
  apiRateLimiter,
  checkIdempotency,
} from '../../middleware';

const router = Router();

// All routes require authentication
router.use(authenticateApiKey);

// GET /api/v1/orders - List all orders
router.get('/', apiRateLimiter, (req, res) => ordersController.listOrders(req, res));

// POST /api/v1/orders - Create order (protected, rate limited, idempotent)
router.post('/', checkIdempotency, strictRateLimiter, (req, res) =>
  ordersController.createOrder(req, res)
);

// GET /api/v1/orders/:id - Get order by ID
router.get('/:id', apiRateLimiter, (req, res) => ordersController.getOrderById(req, res));

// GET /api/v1/orders/by-source/:source/:sourceOrderId - Get order by source
router.get('/by-source/:source/:sourceOrderId', apiRateLimiter, (req, res) =>
  ordersController.getOrderBySource(req, res)
);

// GET /api/v1/orders/:id/history - Get order history
router.get('/:id/history', apiRateLimiter, (req, res) =>
  ordersController.getOrderHistory(req, res)
);

export default router;
