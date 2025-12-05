/**
 * Order Show (Detail View)
 * Material-UI based order detail page
 */

import {
  Show,
  TabbedShowLayout,
  Tab,
  TextField,
  DateField,
  NumberField,
  FunctionField,
  ArrayField,
  Datagrid,
  useRecordContext,
} from 'react-admin';
import { Card, CardContent, Grid, Chip, Typography, Box, Alert } from '@mui/material';
import { OrderWithPayments, PaymentStatus } from '../../types';

const StatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const statusColors: Record<string, string> = {
    pending: 'default',
    confirmed: 'primary',
    paid: 'success',
    processing: 'info',
    shipped: 'secondary',
    delivered: 'success',
    cancelled: 'error',
  };

  return (
    <Chip
      label={record.status}
      color={statusColors[record.status] as any}
    />
  );
};

const PaymentStatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const statusColors: Record<PaymentStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    pending: 'default',
    processing: 'info',
    requires_action: 'warning',
    succeeded: 'success',
    failed: 'error',
    cancelled: 'default',
    refunded: 'warning',
  };

  return (
    <Chip
      label={record.status}
      color={statusColors[record.status as PaymentStatus]}
      size="small"
    />
  );
};

const PaymentSummaryCard = () => {
  const record = useRecordContext<OrderWithPayments>();
  if (!record || !record.payment_summary) return null;

  const { payment_summary, grand_total, currency } = record;
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: currency || 'EUR' }).format(amount);

  const isPaid = payment_summary.remaining_amount === 0 && payment_summary.has_successful_payment;
  const isPartiallyPaid = payment_summary.total_paid > 0 && payment_summary.remaining_amount > 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Payment Summary
        </Typography>
        
        {isPaid && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Order fully paid
          </Alert>
        )}
        
        {isPartiallyPaid && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Partially paid - {formatCurrency(payment_summary.remaining_amount)} remaining
          </Alert>
        )}
        
        {!payment_summary.has_successful_payment && payment_summary.payment_count > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Waiting for payment confirmation
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Grand Total
            </Typography>
            <Typography variant="h6">
              {formatCurrency(grand_total)}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Total Paid
            </Typography>
            <Typography variant="h6" color="success.main">
              {formatCurrency(payment_summary.total_paid)}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Remaining
            </Typography>
            <Typography variant="h6" color={payment_summary.remaining_amount > 0 ? 'warning.main' : 'success.main'}>
              {formatCurrency(payment_summary.remaining_amount)}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Refunded
            </Typography>
            <Typography variant="h6" color={payment_summary.total_refunded > 0 ? 'error.main' : 'text.primary'}>
              {formatCurrency(payment_summary.total_refunded)}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Payment Count: <strong>{payment_summary.payment_count}</strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export const OrderShow = () => (
  <Show>
    <TabbedShowLayout>
      <Tab label="Summary">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Information
                </Typography>
                <TextField source="id" label="Order ID" />
                <TextField source="source_order_id" label="Source Order ID" />
                <TextField source="source" label="Source" />
                <FunctionField label="Status" render={() => <StatusField />} />
                <DateField source="created_at" label="Created At" showTime />
                <DateField source="updated_at" label="Updated At" showTime />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Totals
                </Typography>
                <NumberField source="subtotal" label="Subtotal" options={{ style: 'currency', currency: 'EUR' }} />
                <NumberField source="tax_total" label="Tax" options={{ style: 'currency', currency: 'EUR' }} />
                <NumberField source="shipping_total" label="Shipping" options={{ style: 'currency', currency: 'EUR' }} />
                <NumberField source="discount_total" label="Discount" options={{ style: 'currency', currency: 'EUR' }} />
                <NumberField source="grand_total" label="Grand Total" options={{ style: 'currency', currency: 'EUR' }} />
                <TextField source="currency" label="Currency" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Tab>
      <Tab label="Items">
        <ArrayField source="items">
          <Datagrid bulkActionButtons={false}>
            <TextField source="name" label="Product" />
            <TextField source="sku" label="SKU" />
            <NumberField source="quantity" label="Quantity" />
            <NumberField source="unit_price" label="Unit Price" options={{ style: 'currency', currency: 'EUR' }} />
            <NumberField source="tax_rate" label="Tax Rate" options={{ style: 'percent' }} />
          </Datagrid>
        </ArrayField>
      </Tab>
      <Tab label="Payments">
        <PaymentSummaryCard />
        <ArrayField source="payments">
          <Datagrid bulkActionButtons={false}>
            <TextField source="id" label="Payment ID" />
            <TextField source="provider" label="Provider" />
            <TextField source="payment_method" label="Method" />
            <FunctionField label="Status" render={() => <PaymentStatusField />} />
            <NumberField source="amount" label="Amount" options={{ style: 'currency', currency: 'EUR' }} />
            <NumberField source="refunded_amount" label="Refunded" options={{ style: 'currency', currency: 'EUR' }} />
            <TextField source="provider_reference" label="Reference" />
            <DateField source="created_at" label="Created" showTime />
            <DateField source="completed_at" label="Completed" showTime />
          </Datagrid>
        </ArrayField>
      </Tab>
    </TabbedShowLayout>
  </Show>
);
