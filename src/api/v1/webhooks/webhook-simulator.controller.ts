/**
 * Webhook Simulator Controller
 * Handles HTTP requests for webhook simulation endpoints
 * Only available in SANDBOX_MODE
 */

import { Request, Response } from 'express';
import { webhookSimulatorService } from './webhook-simulator.service';

export class WebhookSimulatorController {
  /**
   * POST /api/v1/webhooks/simulate
   * Simulate a Stripe webhook event
   * Only works in SANDBOX_MODE
   */
  async simulateWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (process.env.SANDBOX_MODE !== 'true' && process.env.SANDBOX_MODE !== '1') {
        res.status(403).json({
          success: false,
          error: {
            message: 'Webhook simulation is only available in SANDBOX_MODE',
            code: 'SANDBOX_MODE_REQUIRED',
          },
        });
        return;
      }

      const { payment_id, event_type, delay_ms } = req.body;

      if (!payment_id) {
        res.status(400).json({
          success: false,
          error: {
            message: 'payment_id is required',
            code: 'MISSING_PAYMENT_ID',
          },
        });
        return;
      }

      if (!event_type) {
        res.status(400).json({
          success: false,
          error: {
            message: 'event_type is required (payment_intent.succeeded, payment_intent.failed, payment_intent.canceled)',
            code: 'MISSING_EVENT_TYPE',
          },
        });
        return;
      }

      await webhookSimulatorService.simulateStripeWebhook({
        payment_id,
        event_type,
        delay_ms,
      });

      res.status(200).json({
        success: true,
        message: `Webhook event ${event_type} simulated successfully`,
        data: {
          payment_id,
          event_type,
        },
      });
    } catch (error: any) {
      console.error('Error simulating webhook:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error simulating webhook',
          code: 'WEBHOOK_SIMULATION_ERROR',
        },
      });
    }
  }
}

export const webhookSimulatorController = new WebhookSimulatorController();









