# Installation Guide - Order Hub WooCommerce Plugin

## Schritt-für-Schritt Anleitung

### Voraussetzungen

- WordPress 5.8+
- WooCommerce 5.0+
- PHP 7.4+
- HTTPS (empfohlen für Production)

### Schritt 1: Plugin-Dateien hochladen

**Option A: Via FTP/SFTP**

1. Verbinde dich mit deinem Server
2. Navigiere zu `wp-content/plugins/`
3. Erstelle Ordner `order-hub-integration`
4. Lade `order-hub-integration.php` hoch

**Option B: Via WordPress Admin**

1. Gehe zu Plugins → Add New → Upload Plugin
2. Wähle `order-hub-integration.zip` (falls als ZIP gepackt)
3. Installiere und aktiviere

**Option C: Via WP-CLI**

```bash
cd /path/to/wordpress
wp plugin install /path/to/order-hub-integration.php --activate
```

### Schritt 2: Plugin aktivieren

1. Gehe zu WordPress Admin → Plugins
2. Finde "Order Hub Integration"
3. Klicke "Activate"

### Schritt 3: API-Key erstellen (Payment Hub)

1. Öffne Payment Hub Admin UI: `https://payments.mojo-institut.de`
2. Gehe zu Settings
3. Erstelle einen neuen API-Key für WooCommerce
4. Kopiere den Key (wird nur einmal angezeigt!)

**Alternative: API-Key in Payment Hub konfigurieren**

Falls du bereits einen API-Key hast:
- Verwende diesen Key
- Stelle sicher, dass er für WooCommerce konfiguriert ist

### Schritt 4: Plugin konfigurieren

1. Gehe zu WordPress Admin → Settings → Order Hub
2. Fülle die Felder aus:

   **API URL:**
   ```
   https://paymentsapi.mojo-institut.de/api/v1
   ```

   **API Key:**
   ```
   <dein-api-key-vom-payment-hub>
   ```

3. Aktiviere die Checkboxen:

   - ✅ **Enable Integration**: Aktivieren
   - ✅ **Shadow Mode**: Aktivieren (für Start empfohlen)
   - ✅ **Send Asynchronously**: Aktivieren (empfohlen)
   - ⬜ **Enable Callbacks**: Deaktivieren (für Shadow Mode)
   - ✅ **Log Requests**: Aktivieren (für Debugging)

4. Klicke "Save Settings"

### Schritt 5: Verbindung testen

1. Klicke auf "Test API Connection" Button
2. Prüfe die Antwort:
   - ✅ Erfolg: "Connection successful!"
   - ❌ Fehler: Prüfe API-URL und API-Key

### Schritt 6: Erste Order testen

1. Erstelle eine Test-Order in WooCommerce
2. Prüfe WooCommerce Logs: `wp-content/uploads/wc-logs/`
3. Prüfe Payment Hub Admin UI → Orders
4. Die Order sollte dort erscheinen

### Schritt 7: Monitoring einrichten

**WooCommerce Logs prüfen:**

1. Gehe zu WooCommerce → Status → Logs
2. Wähle "order-hub-integration" Log
3. Prüfe auf Fehler oder Warnings

**Payment Hub Admin UI:**

1. Öffne Payment Hub Admin UI
2. Gehe zu Orders
3. Filtere nach `source: woocommerce`
4. Prüfe ob Orders ankommen

## Konfiguration für verschiedene Modi

### Shadow Mode (Empfohlen für Start)

```
✅ Enable Integration: ON
✅ Shadow Mode: ON
✅ Send Asynchronously: ON
⬜ Enable Callbacks: OFF
✅ Log Requests: ON
```

**Was passiert:**
- Orders werden gesendet und gespeichert
- Payment Hub monitort nur (keine Aktionen)
- Bestehende Stripe-Verbindung läuft normal

### Active Mode (Nach Tests)

```
✅ Enable Integration: ON
⬜ Shadow Mode: OFF
✅ Send Asynchronously: ON
✅ Enable Callbacks: ON
✅ Log Requests: ON
```

**Was passiert:**
- Orders werden aktiv verarbeitet
- Callbacks werden gesendet
- Status-Updates werden synchronisiert

## Troubleshooting

### Plugin erscheint nicht im Menü

- Prüfe ob Plugin aktiviert ist
- Prüfe WordPress-Version (min. 5.8)
- Prüfe PHP-Fehler-Log

### API-Verbindung schlägt fehl

1. Prüfe API-URL (muss mit `/api/v1` enden)
2. Prüfe API-Key (muss korrekt sein)
3. Prüfe Firewall/Server-Zugriff
4. Teste manuell mit curl:

```bash
curl -X GET "https://paymentsapi.mojo-institut.de/api/v1/health" \
  -H "Authorization: Bearer <dein-api-key>"
```

### Orders werden nicht gesendet

1. Prüfe ob Integration aktiviert ist
2. Prüfe WooCommerce Logs
3. Prüfe ob Order erstellt wurde
4. Prüfe Datenbank-Tabelle `wp_order_hub_sync`

### Duplikate

- Plugin verwendet Idempotency-Keys
- Bei Retries werden Duplikate verhindert
- Prüfe `wp_order_hub_sync` Tabelle

## Nächste Schritte

Nach erfolgreicher Installation:

1. ✅ Teste mit einigen Test-Orders
2. ✅ Prüfe Payment Hub Admin UI
3. ✅ Vergleiche Daten (WooCommerce vs. Payment Hub)
4. ✅ Aktiviere nach Tests den Active Mode
5. ✅ Deaktiviere Logs in Production (optional)

## Support

Bei Problemen:

1. Prüfe WooCommerce Logs
2. Prüfe Payment Hub Logs
3. Prüfe Browser-Console (Admin-UI)
4. Kontaktiere Support mit Logs









