/**
 * Orders Table with Accordion
 * Inspired by blocks.so table-accordion design
 * Expandable rows for order details
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus, OrderWithPayments, PaymentStatus } from '@/types';
import { format } from 'date-fns';
import { useGetOne } from 'react-admin';

interface OrdersTableProps {
  orders: Order[];
}

const statusVariants: Record<OrderStatus, 'default' | 'success' | 'warning' | 'destructive' | 'info'> = {
  pending: 'default',
  confirmed: 'info',
  paid: 'success',
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'destructive',
  refunded: 'destructive',
};

const paymentStatusVariants: Record<PaymentStatus, 'default' | 'success' | 'warning' | 'destructive' | 'info'> = {
  pending: 'default',
  processing: 'info',
  requires_action: 'warning',
  succeeded: 'success',
  failed: 'destructive',
  cancelled: 'default',
  refunded: 'warning',
};

function OrderPaymentsSection({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error } = useGetOne<OrderWithPayments>('orders', { id: orderId });

  if (isLoading) {
    return (
      <div className="md:col-span-2 space-y-2">
        <h4 className="font-semibold text-sm">Payments</h4>
        <p className="text-sm text-muted-foreground">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="md:col-span-2 space-y-2">
        <h4 className="font-semibold text-sm">Payments</h4>
        <p className="text-sm text-destructive">Error loading payments</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="md:col-span-2 space-y-2">
        <h4 className="font-semibold text-sm">Payments</h4>
        <p className="text-sm text-muted-foreground">Order not found</p>
      </div>
    );
  }

  if (!order.payments || order.payments.length === 0) {
    return (
      <div className="md:col-span-2 space-y-2">
        <h4 className="font-semibold text-sm">Payments</h4>
        <p className="text-sm text-muted-foreground">No payments found for this order</p>
      </div>
    );
  }

  const { payments, payment_summary } = order;
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: order.currency || 'EUR' }).format(amount);

  const isPaid = payment_summary?.remaining_amount === 0 && payment_summary?.has_successful_payment;
  const isPartiallyPaid = payment_summary && payment_summary.total_paid > 0 && payment_summary.remaining_amount > 0;

  return (
    <div className="md:col-span-2 space-y-3">
      <h4 className="font-semibold text-sm">Payments</h4>
      
      {/* Payment Summary */}
      {payment_summary && (
        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
          {isPaid && (
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <p className="text-green-800 text-sm font-medium">
                ✅ Order fully paid
              </p>
            </div>
          )}
          
          {isPartiallyPaid && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-yellow-800 text-sm font-medium">
                ⚠️ Partially paid - {formatCurrency(payment_summary.remaining_amount)} remaining
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Total Paid</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(payment_summary.total_paid)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className={`font-semibold ${payment_summary.remaining_amount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {formatCurrency(payment_summary.remaining_amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Refunded</p>
              <p className={`font-semibold ${payment_summary.total_refunded > 0 ? 'text-red-600' : ''}`}>
                {formatCurrency(payment_summary.total_refunded)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Count</p>
              <p className="font-semibold">{payment_summary.payment_count}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="space-y-2">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex justify-between items-start p-3 rounded-lg border"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={paymentStatusVariants[payment.status]}>
                  {payment.status}
                </Badge>
                <span className="text-sm font-medium">{payment.provider}</span>
                {payment.payment_method && (
                  <span className="text-xs text-muted-foreground">
                    ({payment.payment_method})
                  </span>
                )}
              </div>
              {payment.provider_reference && (
                <p className="text-xs text-muted-foreground font-mono">
                  {payment.provider_reference}
                </p>
              )}
              {payment.completed_at && (
                <p className="text-xs text-muted-foreground">
                  Completed: {format(new Date(payment.completed_at), 'PPpp')}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(payment.amount)}</p>
              {payment.refunded_amount > 0 && (
                <p className="text-xs text-red-600">
                  Refunded: {formatCurrency(payment.refunded_amount)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrdersTableAccordion({ orders }: OrdersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <Accordion type="single" collapsible asChild>
            <>
              {orders.map((order) => (
                <AccordionItem key={order.id} value={order.id} asChild>
                  <>
                    <TableRow className="group">
                      <TableCell>
                        <AccordionTrigger className="flex items-center justify-center p-0" />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {order.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[order.status]}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {order.currency} {order.grand_total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <AccordionContent className="px-4 pb-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            {/* Order Details */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Order Details</h4>
                              <dl className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Full Order ID:</dt>
                                  <dd className="font-mono text-xs">{order.id}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Source Order ID:</dt>
                                  <dd className="font-medium">{order.source_order_id}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Currency:</dt>
                                  <dd>{order.currency}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Created:</dt>
                                  <dd>{format(new Date(order.created_at), 'PPpp')}</dd>
                                </div>
                              </dl>
                            </div>

                            {/* Totals */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Totals</h4>
                              <dl className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Subtotal:</dt>
                                  <dd>€{order.subtotal.toFixed(2)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Tax:</dt>
                                  <dd>€{order.tax_total.toFixed(2)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Shipping:</dt>
                                  <dd>€{order.shipping_total.toFixed(2)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Discount:</dt>
                                  <dd>-€{order.discount_total.toFixed(2)}</dd>
                                </div>
                                <div className="flex justify-between font-bold pt-2 border-t">
                                  <dt>Grand Total:</dt>
                                  <dd>€{order.grand_total.toFixed(2)}</dd>
                                </div>
                              </dl>
                            </div>

                            {/* Items */}
                            {order.items && order.items.length > 0 && (
                              <div className="md:col-span-2 space-y-2">
                                <h4 className="font-semibold text-sm">Items</h4>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex justify-between items-start p-3 rounded-lg bg-muted/50"
                                    >
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        {item.sku && (
                                          <p className="text-xs text-muted-foreground">
                                            SKU: {item.sku}
                                          </p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                          Qty: {item.quantity} × €{item.unit_price.toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium">
                                          €{item.total_price.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          +€{item.tax_amount.toFixed(2)} tax
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Payments Section */}
                            <OrderPaymentsSection orderId={order.id} />
                          </div>
                        </AccordionContent>
                      </TableCell>
                    </TableRow>
                  </>
                </AccordionItem>
              ))}
            </>
          </Accordion>
        </TableBody>
      </Table>
    </div>
  );
}

