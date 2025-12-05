/**
 * Order Repository
 * Data access layer for orders table
 * Implements Repository Pattern with CRUD operations
 */

import { db } from '../../../infrastructure/database';
import {
  Order,
  OrderWithItems,
  OrderStatus,
  CreateOrderInput,
  UpdateOrderInput,
  calculateOrderTotals,
} from '../models';
import { OrderItem, calculateOrderItemTotals } from '../models';

export class OrderRepository {
  private readonly tableName = 'orders';
  private readonly itemsTableName = 'order_items';

  /**
   * Create a new order with items
   * Uses transaction to ensure atomicity
   */
  async create(input: CreateOrderInput): Promise<OrderWithItems> {
    return await db.transaction(async (trx) => {
      const totals = calculateOrderTotals(
        input.items,
        input.shipping_total || 0,
        input.discount_total || 0
      );

      const [order] = await trx(this.tableName)
        .insert({
          customer_id: input.customer_id,
          source: input.source,
          source_order_id: input.source_order_id,
          status: OrderStatus.PENDING,
          currency: input.currency || 'EUR',
          subtotal: totals.subtotal,
          tax_total: totals.tax_total,
          shipping_total: totals.shipping_total,
          discount_total: totals.discount_total,
          grand_total: totals.grand_total,
          totals: JSON.stringify(totals),
          metadata: input.metadata ? JSON.stringify(input.metadata) : '{}',
        })
        .returning('*');

      const itemsToInsert = input.items.map((item) => {
        const itemTotals = calculateOrderItemTotals(item);
        return {
          order_id: order.id,
          name: item.name,
          sku: item.sku,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: itemTotals.total_price,
          tax_rate: item.tax_rate || 0,
          tax_amount: itemTotals.tax_amount,
          metadata: item.metadata ? JSON.stringify(item.metadata) : '{}',
        };
      });

      const items = await trx(this.itemsTableName).insert(itemsToInsert).returning('*');

      return {
        ...this.mapToOrder(order),
        items: items.map((i) => this.mapToOrderItem(i)),
      };
    });
  }

  async findById(id: string): Promise<Order | null> {
    const order = await db(this.tableName).where({ id }).first();
    if (!order) {
      return null;
    }
    return this.mapToOrder(order);
  }

  async findByIdWithItems(id: string): Promise<OrderWithItems | null> {
    const order = await this.findById(id);
    if (!order) {
      return null;
    }
    const items = await db(this.itemsTableName).where({ order_id: id });
    return {
      ...order,
      items: items.map((i) => this.mapToOrderItem(i)),
    };
  }

  async findBySource(source: string, sourceOrderId: string): Promise<Order | null> {
    const order = await db(this.tableName)
      .where({ source, source_order_id: sourceOrderId })
      .first();
    if (!order) {
      return null;
    }
    return this.mapToOrder(order);
  }

  async findBySourceWithItems(
    source: string,
    sourceOrderId: string
  ): Promise<OrderWithItems | null> {
    const order = await this.findBySource(source, sourceOrderId);
    if (!order) {
      return null;
    }
    const items = await db(this.itemsTableName).where({ order_id: order.id });
    return {
      ...order,
      items: items.map((i) => this.mapToOrderItem(i)),
    };
  }

  async updateStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    await db(this.tableName).where({ id: orderId }).update({
      status: newStatus,
      updated_at: new Date(),
    });
  }

  async update(orderId: string, input: UpdateOrderInput): Promise<Order | null> {
    const updateData: any = {
      updated_at: new Date(),
    };
    if (input.status) updateData.status = input.status;
    if (input.metadata) updateData.metadata = JSON.stringify(input.metadata);

    const [order] = await db(this.tableName)
      .where({ id: orderId })
      .update(updateData)
      .returning('*');
    if (!order) {
      return null;
    }
    return this.mapToOrder(order);
  }

  async findByCustomer(customerId: string, limit: number = 50): Promise<Order[]> {
    const orders = await db(this.tableName)
      .where({ customer_id: customerId })
      .orderBy('created_at', 'desc')
      .limit(limit);
    return orders.map((o) => this.mapToOrder(o));
  }

  async findByStatus(status: OrderStatus, limit: number = 100): Promise<Order[]> {
    const orders = await db(this.tableName)
      .where({ status })
      .orderBy('created_at', 'desc')
      .limit(limit);
    return orders.map((o) => this.mapToOrder(o));
  }

  private mapToOrder(row: any): Order {
    return {
      id: row.id,
      customer_id: row.customer_id,
      source: row.source,
      source_order_id: row.source_order_id,
      status: row.status as OrderStatus,
      currency: row.currency,
      subtotal: parseFloat(row.subtotal),
      tax_total: parseFloat(row.tax_total),
      shipping_total: parseFloat(row.shipping_total),
      discount_total: parseFloat(row.discount_total),
      grand_total: parseFloat(row.grand_total),
      totals: typeof row.totals === 'string' ? JSON.parse(row.totals) : row.totals,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  private mapToOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      order_id: row.order_id,
      name: row.name,
      sku: row.sku,
      description: row.description,
      quantity: row.quantity,
      unit_price: parseFloat(row.unit_price),
      total_price: parseFloat(row.total_price),
      tax_rate: parseFloat(row.tax_rate),
      tax_amount: parseFloat(row.tax_amount),
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}

export const orderRepository = new OrderRepository();
