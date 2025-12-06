/**
 * Payments Table with Accordion
 * Clean blocks.so style for payment management
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Payment, PaymentStatus } from '@/types';
import { format } from 'date-fns';

interface PaymentsTableProps {
  payments: Payment[];
}

const statusVariants: Record<PaymentStatus, 'default' | 'success' | 'warning' | 'destructive' | 'info'> = {
  pending: 'default',
  processing: 'warning',
  requires_action: 'info',
  succeeded: 'success',
  failed: 'destructive',
  cancelled: 'default',
  refunded: 'destructive',
};

export function PaymentsTableAccordion({ payments }: PaymentsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Payment ID</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <Accordion type="single" collapsible asChild>
            <>
              {payments.map((payment) => (
                <AccordionItem key={payment.id} value={payment.id} asChild>
                  <>
                    <TableRow className="group">
                      <TableCell>
                        <AccordionTrigger className="flex items-center justify-center p-0" />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.provider}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.payment_method || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[payment.status]}>{payment.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {payment.currency} {payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(payment.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <AccordionContent className="px-4 pb-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            {/* Payment Details */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Payment Information</h4>
                              <dl className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Full ID:</dt>
                                  <dd className="font-mono text-xs">{payment.id}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Order ID:</dt>
                                  <dd className="font-mono text-xs">{payment.order_id}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Provider Ref:</dt>
                                  <dd className="font-mono text-xs">
                                    {payment.provider_reference || '-'}
                                  </dd>
                                </div>
                              </dl>
                            </div>

                            {/* Amount Details */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Amount Details</h4>
                              <dl className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Amount:</dt>
                                  <dd className="font-medium">€{payment.amount.toFixed(2)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Refunded:</dt>
                                  <dd>€{payment.refunded_amount.toFixed(2)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Currency:</dt>
                                  <dd>{payment.currency}</dd>
                                </div>
                              </dl>
                            </div>

                            {/* Timestamps */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Dates</h4>
                              <dl className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Created:</dt>
                                  <dd>{format(new Date(payment.created_at), 'PPpp')}</dd>
                                </div>
                                {payment.completed_at && (
                                  <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Completed:</dt>
                                    <dd>{format(new Date(payment.completed_at), 'PPpp')}</dd>
                                  </div>
                                )}
                              </dl>
                            </div>

                            {/* Failure Info (if failed) */}
                            {payment.failure_message && (
                              <div className="md:col-span-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                <h4 className="font-semibold text-sm text-destructive mb-1">
                                  Failure Information
                                </h4>
                                <p className="text-sm">{payment.failure_message}</p>
                                {payment.failure_code && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Code: {payment.failure_code}
                                  </p>
                                )}
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














