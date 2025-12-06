# WooCommerce Plugin Setup Checkliste

## ✅ Was muss konfiguriert sein, damit Orders weitergeleitet werden?

### 1. Plugin-Konfiguration in WooCommerce (WordPress Admin)

**Pfad:** WordPress Admin → Settings → Order Hub

**Erforderliche Einstellungen:**
- ✅ **Enable Integration**: MUSS aktiviert sein (`enabled = true`)
- ✅ **API URL**: `https://paymentsapi.mojo-institut.de/api/v1`
- ✅ **API Key**: Muss korrekt sein (vom Payment Hub Admin)
- ✅ **Shadow Mode**: Empfohlen für Start (`shadow_mode = true`)
- ✅ **Send Asynchronously**: Empfohlen (`send_async = true`)
- ⬜ **Enable Callbacks**: Nur wenn Shadow Mode OFF (`callback_enabled = false` wenn Shadow Mode ON)

**Standard nach Installation:**
```
enabled: true
shadow_mode: true
send_async: true
callback_enabled: false
log_requests: true
```

### 2. Channel-Konfiguration im Payment Hub

**Pfad:** Payment Hub Admin → Settings → Channel Configurations → WooCommerce

**Erforderliche Einstellungen:**
- ✅ **Use Payment Hub**: MUSS aktiviert sein (`use_payment_hub = true`)
- ✅ **Shadow Mode**: Empfohlen für Start (`shadow_mode = true`)
- ⬜ **Enable Callbacks**: Nur wenn Shadow Mode OFF (`callback_enabled = false` wenn Shadow Mode ON)

**Standard (wenn nicht konfiguriert):**
```
use_payment_hub: false  ← PROBLEM! Muss auf true gesetzt werden!
shadow_mode: true
callback_enabled: false
```

### 3. Verhalten je nach Konfiguration

#### Szenario A: Plugin enabled, aber Hub nicht konfiguriert
```
Plugin: enabled=true
Hub: use_payment_hub=false (Standard)
```
**Ergebnis:** ❌ Orders werden NICHT verarbeitet (nur gesendet, aber ignoriert)

#### Szenario B: Beide aktiviert, Shadow Mode ON
```
Plugin: enabled=true, shadow_mode=true
Hub: use_payment_hub=true, shadow_mode=true
```
**Ergebnis:** ✅ Orders werden gesendet und gespeichert, aber nur MONITORING (keine Callbacks)

#### Szenario C: Beide aktiviert, Shadow Mode OFF
```
Plugin: enabled=true, shadow_mode=false
Hub: use_payment_hub=true, shadow_mode=false, callback_enabled=true
```
**Ergebnis:** ✅ Orders werden aktiv verarbeitet + Callbacks gesendet

## 🔍 Prüfschritte

### Schritt 1: Plugin-Konfiguration prüfen
1. WordPress Admin → Settings → Order Hub öffnen
2. Prüfen:
   - ✅ "Enable Integration" ist angehakt
   - ✅ API URL ist korrekt
   - ✅ API Key ist eingegeben
3. "Test API Connection" klicken → sollte Erfolg zeigen

### Schritt 2: Hub-Konfiguration prüfen
1. Payment Hub Admin → Settings → Channel Configurations öffnen
2. WooCommerce-Kachel prüfen:
   - ✅ "Use Payment Hub" ist aktiviert (Toggle ON)
   - ✅ "Shadow Mode" ist aktiviert (für Start empfohlen)
   - ⬜ "Enable Callbacks" ist deaktiviert (wenn Shadow Mode ON)

### Schritt 3: Test-Order erstellen
1. In WooCommerce eine Test-Order erstellen
2. Prüfen:
   - Payment Hub Admin → Orders → sollte die Order sehen
   - Filter: `source: woocommerce`
   - Order sollte Status "pending" haben

### Schritt 4: Logs prüfen
1. **WooCommerce Logs:**
   - WordPress Admin → WooCommerce → Status → Logs
   - Log "order-hub-integration" prüfen
   - Sollte "Order sent successfully" zeigen

2. **Payment Hub Logs:**
   - Docker: `docker logs order-hub-backend --tail 100`
   - Sollte POST /api/v1/orders Requests zeigen

## ⚠️ Häufige Probleme

### Problem: Orders kommen nicht an
**Ursachen:**
1. Plugin nicht aktiviert (`enabled = false`)
2. API Key falsch
3. API URL falsch
4. Hub nicht konfiguriert (`use_payment_hub = false`)
5. Firewall blockiert Requests

**Lösung:**
1. Plugin-Konfiguration prüfen
2. "Test API Connection" im Plugin ausführen
3. Hub-Konfiguration prüfen (Use Payment Hub = ON)
4. Logs prüfen

### Problem: Orders kommen an, aber werden nicht verarbeitet
**Ursache:** `use_payment_hub = false` im Hub

**Lösung:** 
- Payment Hub Admin → Settings → Channel Configurations → WooCommerce
- "Use Payment Hub" aktivieren

### Problem: Duplikate
**Ursache:** Plugin sendet Order mehrfach

**Lösung:** 
- Plugin verwendet Idempotency-Keys
- Prüfe `wp_order_hub_sync` Tabelle
- Sollte automatisch verhindert werden

## 📋 Quick Setup (Empfohlen für Start)

### 1. Plugin konfigurieren:
```
✅ Enable Integration: ON
✅ API URL: https://paymentsapi.mojo-institut.de/api/v1
✅ API Key: <dein-key>
✅ Shadow Mode: ON
✅ Send Asynchronously: ON
⬜ Enable Callbacks: OFF
✅ Log Requests: ON
```

### 2. Hub konfigurieren:
```
✅ Use Payment Hub: ON
✅ Shadow Mode: ON
⬜ Enable Callbacks: OFF
```

### 3. Testen:
1. Test-Order erstellen
2. In Hub Admin prüfen ob Order ankommt
3. Logs prüfen

## 🚀 Nach erfolgreichen Tests

Wenn alles funktioniert, kannst du auf **Active Mode** umstellen:

### Plugin:
```
✅ Enable Integration: ON
⬜ Shadow Mode: OFF
✅ Enable Callbacks: ON
```

### Hub:
```
✅ Use Payment Hub: ON
⬜ Shadow Mode: OFF
✅ Enable Callbacks: ON
```

**Achtung:** In Active Mode werden Callbacks gesendet und Status synchronisiert!

