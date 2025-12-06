import { Admin, Resource } from 'react-admin';
import { authProvider } from './providers/authProvider';
import { dataProvider } from './providers/dataProvider';
import { DashboardNew } from './components/DashboardNew';
import { Login } from './components/Login';
import { OrderListNew } from './resources/orders/OrderListNew';
import { PaymentListNew } from './resources/payments/PaymentListNew';
import orders from './resources/orders';
import payments from './resources/payments';
import apiDocs from './resources/api-docs';
import settings from './resources/settings';
import apiKeys from './resources/api-keys';
import { PaymentProvidersList, PaymentProvidersCreate, PaymentProvidersEdit, PaymentProvidersShow } from './resources/payment-providers';
import { CreditCard } from 'lucide-react';

const App = () => (
  <Admin
    authProvider={authProvider}
    dataProvider={dataProvider}
    dashboard={DashboardNew}
    loginPage={Login}
    title="Order Hub Admin - MOJO Institut"
  >
    <Resource name="orders" list={OrderListNew} show={orders.show} icon={orders.icon} />
    <Resource name="payments" list={PaymentListNew} show={payments.show} icon={payments.icon} />
    <Resource name="api-docs" list={apiDocs.list} icon={apiDocs.icon} />
    <Resource 
      name="providers" 
      list={PaymentProvidersList} 
      create={PaymentProvidersCreate}
      edit={PaymentProvidersEdit}
      show={PaymentProvidersShow}
      icon={CreditCard} 
      options={{ label: 'Payment Providers' }}
    />
    <Resource name="settings" list={settings.list} icon={settings.icon} />
    <Resource name="api-keys" list={apiKeys.list} icon={apiKeys.icon} options={{ label: 'API Keys' }} />
  </Admin>
);

export default App;
