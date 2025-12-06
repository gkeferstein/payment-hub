# API Key Setup für WooCommerce Plugin

## 🔑 Wie funktioniert der API Key?

Das Payment Hub System verwendet aktuell eine **einfache API Key-Authentifizierung**:
- Der API Key muss mindestens **10 Zeichen lang** sein
- Format: Beliebiger String (z.B. `woocommerce-api-key-2024`)
- Wird im Header verwendet: `Authorization: Bearer <api-key>`

## 📝 API Key für WooCommerce Plugin einrichten

### Option 1: Verwende den Admin-Login-Key

Wenn du dich im Payment Hub Admin einloggst, verwendest du bereits einen API Key. Dieser kann auch für das Plugin verwendet werden:

1. **Payment Hub Admin öffnen:** `https://payments.mojo-institut.de`
2. **Login-Seite:** Du wirst nach einem API Key gefragt
3. **Dieser Key** kann im WooCommerce Plugin verwendet werden

### Option 2: Erstelle einen eigenen API Key

Du kannst einen beliebigen API Key erstellen (mindestens 10 Zeichen):

**Beispiele:**
```
woocommerce-api-key-2024
mojo-payment-hub-key-12345
wc-integration-secret-key
```

**Wichtig:** 
- Mindestens 10 Zeichen
- Sollte sicher/geheim sein
- Nicht in Code committen!

## 🔧 Plugin konfigurieren

1. **WordPress Admin → Settings → Order Hub** öffnen
2. **API Key** eintragen (den Key, den du gewählt hast)
3. **API URL:** `https://paymentsapi.mojo-institut.de/api/v1`
4. **"Test API Connection"** klicken → sollte erfolgreich sein

## ✅ Testen

### Im Plugin:
1. "Test API Connection" Button klicken
2. Sollte "Connection successful!" anzeigen

### Manuell testen:
```bash
curl -X GET "https://paymentsapi.mojo-institut.de/api/v1/health" \
  -H "Authorization: Bearer <dein-api-key>"
```

Sollte `{"status":"healthy",...}` zurückgeben.

## 🔒 Sicherheitshinweise

**Aktuell:**
- API Keys werden nur auf Format geprüft (min. 10 Zeichen)
- Es gibt keine zentrale Key-Verwaltung
- Jeder gültig formatierte Key wird akzeptiert

**Empfehlung:**
- Verwende einen starken, zufälligen Key
- Mindestens 32 Zeichen
- Enthält Buchstaben, Zahlen, Sonderzeichen
- Beispiel: `wc_sk_live_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`

## 🚨 Wichtig

**Der gleiche API Key muss verwendet werden für:**
1. ✅ Payment Hub Admin Login
2. ✅ WooCommerce Plugin Konfiguration
3. ✅ Alle API-Requests vom Plugin

Wenn du den Key änderst, musst du ihn an beiden Stellen aktualisieren!

## 📋 Quick Setup

1. **Wähle einen API Key** (z.B. `woocommerce-api-key-2024`)
2. **Im Plugin eintragen:**
   - API URL: `https://paymentsapi.mojo-institut.de/api/v1`
   - API Key: `woocommerce-api-key-2024`
3. **Test Connection** klicken
4. **Fertig!**

## 🔄 Key ändern

Wenn du den Key ändern möchtest:
1. Neuen Key wählen
2. Im Plugin eintragen
3. Im Admin-Interface (falls verwendet) eintragen
4. Test Connection ausführen

