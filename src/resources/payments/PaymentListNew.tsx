/**
 * Payments List - Custom Implementation with shadcn/ui
 * Uses Table with Accordion from blocks.so style
 */

import { useGetList } from 'react-admin';
import { PaymentsTableAccordion } from '@/components/payments-table-accordion';
import { Payment } from '@/types';

export const PaymentListNew = () => {
  const { data, isLoading, error } = useGetList<Payment>('payments', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'created_at', order: 'DESC' },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">Error loading payments</div>
      </div>
    );
  }

  const payments = (data || []) as Payment[];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            View and manage payment transactions from Stripe, BTCPay, and other providers
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold">{payments.length}</span> payments
        </div>
      </div>

      <PaymentsTableAccordion payments={payments} />
    </div>
  );
};




