/**
 * Payment List (Legacy)
 * Material-UI based payment list
 */

import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  FunctionField,
  Filter,
  TextInput,
  SelectInput,
} from 'react-admin';
import { Chip } from '@mui/material';

const PaymentFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Search" source="q" alwaysOn />
    <SelectInput
      source="status"
      choices={[
        { id: 'pending', name: 'Pending' },
        { id: 'processing', name: 'Processing' },
        { id: 'succeeded', name: 'Succeeded' },
        { id: 'failed', name: 'Failed' },
        { id: 'cancelled', name: 'Cancelled' },
      ]}
    />
    <SelectInput
      source="provider"
      choices={[
        { id: 'stripe', name: 'Stripe' },
        { id: 'btcpay', name: 'BTCPay' },
      ]}
    />
  </Filter>
);

const StatusField = ({ record }: any) => {
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
      size="small"
    />
  );
};

export const PaymentList = () => (
  <List filters={<PaymentFilter />} perPage={25}>
    <Datagrid rowClick="show">
      <TextField source="id" label="Payment ID" />
      <TextField source="order_id" label="Order ID" />
      <TextField source="provider" label="Provider" />
      <TextField source="payment_method" label="Method" />
      <FunctionField label="Status" render={(record: any) => <StatusField record={record} />} />
      <NumberField source="amount" label="Amount" options={{ style: 'currency', currency: 'EUR' }} />
      <DateField source="created_at" label="Created" showTime />
    </Datagrid>
  </List>
);
