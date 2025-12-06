/**
 * API v1 Router
 * Main router for all v1 API endpoints
 */

import { Router } from 'express';
import ordersRoutes from './orders/orders.routes';
import paymentsRoutes from './payments/payments.routes';
import webhooksRoutes from './webhooks/webhooks.routes';
import providersRoutes from './providers/providers.routes';
import terminalRoutes from './terminal/terminal.routes';
import settingsRoutes from './settings/settings.routes';
import apiKeysRoutes from './api-keys/api-keys.routes';

const router = Router();

// Mount routes
router.use('/orders', ordersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/providers', providersRoutes);
router.use('/terminal', terminalRoutes);
router.use('/settings', settingsRoutes);
router.use('/api-keys', apiKeysRoutes);

// API v1 health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

export default router;
