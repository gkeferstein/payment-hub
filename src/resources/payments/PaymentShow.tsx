/**
 * Payment Show (Detail View)
 * Material-UI based payment detail page
 */

import {
  Show,
  TabbedShowLayout,
  Tab,
  TextField,
  DateField,
  NumberField,
  FunctionField,
  useRecordContext,
} from 'react-admin';
import { Card, CardContent, Grid, Chip, Typography } from '@mui/material';

const StatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const statusColors: Record<string, string> = {
    pending: 'default',
    processing: 'info',
    succeeded: 'success',
    failed: 'error',
    cancelled: 'warning',
  };

  return (
    <Chip
      label={record.status}
      color={statusColors[record.status] as any}
    />
  );
};

export const PaymentShow = () => (
  <Show>
    <TabbedShowLayout>
      <Tab label="Details">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Information
                </Typography>
                <TextField source="id" label="Payment ID" />
                <TextField source="order_id" label="Order ID" />
                <TextField source="provider" label="Provider" />
                <TextField source="provider_payment_id" label="Provider Payment ID" />
                <TextField source="payment_method" label="Payment Method" />
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
                  Amount Details
                </Typography>
                <NumberField source="amount" label="Amount" options={{ style: 'currency', currency: 'EUR' }} />
                <TextField source="currency" label="Currency" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Tab>
    </TabbedShowLayout>
  </Show>
);
