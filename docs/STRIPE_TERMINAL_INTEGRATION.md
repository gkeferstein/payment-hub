# Stripe Terminal Integration

## 🎯 Übersicht

Die Stripe Terminal Integration ermöglicht es, physische Kartenzahlungen über Stripe Terminal Reader zu verarbeiten. Der HUB erstellt Payment Intents und verarbeitet Terminal-Events, während das POS-System das Terminal SDK für die physische Interaktion verwendet.

## 🏗️ Architektur

### Komponenten

1. **Stripe Terminal Adapter** (`/src/adapters/stripe/stripe-terminal.adapter.ts`)
   - Erstellt Connection Tokens für Terminal SDK
   - Erstellt Terminal Payment Intents
   - Verwaltet Terminal-spezifische Stripe-API-Calls

2. **Terminal API Endpoints** (`/src/api/v1/terminal/`)
   - `POST /api/v1/terminal/connection-token` - Connection Token generieren
   - `POST /api/v1/terminal/payment-intent` - Payment Intent für Terminal erstellen
   - `GET /api/v1/terminal/payment/:paymentId/status` - Payment Status abrufen

3. **Payment Service** (`/src/domains/payment/services/payment.service.ts`)
   - `createTerminalPayment()` - Erstellt Terminal Payment mit Payment Intent

4. **Webhook Handler** (`/src/api/v1/webhooks/stripe.webhook.ts`)
   - Verarbeitet Terminal-Events: `terminal.reader.action_*`
   - Aktualisiert Payment/Order Status

## 📡 API Endpoints

### POST /api/v1/terminal/connection-token

Generiert ein Connection Token für das Terminal SDK.

**Request:**
```json
{
  "location_id": "tml_xxx" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "pst_test_xxx",
    "expires_at": 1234567890
  }
}
```

### POST /api/v1/terminal/payment-intent

Erstellt einen Payment Intent für Terminal-Zahlung.

**Request:**
```json
{
  "order_id": "order-uuid",
  "amount": 100.00, // Optional, wird von Order übernommen
  "currency": "EUR", // Optional, wird von Order übernommen
  "location_id": "tml_xxx", // Optional
  "reader_id": "tmr_xxx", // Optional
  "metadata": {} // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "payment-uuid",
    "payment_intent_id": "pi_xxx",
    "connection_token": "pst_test_xxx",
    "expires_at": 1234567890
  }
}
```

### GET /api/v1/terminal/payment/:paymentId/status

Ruft den aktuellen Status eines Terminal Payments ab.

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "payment-uuid",
    "payment_intent_id": "pi_xxx",
    "status": "succeeded",
    "amount": 100.00,
    "currency": "EUR"
  }
}
```

## 🔄 Payment Flow

### 1. Order Creation
```
POS-System → POST /api/v1/orders
→ Order erstellt, Status: pending
```

### 2. Terminal Payment Intent Creation
```
POS-System → POST /api/v1/terminal/payment-intent
{
  "order_id": "...",
  "amount": 100.00
}
→ Payment erstellt
→ Payment Intent bei Stripe erstellt
→ Connection Token generiert
→ Response: { payment_id, payment_intent_id, connection_token }
```

### 3. Terminal Payment Collection
```
POS-System:
- Nutzt Terminal SDK mit connection_token
- Verbindet sich mit Reader
- Startet Payment Collection
- Terminal sammelt Karte
```

### 4. Webhook Processing
```
Stripe → POST /api/v1/webhooks/stripe
Event: payment_intent.succeeded
→ Payment Status: succeeded
→ Order Status: paid (wenn vollständig bezahlt)
→ Callback an POS-System
```

## 🎯 Webhook Events

### Terminal-spezifische Events

- `terminal.reader.action_required` - Terminal benötigt Aktion (z.B. PIN)
- `terminal.reader.action_succeeded` - Terminal-Aktion erfolgreich
- `terminal.reader.action_failed` - Terminal-Aktion fehlgeschlagen

### Payment Intent Events (auch für Terminal)

- `payment_intent.succeeded` - Payment erfolgreich
- `payment_intent.failed` - Payment fehlgeschlagen
- `payment_intent.canceled` - Payment abgebrochen

## 🔒 Sicherheit

### Connection Token
- Kurze TTL (5 Minuten)
- Nur für authentifizierte Requests
- Optional: Location-spezifisch

### Payment Intent
- `capture_method: 'manual'` (empfohlen für Terminal)
- `payment_method_types: ['card_present']`
- Metadata enthält `order_id` für Tracking

## 📊 Payment Method Types

- `terminal_card` - Karte eingesteckt/aufgelegt
- `terminal_tap` - Kontaktlos (NFC)
- `terminal_manual` - Manuelle Eingabe

## 🧪 Testing

### Unit Tests
```bash
npm test -- tests/integration/terminal-integration.test.ts
```

### Integration Tests mit Stripe Test API
1. Stripe Test API Key in `.env` setzen
2. Tests ausführen
3. Tests verwenden Stripe Test Payment Intents

## 🔧 Konfiguration

### Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_xxx  # Stripe Secret Key
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Webhook Secret für Signature-Validierung
```

### Stripe Terminal Setup

1. Terminal Reader in Stripe Dashboard registrieren
2. Terminal Location erstellen
3. Reader mit Location verknüpfen
4. Terminal SDK im POS-System integrieren

## 📝 Best Practices

1. **Connection Token**: Immer frisch generieren, nicht cachen
2. **Payment Intent**: Mit `manual` capture für bessere Kontrolle
3. **Metadata**: Immer `order_id` in Payment Intent Metadata
4. **Error Handling**: Timeout bei Terminal-Collection (30s max)
5. **Webhook Idempotenz**: Events nur einmal verarbeiten

## 🚀 Deployment

1. Stripe API Keys konfigurieren
2. Webhook Endpoint in Stripe Dashboard registrieren
3. Terminal Events aktivieren:
   - `terminal.reader.action_required`
   - `terminal.reader.action_succeeded`
   - `terminal.reader.action_failed`
4. Tests mit Stripe Test API durchführen

## 🔍 Troubleshooting

### Connection Token nicht gültig
- Prüfe: Token nicht abgelaufen (5 Min TTL)
- Prüfe: Location-ID korrekt

### Payment Intent nicht gefunden
- Prüfe: `provider_reference` in Payment gesetzt
- Prüfe: Webhook-Events werden empfangen

### Terminal Reader nicht verbunden
- Prüfe: Reader ist online
- Prüfe: Reader ist mit Location verknüpft
- Prüfe: Connection Token ist gültig

---

**Autor:** MOJO Institut  
**Version:** 1.0.0  
**Stand:** 2025-12-05

