# Changelog

Alle wichtigen Änderungen an diesem Plugin werden hier dokumentiert.

## [1.0.0] - 2024-12-06

### Added
- Initial Release
- Order-Synchronisation mit Payment Hub
- Payment-Synchronisation mit Payment Hub
- Shadow Mode Support (Monitoring ohne aktive Verarbeitung)
- Asynchrones Senden (blockiert nicht den Checkout)
- Idempotency-Keys (verhindert Duplikate)
- REST API Callbacks für Status-Updates
- Admin-Interface für Konfiguration
- Datenbank-Tracking (wp_order_hub_sync)
- Error Handling und Logging
- Connection-Test-Funktion
- WooCommerce Logs Integration

### Features
- ✅ Parallel Integration (läuft neben bestehender Stripe-Verbindung)
- ✅ Konfigurierbar über WordPress Settings
- ✅ Automatische Order- und Payment-Synchronisation
- ✅ Robuste Fehlerbehandlung
- ✅ Umfangreiches Logging

### Security
- ✅ API-Key-Authentifizierung
- ✅ Input-Sanitization
- ✅ Nonce-Verification
- ✅ Capability-Checks









