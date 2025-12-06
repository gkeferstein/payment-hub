# Sandbox/Test Mode - Vollständige Dokumentation

## Übersicht

Der Sandbox-Modus ermöglicht es, das komplette Order Hub System zu testen **ohne echte Zahlungen** durchzuführen. Dies ist ideal für:

- Langzeit-Tests über mehrere Tage
- Integrationstests mit WooCommerce, POS und Stripe
- Entwicklung und Debugging ohne Kostenrisiko
- Validierung der kompletten Payment-Flows

## Aktivierung

### Option 1: Environment-Variable

```bash
# In .env Datei
SANDBOX_MODE=true
```

### Option 2: Docker Compose

```bash
# Mit Sandbox-Override starten
docker-compose -f docker-compose.yml -f docker-compose.sandbox.yml up
```

## Funktionsweise

### Was funktioniert im Sandbox-Modus

✅ **Vollständig funktional:**
- Alle API-Endpunkte funktionieren normal
- Orders und Payments werden in der Datenbank gespeichert
- Status-Transitions werden korrekt verarbeitet
- History-Tabellen werden gefüllt
- Webhook-Simulation ist verfügbar
- Alle Business-Logik wird ausgeführt

### Was NICHT passiert

❌ **Deaktiviert/Simuliert:**
- **Keine echten Stripe API-Calls** - Verwendet Mock-Adapter
- **Keine echten Zahlungen** - Alle Payment Intents sind simuliert
- **Keine echten Callbacks** - Callbacks werden nur geloggt, nicht gesendet
- **Keine Webhook-Signatur-Validierung** - Webhooks können simuliert werden

## Webhook-Simulation

Im Sandbox-Modus können Sie Stripe-Webhooks simulieren, um den kompletten Payment-Flow zu testen.

### Endpunkt

```bash
POST /api/v1/webhooks/simulate
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

### Request Body

```json
{
  "payment_id": "payment-uuid",
  "event_type": "payment_intent.succeeded",
  "delay_ms": 1000  // Optional: Delay before processing
}
```

### Verfügbare Event-Typen

- `payment_intent.succeeded` - Simuliert erfolgreiche Zahlung
- `payment_intent.failed` - Simuliert fehlgeschlagene Zahlung
- `payment_intent.canceled` - Simuliert stornierte Zahlung

### Beispiel

```bash
curl -X POST http://localhost:3000/api/v1/webhooks/simulate \
  -H "Authorization: Bearer test_key_woocommerce" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_type": "payment_intent.succeeded"
  }'
```

## Kompletter Test-Workflow

### 1. Order erstellen

```bash
POST /api/v1/orders
Authorization: Bearer <api-key>
Content-Type: application/json

{
  "source": "woocommerce",
  "source_order_id": "wc_order_123",
  "customer_id": "customer-123",
  "grand_total": 99.99,
  "currency": "EUR",
  "items": [
    {
      "product_id": "prod_123",
      "name": "Test Product",
      "quantity": 1,
      "price": 99.99
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "source": "woocommerce",
    "status": "pending",
    ...
  }
}
```

### 2. Payment erstellen (verwendet Mock-Adapter)

```bash
POST /api/v1/payments
Authorization: Bearer <api-key>
Content-Type: application/json

{
  "order_id": "order-uuid",
  "provider": "stripe",
  "amount": 99.99,
  "currency": "EUR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid",
    "order_id": "order-uuid",
    "provider": "stripe",
    "status": "pending",
    "provider_reference": "pi_mock_...",
    ...
  }
}
```

**Hinweis:** Im Sandbox-Modus wird automatisch der Mock-Adapter verwendet. Sie sehen in den Logs:
```
[SANDBOX] Using mock Stripe adapter for terminal payment
[SANDBOX] Creating mock Stripe Terminal Payment Intent
```

### 3. Webhook simulieren

```bash
POST /api/v1/webhooks/simulate
Authorization: Bearer <api-key>
Content-Type: application/json

{
  "payment_id": "payment-uuid",
  "event_type": "payment_intent.succeeded"
}
```

**Was passiert:**
1. Payment-Status wird auf `succeeded` gesetzt
2. Order-Status wird auf `paid` gesetzt (wenn vollständig bezahlt)
3. Callback wird geloggt (nicht gesendet)

### 4. Status prüfen

```bash
GET /api/v1/orders/order-uuid
GET /api/v1/payments/payment-uuid
```

## Environment-Konfiguration

### Minimale Konfiguration

```bash
# Sandbox Mode aktivieren
SANDBOX_MODE=true

# Datenbank
DB_NAME=order_hub_sandbox
DB_USER=order_hub_user
DB_PASSWORD=test_password

# API Keys
API_KEY_1=test_key_woocommerce
API_KEY_2=test_key_pos
```

### Vollständige Konfiguration

```bash
# Sandbox Mode
SANDBOX_MODE=true

# Datenbank (separate DB für Tests empfohlen)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_hub_sandbox
DB_USER=order_hub_user
DB_PASSWORD=test_password
DB_SSL=false

# API Configuration
PORT=3000
NODE_ENV=development
API_KEY_SECRET=test_api_key_secret
API_KEY_1=test_key_woocommerce
API_KEY_2=test_key_pos
API_KEY_3=test_key_b2b

# Optional: Stripe Test Keys
# Wenn nicht gesetzt, wird Mock-Adapter verwendet (empfohlen für vollständige Simulation)
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_TEST_WEBHOOK_SECRET=whsec_...

# Callback URLs (werden nur geloggt, nicht gesendet)
WOocommerce_CALLBACK_URL=http://localhost:8080/wp-json/order-hub/callback
POS_CALLBACK_URL=http://localhost:8081/api/callbacks/order-hub
B2B_CALLBACK_URL=http://localhost:8082/api/callbacks/order-hub
CALLBACK_SECRET=test_callback_secret

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
```

## Sandbox vs. Production

| Feature | Sandbox Mode | Production Mode |
|---------|-------------|-----------------|
| Stripe API Calls | ❌ Mock-Adapter | ✅ Echte API-Calls |
| Zahlungen | ❌ Simuliert | ✅ Echte Zahlungen |
| Callbacks | ❌ Nur Logging | ✅ Echte HTTP-Calls |
| Webhook-Simulation | ✅ Verfügbar | ❌ Nicht verfügbar |
| Webhook-Signatur | ⚠️ Optional | ✅ Erforderlich |
| Datenbank | ✅ Normale DB | ✅ Normale DB |
| Logging | ✅ Debug-Level | ✅ Info-Level |

## Best Practices

### 1. Separate Datenbank verwenden

Verwenden Sie eine separate Datenbank für Sandbox-Tests:

```bash
DB_NAME=order_hub_sandbox
```

### 2. Test-API-Keys verwenden

Erstellen Sie separate API-Keys für Tests:

```bash
API_KEY_1=test_key_woocommerce
API_KEY_2=test_key_pos
```

### 3. Logs prüfen

Alle Sandbox-Aktionen sind mit `[SANDBOX]` markiert:

```
[SANDBOX] Using mock Stripe adapter for terminal payment
[SANDBOX] Creating mock Stripe Terminal Payment Intent
[SANDBOX] Callback would be sent (not actually sent in sandbox mode)
```

### 4. Webhook-Simulation testen

Testen Sie verschiedene Szenarien:

- Erfolgreiche Zahlung: `payment_intent.succeeded`
- Fehlgeschlagene Zahlung: `payment_intent.failed`
- Stornierte Zahlung: `payment_intent.canceled`

### 5. Callback-Logs prüfen

Sehen Sie, welche Callbacks gesendet worden wären:

```
[SANDBOX] Callback would be sent (not actually sent in sandbox mode): {
  url: 'http://localhost:8080/wp-json/order-hub/callback',
  source: 'woocommerce',
  payload: { ... }
}
```

## Migration zu Production

Wenn Sie bereit sind für Production:

1. **SANDBOX_MODE deaktivieren:**
   ```bash
   SANDBOX_MODE=false
   # oder entfernen
   ```

2. **Echte Stripe API-Keys konfigurieren:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Callback-URLs auf echte Endpunkte setzen:**
   ```bash
   WOocommerce_CALLBACK_URL=https://your-shop.com/wp-json/order-hub/callback
   POS_CALLBACK_URL=https://your-pos.com/api/callbacks/order-hub
   ```

4. **Webhook-Endpunkte in Stripe konfigurieren:**
   - Stripe Dashboard → Webhooks
   - Endpoint: `https://your-domain.com/api/v1/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.failed`, etc.

5. **Tests mit echten Stripe Test-Keys durchführen:**
   - Verwenden Sie Stripe Test-Modus vor Production
   - Testen Sie mit echten Test-Karten
   - Validieren Sie Webhook-Signaturen

## Troubleshooting

### Mock-Adapter wird nicht verwendet

**Problem:** Echte Stripe API-Calls werden gemacht

**Lösung:**
- Prüfen Sie, ob `SANDBOX_MODE=true` gesetzt ist
- Prüfen Sie die Logs auf `[SANDBOX]` Meldungen
- Stellen Sie sicher, dass keine echten Stripe-Keys verwendet werden

### Callbacks werden gesendet

**Problem:** Callbacks werden tatsächlich gesendet, nicht nur geloggt

**Lösung:**
- Prüfen Sie `ConfigService.shouldSendCallbacks()`
- Stellen Sie sicher, dass `SANDBOX_MODE=true` ist

### Webhook-Simulation funktioniert nicht

**Problem:** `/api/v1/webhooks/simulate` gibt Fehler

**Lösung:**
- Prüfen Sie, ob `SANDBOX_MODE=true` ist
- Prüfen Sie, ob der Payment existiert und eine `provider_reference` hat
- Prüfen Sie die API-Key-Authentifizierung

## Zusammenfassung

Der Sandbox-Modus ist ein mächtiges Tool für:

- ✅ Sichere Tests ohne Kostenrisiko
- ✅ Vollständige Flow-Validierung
- ✅ Langzeit-Tests über mehrere Tage
- ✅ Entwicklung und Debugging
- ✅ Integrationstests mit externen Systemen

**Wichtig:** Im Sandbox-Modus werden keine echten Zahlungen durchgeführt. Für Production-Tests verwenden Sie Stripe Test-Modus mit echten Test-Karten.









