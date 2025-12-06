/**
 * API Documentation Component
 * Complete guide for integrating with paymentsapi.mojo-institut.de
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Code, 
  Key, 
  AlertCircle,
  Webhook,
  RefreshCw,
  Shield,
  Zap,
  CreditCard,
  Settings,
  ShoppingCart,
  CheckCircle2
} from 'lucide-react';

export const ApiDocs = () => {
  const [activeSection, setActiveSection] = useState<'intro' | 'orders' | 'payments' | 'webhooks' | 'callbacks' | 'settings' | 'channels'>('intro');
  const apiBaseUrl = 'https://paymentsapi.mojo-institut.de';

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Complete API Documentation
        </h1>
        <p className="text-muted-foreground mt-2">
          Integration guide for paymentsapi.mojo-institut.de
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
      {[
        { id: 'intro', label: 'Quick Start', icon: Zap },
        { id: 'orders', label: 'Orders API', icon: Code },
        { id: 'payments', label: 'Payments API', icon: CreditCard },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook },
        { id: 'callbacks', label: 'Callbacks', icon: RefreshCw },
        { id: 'settings', label: 'Settings API', icon: Settings },
        { id: 'channels', label: 'Channels', icon: ShoppingCart },
      ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeSection === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'intro' && <IntroSection apiBaseUrl={apiBaseUrl} />}
      {activeSection === 'orders' && <OrdersSection apiBaseUrl={apiBaseUrl} />}
      {activeSection === 'payments' && <PaymentsSection apiBaseUrl={apiBaseUrl} />}
      {activeSection === 'webhooks' && <WebhooksSection apiBaseUrl={apiBaseUrl} />}
      {activeSection === 'callbacks' && <CallbacksSection />}
      {activeSection === 'settings' && <SettingsSection apiBaseUrl={apiBaseUrl} />}
      {activeSection === 'channels' && <ChannelsSection />}
    </div>
  );
};

// Intro Section
const IntroSection = ({ apiBaseUrl }: { apiBaseUrl: string }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>API Base URL</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm">
          {apiBaseUrl}/api/v1
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">All endpoints (except webhooks) require API key authentication:</p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm">
          Authorization: Bearer {'<your-api-key>'}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Available Keys:</p>
          <div className="space-y-2">
            <div className="flex gap-2"><Badge variant="success">mojo_admin_key_2024</Badge><span className="text-sm">Admin</span></div>
            <div className="flex gap-2"><Badge variant="info">mojo_woo_key_2024</Badge><span className="text-sm">WooCommerce</span></div>
            <div className="flex gap-2"><Badge variant="info">mojo_pos_key_2024</Badge><span className="text-sm">POS</span></div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Quick Start: Complete Flow</CardTitle>
        <CardDescription>How to integrate in 3 steps</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <p className="font-medium">Create Order</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">POST /api/v1/orders</code>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <p className="font-medium">Create Payment with Provider & Register in HUB</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">POST /api/v1/payments</code>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <p className="font-medium">Receive Callback when status changes</p>
              <p className="text-xs text-muted-foreground mt-1">HUB sends status updates to your callback URL</p>
            </div>
          </li>
        </ol>
      </CardContent>
    </Card>
  </div>
);

// Orders Section
const OrdersSection = ({ apiBaseUrl }: { apiBaseUrl: string }) => {
  const example = {
    source: 'woo',
    source_order_id: 'WC-12345',
    currency: 'EUR',
    items: [
      { name: 'Product', sku: 'SKU-001', quantity: 2, unit_price: 29.99, tax_rate: 0.19 },
    ],
    shipping_total: 5.99,
    metadata: { customer_email: 'test@example.com' },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>POST /api/v1/orders</CardTitle>
          <CardDescription>Create a new order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`POST ${apiBaseUrl}/api/v1/orders
Authorization: Bearer mojo_woo_key_2024
Idempotency-Key: woo-order-12345
Content-Type: application/json

${JSON.stringify(example, null, 2)}`}</pre>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Required Fields:</p>
            <div className="space-y-1 text-sm">
              <div><code className="bg-muted px-1">source</code> - woo, pos, or b2b</div>
              <div><code className="bg-muted px-1">source_order_id</code> - Your order ID</div>
              <div><code className="bg-muted px-1">items[]</code> - Array with name, quantity, unit_price</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GET /api/v1/orders/:id</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-lg font-mono text-sm">
            GET {apiBaseUrl}/api/v1/orders/{'<order-id>'}?include_items=true
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GET /api/v1/orders/by-source/:source/:id</CardTitle>
          <CardDescription>Find order by your original ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-lg font-mono text-sm">
            GET {apiBaseUrl}/api/v1/orders/by-source/woo/WC-12345
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Payments Section
const PaymentsSection = ({ apiBaseUrl }: { apiBaseUrl: string }) => {
  const example = {
    order_id: 'order-uuid',
    provider: 'stripe',
    payment_method: 'card',
    amount: 99.99,
    provider_payment_id: 'pi_stripe_xyz',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>POST /api/v1/payments</CardTitle>
          <CardDescription>Register a payment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`POST ${apiBaseUrl}/api/v1/payments
Authorization: Bearer mojo_woo_key_2024
Idempotency-Key: payment-12345

${JSON.stringify(example, null, 2)}`}</pre>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Required Fields:</p>
            <div className="space-y-1 text-sm">
              <div><code className="bg-muted px-1">order_id</code> - HUB order UUID</div>
              <div><code className="bg-muted px-1">provider</code> - stripe or btcpay</div>
              <div><code className="bg-muted px-1">amount</code> - Payment amount</div>
              <div><code className="bg-muted px-1">provider_payment_id</code> - Stripe PI / BTCPay Invoice ID</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GET /api/v1/payments/order/:orderId</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-lg font-mono text-sm">
            GET {apiBaseUrl}/api/v1/payments/order/{'<order-id>'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Webhooks Section
const WebhooksSection = ({ apiBaseUrl }: { apiBaseUrl: string }) => (
  <div className="space-y-6">
    <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Payment providers send webhooks to notify the HUB about payment status changes.</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Stripe Webhooks</CardTitle>
        <CardDescription>POST /api/v1/webhooks/stripe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Webhook URL:</p>
          <div className="bg-muted p-3 rounded-lg font-mono text-sm">
            {apiBaseUrl}/api/v1/webhooks/stripe
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Events:</p>
          <div className="space-y-1">
            <div className="flex gap-2"><Badge variant="success">payment_intent.succeeded</Badge></div>
            <div className="flex gap-2"><Badge variant="destructive">payment_intent.failed</Badge></div>
            <div className="flex gap-2"><Badge variant="warning">payment_intent.canceled</Badge></div>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 p-3 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <Shield className="h-4 w-4 inline mr-1" />
            Configure STRIPE_WEBHOOK_SECRET in environment variables
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>BTCPay Webhooks</CardTitle>
        <CardDescription>POST /api/v1/webhooks/btcpay</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Webhook URL:</p>
          <div className="bg-muted p-3 rounded-lg font-mono text-sm">
            {apiBaseUrl}/api/v1/webhooks/btcpay
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Events:</p>
          <div className="space-y-1">
            <div className="flex gap-2"><Badge variant="success">InvoiceSettled</Badge></div>
            <div className="flex gap-2"><Badge variant="destructive">InvoiceExpired</Badge></div>
            <div className="flex gap-2"><Badge variant="warning">InvoiceInvalid</Badge></div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Callbacks Section
const CallbacksSection = () => {
  const callbackExample = {
    order_id: 'order-uuid',
    source: 'woo',
    source_order_id: 'WC-12345',
    status: 'paid',
    payment: {
      payment_id: 'payment-uuid',
      provider: 'stripe',
      status: 'succeeded',
      amount: 99.99,
    },
    timestamp: '2024-01-01T12:00:00Z',
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            HUB → Your System Callbacks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">The HUB sends status updates to your channel when orders/payments change.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Set callback URLs via environment variables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="bg-muted p-3 rounded-lg font-mono text-sm">
            WOO_CALLBACK_URL=https://your-shop.com/wc-api/order-hub
          </div>
          <div className="bg-muted p-3 rounded-lg font-mono text-sm">
            POS_CALLBACK_URL=https://your-pos.com/api/callback
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Callback Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`POST https://your-system.com/callback
X-Order-Hub-Signature: sha256-hmac

${JSON.stringify(callbackExample, null, 2)}`}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Signature Validation (CRITICAL!)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Always validate X-Order-Hub-Signature to prevent fake callbacks!
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">PHP Example:</p>
            <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <pre>{`$signature = $_SERVER['HTTP_X_ORDER_HUB_SIGNATURE'];
$payload = file_get_contents('php://input');
$secret = 'mojo_order_hub_secret_2024_very_secure_key';
$expected = hash_hmac('sha256', $payload, $secret);

if (!hash_equals($expected, $signature)) {
    die('Invalid signature');
}`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retry Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2"><Badge>Max Retries</Badge> 3 attempts</div>
            <div className="flex gap-2"><Badge>Backoff</Badge> Exponential (1s, 2s, 4s)</div>
            <div className="flex gap-2"><Badge>Timeout</Badge> 30 seconds</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings Section
const SettingsSection = ({ apiBaseUrl }: { apiBaseUrl: string }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>GET /api/v1/settings</CardTitle>
        <CardDescription>Get current system settings including Sandbox Mode and Channel configurations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
          <pre>{`GET ${apiBaseUrl}/api/v1/settings
Authorization: Bearer <your-api-key>`}</pre>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Response:</p>
          <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{JSON.stringify({
              success: true,
              data: {
                sandbox_mode: true,
                channels: [
                  {
                    channel: 'woocommerce',
                    use_payment_hub: false,
                    shadow_mode: true,
                    callback_enabled: false,
                  },
                ],
              },
            }, null, 2)}</pre>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>PUT /api/v1/settings/channels/:channel</CardTitle>
        <CardDescription>Update channel configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
          <pre>{`PUT ${apiBaseUrl}/api/v1/settings/channels/woocommerce
Authorization: Bearer <your-api-key>
Content-Type: application/json

{
  "shadow_mode": true,
  "use_payment_hub": false,
  "callback_enabled": false
}`}</pre>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Valid Channels:</p>
          <div className="space-y-1">
            <div className="flex gap-2"><Badge>woocommerce</Badge></div>
            <div className="flex gap-2"><Badge>pos</Badge></div>
            <div className="flex gap-2"><Badge>b2b</Badge></div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Channels Section
const ChannelsSection = () => (
  <div className="space-y-6">
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Channel Integration Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Channels (WooCommerce, POS, B2B) can be configured to run in Shadow Mode (monitoring only)
          or actively use Payment Hub for payment processing.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Shadow Mode</CardTitle>
        <CardDescription>Monitor-only mode - no active processing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 p-3 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            When Shadow Mode is enabled:
          </p>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 ml-6 list-disc">
            <li>Payment Hub only monitors orders/payments</li>
            <li>No callbacks are sent</li>
            <li>No status updates are made</li>
            <li>Perfect for parallel testing without affecting existing flows</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Active Mode</CardTitle>
        <CardDescription>Full Payment Hub integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 p-3 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <CheckCircle2 className="h-4 w-4 inline mr-1" />
            When Active Mode is enabled:
          </p>
          <ul className="text-sm text-green-800 dark:text-green-200 mt-2 ml-6 list-disc">
            <li>Payment Hub processes all orders/payments</li>
            <li>Callbacks are sent to channels</li>
            <li>Status updates are synchronized</li>
            <li>Full integration with payment providers</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ApiDocs;
