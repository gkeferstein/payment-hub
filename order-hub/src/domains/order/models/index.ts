/**
 * Order Domain Models
 * Export all order-related types and interfaces
 */

export {
  OrderStatus,
  ORDER_STATUS_TRANSITIONS,
  isValidOrderStatusTransition,
} from './order-status.enum';

export type {
  Order,
  OrderWithItems,
  OrderTotals,
  CreateOrderInput,
  UpdateOrderInput,
} from './order.interface';

export type {
  OrderItem,
  CreateOrderItemInput,
} from './order-item.interface';

export { calculateOrderItemTotals } from './order-item.interface';
export { calculateOrderTotals } from './order.interface';

export type {
  OrderStatusHistory,
  CreateOrderStatusHistoryInput,
} from './order-status-history.interface';
