/**
 * Order Service
 * Business logic layer for order operations
 * Handles validation, status transitions, and history tracking
 */

import { orderRepository, orderStatusHistoryRepository } from '../repositories';
import {
  Order,
  OrderWithItems,
  OrderStatus,
  CreateOrderInput,
  UpdateOrderInput,
  isValidOrderStatusTransition,
} from '../models';

export class OrderService {
  /**
   * Create a new order
   * - Validates input
   * - Checks for duplicates (idempotency)
   * - Creates order with items in transaction
   * - Logs initial status in history
   */
  async createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
    this.validateCreateOrderInput(input);

    const existingOrder = await orderRepository.findBySourceWithItems(
      input.source,
      input.source_order_id
    );

    if (existingOrder) {
      return existingOrder;
    }

    const order = await orderRepository.create(input);
    return order;
  }

  async getOrderById(id: string): Promise<Order | null> {
    return await orderRepository.findById(id);
  }

  async getOrderByIdWithItems(id: string): Promise<OrderWithItems | null> {
    return await orderRepository.findByIdWithItems(id);
  }

  async getOrderBySource(source: string, sourceOrderId: string): Promise<Order | null> {
    return await orderRepository.findBySource(source, sourceOrderId);
  }

  async getOrderBySourceWithItems(
    source: string,
    sourceOrderId: string
  ): Promise<OrderWithItems | null> {
    return await orderRepository.findBySourceWithItems(source, sourceOrderId);
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    changedBy: string = 'system',
    reason?: string
  ): Promise<void> {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (!isValidOrderStatusTransition(order.status, newStatus)) {
      throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
    }

    await orderRepository.updateStatus(orderId, newStatus);

    if (reason) {
      await orderStatusHistoryRepository.create({
        order_id: orderId,
        old_status: order.status,
        new_status: newStatus,
        changed_by: changedBy,
        change_reason: reason,
      });
    }
  }

  async updateOrder(orderId: string, input: UpdateOrderInput): Promise<Order | null> {
    if (input.status) {
      const order = await orderRepository.findById(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }
      if (!isValidOrderStatusTransition(order.status, input.status)) {
        throw new Error(`Invalid status transition from ${order.status} to ${input.status}`);
      }
    }
    return await orderRepository.update(orderId, input);
  }

  async getOrderHistory(orderId: string) {
    return await orderStatusHistoryRepository.getOrderHistory(orderId);
  }

  async getOrdersByCustomer(customerId: string, limit: number = 50): Promise<Order[]> {
    return await orderRepository.findByCustomer(customerId, limit);
  }

  async getOrdersByStatus(status: OrderStatus, limit: number = 100): Promise<Order[]> {
    return await orderRepository.findByStatus(status, limit);
  }

  private validateCreateOrderInput(input: CreateOrderInput): void {
    if (!input.source) {
      throw new Error('Order source is required');
    }
    if (!input.source_order_id) {
      throw new Error('Source order ID is required');
    }
    if (!input.items || input.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    for (const item of input.items) {
      if (!item.name) {
        throw new Error('Item name is required');
      }
      if (item.quantity <= 0) {
        throw new Error('Item quantity must be greater than 0');
      }
      if (item.unit_price < 0) {
        throw new Error('Item unit price cannot be negative');
      }
    }
    if (input.shipping_total && input.shipping_total < 0) {
      throw new Error('Shipping total cannot be negative');
    }
    if (input.discount_total && input.discount_total < 0) {
      throw new Error('Discount total cannot be negative');
    }
  }
}

export const orderService = new OrderService();
