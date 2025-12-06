# Parallele Integration - Payment Hub ohne Ersetzung der bestehenden Zahlungsstrecke

## Übersicht

Diese Anleitung zeigt, wie Sie WooCommerce oder Ihren POS-Service **parallel** zum Payment Hub verbinden können, **ohne** die laufende direkte Stripe-Verbindung zu ersetzen.

## Problemstellung

Sie haben aktuell:
- ✅ WooCommerce → Stripe (direkt)
- ✅ POS → Stripe (direkt)

Sie möchten:
- ✅ Payment Hub parallel testen
- ✅ Bestehende Zahlungsstrecke bleibt unverändert
- ✅ Schrittweise Migration möglich

## Lösung: Drei Modi

### 1. Shadow Mode (Empfohlen für Start)

**Was passiert:**
- Payment Hub **monitored** alle Orders/Payments
- **Keine aktiven Aktionen** (keine Callbacks, keine Status-Updates)
- Bestehende Stripe-Verbindung läuft normal weiter
- Payment Hub sammelt Daten für Analyse

**Vorteile:**
- ✅ 100% sicher - keine Beeinträchtigung
- ✅ Daten-Sammlung für Vergleich
- ✅ Test der API-Verbindung

**Konfiguration:**
```bash
# In .env
CHANNEL_WOOCOMMERCE_SHADOW_MODE=true
CHANNEL_WOOCOMMERCE_USE_HUB=false
CHANNEL_WOOCOMMERCE_CALLBACK_ENABLED=false

CHANNEL_POS_SHADOW_MODE=true
CHANNEL_POS_USE_HUB=false
CHANNEL_POS_CALLBACK_ENABLED=false
```

### 2. Hybrid Mode (Schrittweise Migration)

**Was passiert:**
- Payment Hub **verarbeitet** Orders/Payments
- **Callbacks werden gesendet** (optional)
- Bestehende Stripe-Verbindung läuft **parallel**
- Sie können pro Order entscheiden, welcher Weg genutzt wird

**Vorteile:**
- ✅ Schrittweise Migration möglich
- ✅ A/B Testing
- ✅ Fallback auf bestehende Strecke

**Konfiguration:**
```bash
# In .env
CHANNEL_WOOCOMMERCE_SHADOW_MODE=false
CHANNEL_WOOCOMMERCE_USE_HUB=true
CHANNEL_WOOCOMMERCE_CALLBACK_ENABLED=true
```

### 3. Full Mode (Vollständige Migration)

**Was passiert:**
- Payment Hub ist **primärer Weg**
- Bestehende Stripe-Verbindung kann als Fallback bleiben
- Alle Orders gehen über Payment Hub

## Setup-Anleitung

### Schritt 1: Payment Hub konfigurieren

```bash
# .env Datei
SANDBOX_MODE=true  # Für Tests ohne echte Zahlungen

# Channel-Konfiguration
CHANNEL_WOOCOMMERCE_SHADOW_MODE=true
CHANNEL_WOOCOMMERCE_USE_HUB=false
CHANNEL_WOOCOMMERCE_CALLBACK_ENABLED=false

CHANNEL_POS_SHADOW_MODE=true
CHANNEL_POS_USE_HUB=false
CHANNEL_POS_CALLBACK_ENABLED=false

# API Keys für Channels
API_KEY_1=test_key_woocommerce
API_KEY_2=test_key_pos

# Callback URLs (werden in Shadow Mode nicht verwendet)
WOocommerce_CALLBACK_URL=https://your-shop.com/wp-json/order-hub/callback
POS_CALLBACK_URL=https://your-pos.com/api/callbacks/order-hub
```

### Schritt 2: WooCommerce Plugin/Integration

Erstellen Sie ein WooCommerce Plugin oder nutzen Sie einen Webhook, der **zusätzlich** zum Payment Hub sendet:

```php
// In WooCommerce: Nach Order-Erstellung
add_action('woocommerce_checkout_order_processed', 'send_order_to_payment_hub', 20, 1);

function send_order_to_payment_hub($order_id) {
    // Bestehende Stripe-Verbindung läuft normal weiter
    // (wird nicht geändert)
    
    // ZUSÄTZLICH: Order an Payment Hub senden (Shadow Mode)
    $order = wc_get_order($order_id);
    
    $payment_hub_url = 'https://payment-hub.example.com/api/v1/orders';
    $api_key = 'test_key_woocommerce';
    
    $response = wp_remote_post($payment_hub_url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type' => 'application/json',
            'Idempotency-Key' => 'wc_' . $order_id . '_' . time(),
        ],
        'body' => json_encode([
            'source' => 'woocommerce',
            'source_order_id' => (string)$order_id,
            'customer_id' => (string)$order->get_customer_id(),
            'grand_total' => (float)$order->get_total(),
            'currency' => $order->get_currency(),
            'items' => array_map(function($item) {
                return [
                    'product_id' => (string)$item->get_product_id(),
                    'name' => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'price' => (float)$item->get_total(),
                ];
            }, $order->get_items()),
            'metadata' => [
                'woocommerce_order_id' => $order_id,
                'original_stripe_payment_intent' => $order->get_meta('_stripe_payment_intent_id'),
            ],
        ]),
        'timeout' => 10,
    ]);
    
    // Log für Debugging
    error_log('Payment Hub Response: ' . wp_remote_retrieve_body($response));
}
```

**Wichtig:** Diese Funktion sendet **zusätzlich** zum Payment Hub, ersetzt **nicht** die bestehende Stripe-Verbindung!

### Schritt 3: POS Integration

Ähnlich für POS - senden Sie Orders **zusätzlich** an Payment Hub:

```javascript
// In POS-System: Nach Order-Erstellung
async function sendOrderToPaymentHub(order) {
    // Bestehende Stripe-Verbindung läuft normal weiter
    
    // ZUSÄTZLICH: Order an Payment Hub senden
    const response = await fetch('https://payment-hub.example.com/api/v1/orders', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer test_key_pos',
            'Content-Type': 'application/json',
            'Idempotency-Key': `pos_${order.id}_${Date.now()}`,
        },
        body: JSON.stringify({
            source: 'pos',
            source_order_id: order.id.toString(),
            customer_id: order.customerId?.toString(),
            grand_total: order.total,
            currency: order.currency || 'EUR',
            items: order.items.map(item => ({
                product_id: item.productId.toString(),
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            metadata: {
                pos_order_id: order.id,
                original_stripe_payment_intent: order.stripePaymentIntentId,
            },
        }),
    });
    
    console.log('Payment Hub Response:', await response.json());
}
```

### Schritt 4: Webhook-Forwarding (Optional)

Wenn Sie Stripe-Webhooks auch an Payment Hub weiterleiten möchten:

**Option A: Stripe Webhook zu beiden Systemen**

In Stripe Dashboard können Sie **mehrere Webhook-Endpunkte** konfigurieren:
1. Bestehender WooCommerce/POS Webhook (bleibt unverändert)
2. Neuer Payment Hub Webhook: `https://payment-hub.example.com/api/v1/webhooks/stripe`

**Option B: Webhook-Proxy**

Erstellen Sie einen Proxy, der Webhooks an beide Systeme weiterleitet:

```javascript
// Webhook-Proxy (z.B. als separater Service)
app.post('/webhook-proxy', async (req, res) => {
    const webhook = req.body;
    
    // 1. Weiterleiten an bestehendes System (WooCommerce/POS)
    await fetch('https://existing-system.com/webhook', {
        method: 'POST',
        body: JSON.stringify(webhook),
    });
    
    // 2. Weiterleiten an Payment Hub
    await fetch('https://payment-hub.example.com/api/v1/webhooks/stripe', {
        method: 'POST',
        headers: {
            'stripe-signature': req.headers['stripe-signature'],
        },
        body: JSON.stringify(webhook),
    });
    
    res.status(200).send('OK');
});
```

## Workflow-Vergleich

### Aktueller Workflow (unverändert)
```
WooCommerce → Stripe (direkt) → Webhook → WooCommerce
POS → Stripe (direkt) → Webhook → POS
```

### Mit Payment Hub (Shadow Mode)
```
WooCommerce → Stripe (direkt) → Webhook → WooCommerce
WooCommerce → Payment Hub (nur Monitoring, keine Aktion)
POS → Stripe (direkt) → Webhook → POS
POS → Payment Hub (nur Monitoring, keine Aktion)
```

### Mit Payment Hub (Hybrid Mode)
```
WooCommerce → Payment Hub → Stripe → Webhook → Payment Hub → Callback → WooCommerce
WooCommerce → Stripe (direkt, als Fallback möglich)
```

## Schrittweise Migration

### Phase 1: Shadow Mode (1-2 Wochen)
- ✅ Payment Hub sammelt Daten
- ✅ Keine Beeinträchtigung
- ✅ Vergleich der Daten

### Phase 2: Hybrid Mode - Test (1 Woche)
- ✅ Einige Orders über Payment Hub
- ✅ Rest über bestehende Strecke
- ✅ Vergleich der Ergebnisse

### Phase 3: Hybrid Mode - Ausweitung (2-4 Wochen)
- ✅ Mehr Orders über Payment Hub
- ✅ Monitoring und Optimierung

### Phase 4: Full Mode (nach erfolgreichen Tests)
- ✅ Alle Orders über Payment Hub
- ✅ Bestehende Strecke als Fallback

## Monitoring & Vergleich

### Payment Hub Dashboard

Im Shadow Mode können Sie im Payment Hub sehen:
- Alle Orders (nur lesend)
- Alle Payments (nur lesend)
- Status-Verläufe
- Vergleich mit bestehender Strecke

### Logs prüfen

```bash
# Payment Hub Logs
docker-compose logs -f backend | grep "SHADOW"

# Sie sehen:
# [SHADOW] Order received from woocommerce (monitoring only)
# [SHADOW] Payment received (monitoring only, no callback)
```

## Troubleshooting

### Problem: Orders werden doppelt erstellt

**Lösung:** Verwenden Sie `Idempotency-Key` Header:
```javascript
'Idempotency-Key': `wc_${orderId}_${timestamp}`
```

### Problem: Callbacks werden gesendet obwohl Shadow Mode aktiv

**Lösung:** Prüfen Sie die Konfiguration:
```bash
CHANNEL_WOOCOMMERCE_SHADOW_MODE=true
CHANNEL_WOOCOMMERCE_CALLBACK_ENABLED=false
```

### Problem: Bestehende Stripe-Verbindung funktioniert nicht mehr

**Lösung:** 
- Prüfen Sie, ob Sie die bestehende Integration geändert haben
- In Shadow Mode sollte **nichts** geändert werden
- Payment Hub sendet nur **zusätzlich**, ersetzt nichts

## Best Practices

1. **Start mit Shadow Mode**: 100% sicher, keine Beeinträchtigung
2. **Separate API Keys**: Verwenden Sie Test-Keys für Payment Hub
3. **Idempotency**: Immer Idempotency-Keys verwenden
4. **Monitoring**: Logs beider Systeme vergleichen
5. **Schrittweise**: Nicht alles auf einmal umstellen

## Zusammenfassung

✅ **Bestehende Zahlungsstrecke bleibt unverändert**
✅ **Payment Hub läuft parallel im Shadow Mode**
✅ **Schrittweise Migration möglich**
✅ **Kein Risiko für laufende Zahlungen**

Die bestehende Stripe-Verbindung wird **nicht ersetzt**, sondern Payment Hub wird **zusätzlich** integriert.









