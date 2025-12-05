/**
 * Orders Controller
 * Handles HTTP requests for order endpoints
 */

import { Request, Response } from 'express';
import { orderService } from '../../../domains/order/services';
import { CreateOrderInput } from '../../../domains/order/models';

export class OrdersController {
  /**
   * GET /api/v1/orders
   * List all orders
   */
  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const status = req.query.status as string;

      let orders;
      if (status) {
        orders = await orderService.getOrdersByStatus(status as any, limit);
      } else {
        // Get all recent orders
        const allStatuses = ['pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        orders = [];
        for (const s of allStatuses) {
          const statusOrders = await orderService.getOrdersByStatus(s as any, 20);
          orders.push(...statusOrders);
        }
        orders = orders.slice(0, limit);
      }

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      console.error('Error listing orders:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to list orders',
          code: 'ORDERS_LIST_FAILED',
        },
      });
    }
  }

  /**
   * POST /api/v1/orders
   * Create a new order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const input: CreateOrderInput = req.body;

      // Create order (service handles validation and idempotency)
      const order = await orderService.createOrder(input);

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Failed to create order',
          code: 'ORDER_CREATION_FAILED',
        },
      });
    }
  }

  /**
   * GET /api/v1/orders/:id
   * Get order by ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const order = await orderService.getOrderById(req.params.id);

      if (!order) {
        res.status(404).json({
          success: false,
          error: {
            message: `Order ${req.params.id} not found`,
            code: 'ORDER_NOT_FOUND',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      console.error('Error getting order:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get order',
          code: 'ORDER_GET_FAILED',
        },
      });
    }
  }

  /**
   * GET /api/v1/orders/by-source/:source/:sourceOrderId
   * Get order by source and source_order_id
   */
  async getOrderBySource(req: Request, res: Response): Promise<void> {
    try {
      const { source, sourceOrderId } = req.params;
      const order = await orderService.getOrderBySource(source, sourceOrderId);

      if (!order) {
        res.status(404).json({
          success: false,
          error: {
            message: `Order not found for source: ${source}, id: ${sourceOrderId}`,
            code: 'ORDER_NOT_FOUND',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      console.error('Error getting order by source:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get order',
          code: 'ORDER_GET_FAILED',
        },
      });
    }
  }

  /**
   * GET /api/v1/orders/:id/history
   * Get order status history
   */
  async getOrderHistory(req: Request, res: Response): Promise<void> {
    try {
      const history = await orderService.getOrderHistory(req.params.id);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Error getting order history:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get order history',
          code: 'ORDER_HISTORY_GET_FAILED',
        },
      });
    }
  }
}

export const ordersController = new OrdersController();
