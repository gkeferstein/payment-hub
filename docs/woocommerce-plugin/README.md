# Order Hub WooCommerce Plugin

Professionelles WooCommerce-Plugin für die Integration mit dem Payment Hub.

## Features

- ✅ **Parallel Integration**: Läuft parallel zur bestehenden Stripe-Verbindung
- ✅ **Shadow Mode**: Monitoring-Modus ohne aktive Verarbeitung
- ✅ **Asynchrones Senden**: Blockiert nicht den Checkout-Prozess
- ✅ **Idempotenz**: Verhindert Duplikate bei Retries
- ✅ **Error Handling**: Robuste Fehlerbehandlung mit Logging
- ✅ **REST API Callbacks**: Optional für Status-Updates vom Payment Hub
- ✅ **Admin-Interface**: Einfache Konfiguration über WordPress Settings
- ✅ **Datenbank-Tracking**: Verfolgt gesendete Orders und Fehler

## Installation

### Schritt 1: Plugin hochladen

1. Lade den gesamten `woocommerce-plugin` Ordner nach `wp-content/plugins/order-hub-integration/`
2. Oder erstelle den Ordner manuell und kopiere `order-hub-integration.php` hinein

### Schritt 2: Plugin aktivieren

1. Gehe zu WordPress Admin → Plugins
2. Aktiviere "Order Hub Integration"

### Schritt 3: Konfiguration

1. Gehe zu WordPress Admin → Settings → Order Hub
2. Konfiguriere:
   - **API URL**: `https://paymentsapi.mojo-institut.de/api/v1`
   - **API Key**: Dein API-Key vom Payment Hub (aus Admin-UI)
   - **Enable Integration**: Aktivieren
   - **Shadow Mode**: Für Start empfohlen (nur Monitoring)
   - **Send Asynchronously**: Aktivieren (empfohlen)
   - **Enable Callbacks**: Optional (nur wenn Callbacks aktiviert sind)

### Schritt 4: API-Key erstellen

1. Öffne Payment Hub Admin UI
2. Gehe zu Settings
3. Erstelle einen API-Key für WooCommerce
4. Kopiere den Key in die Plugin-Settings

## Konfiguration

### Shadow Mode (Empfohlen für Start)

- ✅ **Enable Integration**: ON
- ✅ **Shadow Mode**: ON
- ✅ **Enable Callbacks**: OFF
- ✅ **Send Asynchronously**: ON

**Was passiert:**
- Orders werden an Payment Hub gesendet
- Payment Hub speichert sie (nur Monitoring)
- Keine Callbacks werden gesendet
- Bestehende Stripe-Verbindung läuft normal weiter

### Active Mode (Nach Tests)

- ✅ **Enable Integration**: ON
- ✅ **Shadow Mode**: OFF
- ✅ **Enable Callbacks**: ON
- ✅ **Send Asynchronously**: ON

**Was passiert:**
- Orders werden an Payment Hub gesendet
- Payment Hub verarbeitet sie aktiv
- Callbacks werden an WooCommerce gesendet
- Status-Updates werden synchronisiert

## Workflow

### Order-Erstellung

1. Customer kauft in WooCommerce
2. WooCommerce erstellt Order
3. **Bestehende Stripe-Verbindung** verarbeitet Payment (unverändert)
4. **Zusätzlich**: Plugin sendet Order an Payment Hub (asynchron)
5. Payment Hub speichert Order (Shadow Mode: nur Monitoring)

### Payment-Status

1. Stripe sendet Webhook an WooCommerce (wie bisher)
2. WooCommerce aktualisiert Order-Status
3. **Zusätzlich**: Plugin sendet Payment-Info an Payment Hub

### Callbacks (Optional)

Wenn Callbacks aktiviert sind:

1. Payment Hub verarbeitet Payment
2. Payment Hub sendet Callback an WooCommerce REST API
3. Plugin aktualisiert Order-Status in WooCommerce

## API-Endpunkte

### Order erstellen

```
POST /api/v1/orders
Authorization: Bearer <api-key>
Idempotency-Key: wc_<order-id>_<timestamp>
Content-Type: application/json

{
  "source": "woocommerce",
  "source_order_id": "12345",
  "customer_id": "67890",
  "grand_total": 99.99,
  "currency": "EUR",
  "items": [...],
  "metadata": {...}
}
```

### Payment erstellen

```
POST /api/v1/payments
Authorization: Bearer <api-key>
Idempotency-Key: wc_payment_<order-id>_<timestamp>
Content-Type: application/json

{
  "order_id": "<order-hub-id>",
  "source": "woocommerce",
  "provider": "stripe",
  "amount": 99.99,
  "currency": "EUR",
  "status": "succeeded"
}
```

## Datenbank

Das Plugin erstellt eine Tabelle `wp_order_hub_sync` für:

- Tracking gesendeter Orders
- Idempotency-Keys
- Fehler-Logging
- Sync-Status

## Logging

Logs werden in WooCommerce Logs geschrieben:

- **Pfad**: `wp-content/uploads/wc-logs/order-hub-integration-*.log`
- **Levels**: info, error, debug
- **Inhalt**: API-Requests, Responses, Fehler

## Troubleshooting

### Orders werden nicht gesendet

1. Prüfe ob Integration aktiviert ist (Settings)
2. Prüfe API-Key und API-URL
3. Prüfe WooCommerce Logs
4. Teste API-Verbindung (Button in Settings)

### Duplikate

- Das Plugin verwendet Idempotency-Keys
- Bei Retries werden Duplikate automatisch verhindert
- Prüfe `wp_order_hub_sync` Tabelle

### Callbacks funktionieren nicht

1. Prüfe ob Callbacks aktiviert sind (Settings)
2. Prüfe REST API Endpoint: `/wp-json/order-hub/v1/callback`
3. Prüfe Callback-URL in Payment Hub Settings
4. Prüfe WordPress Permalinks (müssen aktiviert sein)

### Performance

- Plugin sendet asynchron (blockiert nicht)
- Bei hohem Traffic: Prüfe API Rate Limits
- Logs können deaktiviert werden (Settings)

## Entwicklung

### Hooks

Das Plugin nutzt folgende WooCommerce Hooks:

- `woocommerce_checkout_order_processed` - Nach Order-Erstellung
- `woocommerce_order_status_changed` - Bei Status-Änderung
- `woocommerce_payment_complete` - Nach Payment

### Filter

Keine Filter verfügbar (kann erweitert werden).

### Actions

Keine Actions verfügbar (kann erweitert werden).

## Sicherheit

- ✅ API-Key-Authentifizierung
- ✅ HTTPS erforderlich (empfohlen)
- ✅ Idempotency-Keys verhindern Duplikate
- ✅ Input-Sanitization
- ✅ Nonce-Verification für Admin-Actions
- ✅ Capability-Checks für Admin-Zugriff

## Support

Bei Problemen:

1. Prüfe WooCommerce Logs
2. Prüfe Payment Hub Logs
3. Teste API-Verbindung
4. Prüfe Browser-Console (für Admin-UI)

## Changelog

### Version 1.0.0
- Initial Release
- Order-Synchronisation
- Payment-Synchronisation
- Shadow Mode Support
- REST API Callbacks
- Admin-Interface

## License

GPL v2 or later









