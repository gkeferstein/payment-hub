/**
 * Terminal Controller
 * Handles HTTP requests for Stripe Terminal endpoints
 */

import { Request, Response } from 'express';
import { paymentService } from '../../../domains/payment/services';
import { orderService } from '../../../domains/order/services';
import { StripeTerminalAdapter } from '../../../adapters/stripe/stripe-terminal.adapter';
import {
  CreateConnectionTokenRequest,
  CreateConnectionTokenResponse,
  CreateTerminalPaymentIntentRequest,
  CreateTerminalPaymentIntentResponse,
  TerminalPaymentStatusResponse,
} from './terminal.types';
import { PaymentMethod } from '../../../domains/payment/models';

export class TerminalController {
  private getStripeTerminalAdapter(): StripeTerminalAdapter {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    return new StripeTerminalAdapter(apiKey);
  }

  /**
   * POST /api/v1/terminal/connection-token
   * Generate a connection token for Terminal SDK
   */
  async createConnectionToken(req: Request, res: Response): Promise<void> {
    try {
      const input: CreateConnectionTokenRequest = req.body;

      const adapter = this.getStripeTerminalAdapter();
      const tokenResponse = await adapter.createConnectionToken(input.location_id);

      const response: CreateConnectionTokenResponse = {
        success: true,
        data: {
          secret: tokenResponse.secret,
          expires_at: tokenResponse.expires_at,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error creating connection token:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to create connection token',
          code: 'CONNECTION_TOKEN_CREATION_FAILED',
        },
      });
    }
  }

  /**
   * POST /api/v1/terminal/payment-intent
   * Create a Payment Intent for Terminal payment collection
   */
  async createTerminalPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const input: CreateTerminalPaymentIntentRequest = req.body;

      // Validate required fields
      if (!input.order_id) {
        res.status(400).json({
          success: false,
          error: {
            message: 'order_id is required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      // Get order to determine amount and currency if not provided
      const order = await orderService.getOrderByIdWithItems(input.order_id);
      if (!order) {
        res.status(404).json({
          success: false,
          error: {
            message: `Order ${input.order_id} not found`,
            code: 'ORDER_NOT_FOUND',
          },
        });
        return;
      }

      const amount = input.amount || order.grand_total;
      const currency = input.currency || order.currency;

      // Create terminal payment via service
      const payment = await paymentService.createTerminalPayment({
        order_id: input.order_id,
        amount,
        currency,
        location_id: input.location_id,
        reader_id: input.reader_id,
        metadata: input.metadata,
      });

      const response: CreateTerminalPaymentIntentResponse = {
        success: true,
        data: {
          payment_id: payment.id,
          payment_intent_id: payment.provider_reference || '',
          connection_token: payment.metadata?.connection_token || '',
          expires_at: payment.metadata?.connection_token_expires_at
            ? parseInt(payment.metadata.connection_token_expires_at)
            : Date.now() + 5 * 60 * 1000,
        },
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error('Error creating terminal payment intent:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to create terminal payment intent',
          code: 'TERMINAL_PAYMENT_INTENT_CREATION_FAILED',
        },
      });
    }
  }

  /**
   * GET /api/v1/terminal/payment/:paymentId/status
   * Get status of a terminal payment
   */
  async getTerminalPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = req.params.paymentId;

      const payment = await paymentService.getPaymentById(paymentId);
      if (!payment) {
        res.status(404).json({
          success: false,
          error: {
            message: `Payment ${paymentId} not found`,
            code: 'PAYMENT_NOT_FOUND',
          },
        });
        return;
      }

      if (!payment.provider_reference) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Payment does not have a provider reference',
            code: 'INVALID_PAYMENT',
          },
        });
        return;
      }

      // Get latest status from Stripe
      const adapter = this.getStripeTerminalAdapter();
      const stripeStatus = await adapter.getPaymentIntentStatus(payment.provider_reference);

      const response: TerminalPaymentStatusResponse = {
        success: true,
        data: {
          payment_id: payment.id,
          payment_intent_id: payment.provider_reference,
          status: stripeStatus.status,
          amount: stripeStatus.amount,
          currency: stripeStatus.currency,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error getting terminal payment status:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get terminal payment status',
          code: 'TERMINAL_PAYMENT_STATUS_FAILED',
        },
      });
    }
  }
}

export const terminalController = new TerminalController();

