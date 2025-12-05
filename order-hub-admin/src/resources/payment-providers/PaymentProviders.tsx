/**
 * Payment Providers Resource
 * Full management UI with blocks.so style
 */

import { 
  List, 
  Datagrid, 
  TextField, 
  BooleanField, 
  DateField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  SelectInput,
  required,
  Show,
  SimpleShowLayout,
  useRecordContext,
  useRefresh,
  useNotify,
} from 'react-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Settings, TestTube } from 'lucide-react';

const ProviderStatusBadge = () => {
  const record = useRecordContext();
  if (!record) return null;

  const getStatusVariant = () => {
    if (!record.enabled) return 'default';
    if (record.last_test_status === 'success') return 'success';
    if (record.last_test_status === 'failed') return 'destructive';
    return 'warning';
  };

  return (
    <Badge variant={getStatusVariant() as any}>
      {record.enabled ? 'Active' : 'Disabled'}
    </Badge>
  );
};

const TestConnectionButton = () => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const notify = useNotify();

  const handleTest = async () => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch(`http://paymentsapi.mojo-institut.de/api/v1/providers/${record.id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const result = await response.json();
      
      if (result.success && result.data.success) {
        notify('Connection test successful', { type: 'success' });
      } else {
        notify(`Test failed: ${result.data?.message || 'Unknown error'}`, { type: 'error' });
      }
      
      refresh();
    } catch (error) {
      notify('Test failed', { type: 'error' });
    }
  };

  return (
    <button onClick={handleTest} className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
      <TestTube className="w-4 h-4 mr-2 inline" />
      Test
    </button>
  );
};

export const PaymentProvidersList = () => (
  <List>
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Payment Providers</CardTitle>
              <CardDescription>
                Manage your payment provider integrations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Datagrid>
            <TextField source="name" />
            <TextField source="provider" />
            <ProviderStatusBadge />
            <DateField source="last_test_at" showTime />
            <TestConnectionButton />
          </Datagrid>
        </CardContent>
      </Card>
    </div>
  </List>
);

export const PaymentProvidersCreate = () => (
  <Create>
    <Card className="max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Add Payment Provider</CardTitle>
        <CardDescription>
          Connect a new payment provider to your system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleForm>
          <SelectInput
            source="provider"
            choices={[
              { id: 'stripe', name: 'Stripe' },
              { id: 'btcpay', name: 'BTCPay Server' },
            ]}
            validate={[required()]}
            fullWidth
          />
          <TextInput source="name" validate={[required()]} fullWidth />
          <TextInput source="description" multiline rows={3} fullWidth />
          <BooleanInput source="enabled" defaultValue={true} />
          <TextInput source="api_key" label="API Key" type="password" fullWidth />
          <TextInput source="api_secret" label="API Secret" type="password" fullWidth />
          <TextInput source="webhook_secret" label="Webhook Secret" type="password" fullWidth />
        </SimpleForm>
      </CardContent>
    </Card>
  </Create>
);

export const PaymentProvidersEdit = () => (
  <Edit>
    <Card className="max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Edit Payment Provider</CardTitle>
        <CardDescription>
          Update payment provider configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleForm>
          <TextInput source="name" validate={[required()]} fullWidth />
          <TextInput source="description" multiline rows={3} fullWidth />
          <BooleanInput source="enabled" />
          <TextInput source="api_key" label="API Key" type="password" helperText="Leave empty to keep current" fullWidth />
          <TextInput source="api_secret" label="API Secret" type="password" helperText="Leave empty to keep current" fullWidth />
          <TextInput source="webhook_secret" label="Webhook Secret" type="password" helperText="Leave empty to keep current" fullWidth />
        </SimpleForm>
      </CardContent>
    </Card>
  </Edit>
);

export const PaymentProvidersShow = () => (
  <Show>
    <Card className="max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Payment Provider Details</CardTitle>
      </CardHeader>
      <CardContent>
        <SimpleShowLayout>
          <TextField source="provider" label="Type" />
          <TextField source="name" />
          <TextField source="description" />
          <BooleanField source="enabled" />
          <DateField source="last_test_at" label="Last Tested" showTime />
          <TextField source="last_test_status" label="Last Test Status" />
          <TextField source="last_test_message" label="Last Test Message" />
          <DateField source="created_at" showTime />
          <DateField source="updated_at" showTime />
        </SimpleShowLayout>
      </CardContent>
    </Card>
  </Show>
);
