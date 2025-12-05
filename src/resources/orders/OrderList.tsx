/**
 * Order List (Legacy)
 * Material-UI based order list
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

const OrderFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Search" source="q" alwaysOn />
    <SelectInput
      source="status"
      choices={[
        { id: 'pending', name: 'Pending' },
        { id: 'confirmed', name: 'Confirmed' },
        { id: 'paid', name: 'Paid' },
        { id: 'processing', name: 'Processing' },
        { id: 'shipped', name: 'Shipped' },
        { id: 'delivered', name: 'Delivered' },
        { id: 'cancelled', name: 'Cancelled' },
      ]}
    />
    <SelectInput
      source="source"
      choices={[
        { id: 'woo', name: 'WooCommerce' },
        { id: 'pos', name: 'POS' },
        { id: 'b2b', name: 'B2B' },
      ]}
    />
  </Filter>
);

const StatusField = ({ record }: any) => {
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
      size="small"
    />
  );
};

export const OrderList = () => (
  <List filters={<OrderFilter />} perPage={25}>
    <Datagrid rowClick="show">
      <TextField source="id" label="Order ID" />
      <TextField source="source_order_id" label="Source Order ID" />
      <TextField source="source" label="Source" />
      <FunctionField label="Status" render={(record: any) => <StatusField record={record} />} />
      <NumberField source="grand_total" label="Total" options={{ style: 'currency', currency: 'EUR' }} />
      <TextField source="currency" label="Currency" />
      <DateField source="created_at" label="Created" showTime />
    </Datagrid>
  </List>
);
