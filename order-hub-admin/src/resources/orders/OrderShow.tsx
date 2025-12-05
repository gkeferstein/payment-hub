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
import { Card, CardContent, Grid, Chip, Typography } from '@mui/material';

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
    </TabbedShowLayout>
  </Show>
);
