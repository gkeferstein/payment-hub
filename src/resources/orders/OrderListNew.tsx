/**
 * Orders List - Custom Implementation with shadcn/ui
 * Uses Table with Accordion from blocks.so style
 */

import { useGetList } from 'react-admin';
import { OrdersTableAccordion } from '@/components/orders-table-accordion';
import { Order } from '@/types';

export const OrderListNew = () => {
  const { data, isLoading, error } = useGetList<Order>('orders', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'created_at', order: 'DESC' },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">Error loading orders</div>
      </div>
    );
  }

  const orders = (data || []) as Order[];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and view all orders from WooCommerce, POS, and B2B channels
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold">{orders.length}</span> orders
        </div>
      </div>

      <OrdersTableAccordion orders={orders} />
    </div>
  );
};














