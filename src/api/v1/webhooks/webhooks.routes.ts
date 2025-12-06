/**
 * Webhooks Routes
 * Defines routes for webhook endpoints
 * 
 * Note: Webhook endpoints should NOT require API key authentication
 * They use signature validation instead
 * Exception: /simulate endpoint requires API key (only in SANDBOX_MODE)
 */

import { Router } from 'express';
import { handleStripeWebhook } from './stripe.webhook';
import { webhookSimulatorController } from './webhook-simulator.controller';
import { authenticateApiKey } from '../../middleware';

const router = Router();

// Stripe webhook - requires raw body for signature verification
router.post('/stripe', handleStripeWebhook);

// BTCPay webhook - placeholder for future implementation
router.post('/btcpay', (_req, res) => {
  res.status(501).json({ message: 'BTCPay webhook not yet implemented' });
});

// Webhook simulator - only available in SANDBOX_MODE, requires API key
router.post('/simulate', authenticateApiKey, (req, res) => {
  webhookSimulatorController.simulateWebhook(req, res);
});

// Health check for webhooks
router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Webhook endpoints are ready',
  });
});

export default router;
