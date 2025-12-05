/**
 * Payments Controller
 * Handles HTTP requests for payment endpoints
 */

import { Request, Response } from 'express';
import { paymentService } from '../../../domains/payment/services';
import { CreatePaymentInput } from '../../../domains/payment/models';

export class PaymentsController {
  /**
   * GET /api/v1/payments
   * List all payments
   */
  async listPayments(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const status = req.query.status as string;

      let payments;
      if (status) {
        payments = await paymentService.getPaymentsByStatus(status as any, limit);
      } else {
        // Get all recent payments
        const allStatuses = ['pending', 'processing', 'requires_action', 'succeeded', 'failed', 'cancelled'];
        payments = [];
        for (const s of allStatuses) {
          const statusPayments = await paymentService.getPaymentsByStatus(s as any, 20);
          payments.push(...statusPayments);
        }
        payments = payments.slice(0, limit);
      }

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      console.error('Error listing payments:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to list payments',
          code: 'PAYMENTS_LIST_FAILED',
        },
      });
    }
  }

  /**
   * POST /api/v1/payments
   * Create a new payment
   */
  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const input: CreatePaymentInput = req.body;

      // Create payment (service handles validation)
      const payment = await paymentService.createPayment(input);

      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      console.error('Error creating payment:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Failed to create payment',
          code: 'PAYMENT_CREATION_FAILED',
        },
      });
    }
  }

  /**
   * GET /api/v1/payments/:id
   * Get payment by ID
   */
  async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: {
            message: `Payment ${req.params.id} not found`,
            code: 'PAYMENT_NOT_FOUND',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      console.error('Error getting payment:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get payment',
          code: 'PAYMENT_GET_FAILED',
        },
      });
    }
  }

  /**
   * GET /api/v1/payments/order/:orderId
   * Get all payments for an order
   */
  async getPaymentsByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const payments = await paymentService.getPaymentsByOrderId(req.params.orderId);

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      console.error('Error getting payments by order:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get payments',
          code: 'PAYMENTS_GET_FAILED',
        },
      });
    }
  }

  /**
   * GET /api/v1/payments/:id/history
   * Get payment status history
   */
  async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const history = await paymentService.getPaymentHistory(req.params.id);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Error getting payment history:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get payment history',
          code: 'PAYMENT_HISTORY_GET_FAILED',
        },
      });
    }
  }
}

export const paymentsController = new PaymentsController();
