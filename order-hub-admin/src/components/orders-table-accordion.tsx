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
import { Order, OrderStatus } from '@/types';
import { format } from 'date-fns';

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

