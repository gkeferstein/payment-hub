# Order Hub - Umsetzungsplan
**Projekt**: Order Hub  
**Domain**: orders.mojo-institut.de  
**Stack**: Docker + PostgreSQL + Backend (Node.js/TypeScript empfohlen)

---

## 📋 Übersicht

Dieser Plan unterteilt die Entwicklung in klare, testbare To-Dos. Jedes To-Do ist:
- **Spezifisch**: Klare Beschreibung was gemacht wird
- **Testbar**: Akzeptanzkriterien definiert
- **Abgrenzbar**: 1-4 Stunden Arbeit (max. 1 Tag)
- **Abhängig**: Klare Voraussetzungen

---

## 🎯 Phase 0: Projekt-Setup & Infrastruktur (P0)

### TODO-001: Projekt-Grundstruktur erstellen
**Beschreibung**: Basis-Projektstruktur mit Ordnerstruktur, Package-Management, TypeScript-Config

**Akzeptanzkriterien**:
- [ ] Projekt-Ordnerstruktur erstellt (`/src/domains`, `/src/api`, `/src/adapters`, etc.)
- [ ] `package.json` mit TypeScript, Express (oder ähnlich), Dependencies
- [ ] `tsconfig.json` mit strict mode
- [ ] `.gitignore` für Node.js/TypeScript
- [ ] `.env.example` Template
- [ ] README.md mit Setup-Anleitung

**Test-Plan**: 
- Projekt kann mit `npm install` installiert werden
- TypeScript kompiliert ohne Fehler
- Projekt-Struktur entspricht Architektur-Vorgaben

**Abhängigkeiten**: Keine

**Schätzung**: 1-2 Stunden

---

### TODO-002: Docker-Setup erstellen
**Beschreibung**: Docker-Compose mit Backend-Container und PostgreSQL-Container

**Akzeptanzkriterien**:
- [ ] `Dockerfile` für Backend-Service
- [ ] `docker-compose.yml` mit:
  - Backend-Service (Port 3000)
  - PostgreSQL-Service (Port 5432)
  - Volumes für DB-Persistenz
  - Environment-Variablen
- [ ] `.dockerignore` Datei
- [ ] Container starten mit `docker-compose up`
- [ ] Backend erreichbar auf `http://localhost:3000`
- [ ] PostgreSQL erreichbar auf `localhost:5432`

**Test-Plan**:
- `docker-compose up -d` startet beide Container
- `docker-compose ps` zeigt beide Container als "Up"
- Backend-Health-Check Endpunkt antwortet (später)

**Abhängigkeiten**: TODO-001

**Schätzung**: 2-3 Stunden

---

### TODO-003: Datenbank-Connection & Migration-Setup
**Beschreibung**: PostgreSQL-Connection einrichten, Migration-Tool (z.B. Knex.js, TypeORM, Prisma) konfigurieren

**Akzeptanzkriterien**:
- [ ] Datenbank-Connection funktioniert
- [ ] Migration-Tool installiert & konfiguriert
- [ ] Erste Test-Migration kann ausgeführt werden
- [ ] Rollback funktioniert
- [ ] Connection-Pooling konfiguriert

**Test-Plan**:
- Connection-Test-Script verbindet erfolgreich zur DB
- Migration kann erstellt und ausgeführt werden
- Rollback funktioniert

**Abhängigkeiten**: TODO-002

**Schätzung**: 2-3 Stunden

---

## 🗄️ Phase 1: Datenbank-Schema (P0)

### TODO-004: Basis-Tabellen erstellen (customers, orders, order_items)
**Beschreibung**: Migration für Core-Tabellen: customers, orders, order_items mit allen Feldern

**Akzeptanzkriterien**:
- [ ] `customers` Tabelle mit: id, email, name, created_at, updated_at
- [ ] `orders` Tabelle mit: id, customer_id, source, source_order_id, status, currency, totals (JSON), metadata (JSON), created_at, updated_at
- [ ] `order_items` Tabelle mit: id, order_id, name, sku, quantity, unit_price, tax_rate, tax_amount
- [ ] Foreign Keys definiert
- [ ] Unique Constraint auf `orders.source + source_order_id`
- [ ] Indexes auf Foreign Keys und häufig abgefragte Spalten

**Test-Plan**:
- Migration läuft ohne Fehler
- Tabellen existieren in DB
- Foreign Keys funktionieren
- Unique Constraint verhindert Duplikate
- Test-Insert funktioniert

**Abhängigkeiten**: TODO-003

**Schätzung**: 2-3 Stunden

---

### TODO-005: Payment-Tabellen erstellen
**Beschreibung**: Migration für payments Tabelle

**Akzeptanzkriterien**:
- [ ] `payments` Tabelle mit: id, order_id, provider, provider_reference, payment_method, status, amount, currency, metadata (JSON), created_at, updated_at
- [ ] Foreign Key zu orders
- [ ] Index auf provider_reference
- [ ] Index auf status

**Test-Plan**:
- Migration läuft ohne Fehler
- Foreign Key zu orders funktioniert
- Test-Insert funktioniert

**Abhängigkeiten**: TODO-004

**Schätzung**: 1-2 Stunden

---

### TODO-006: History-Tabellen erstellen (Auditing)
**Beschreibung**: Migration für order_status_history und payment_status_history

**Akzeptanzkriterien**:
- [ ] `order_status_history` mit: id, order_id, old_status, new_status, changed_by, changed_at
- [ ] `payment_status_history` mit: id, payment_id, old_status, new_status, changed_by, changed_at
- [ ] Foreign Keys zu orders/payments
- [ ] Indexes auf order_id/payment_id und changed_at

**Test-Plan**:
- Migration läuft ohne Fehler
- Foreign Keys funktionieren
- Test-Insert funktioniert

**Abhängigkeiten**: TODO-004, TODO-005

**Schätzung**: 1-2 Stunden

---

## 🔧 Phase 2: Core-Domänen (P0)

### TODO-007: Order-Domain-Model erstellen
**Beschreibung**: TypeScript-Modelle/Interfaces für Order, OrderItem, OrderStatus

**Akzeptanzkriterien**:
- [ ] Order-Interface mit allen Feldern
- [ ] OrderItem-Interface
- [ ] OrderStatus Enum (pending, confirmed, paid, shipped, cancelled, etc.)
- [ ] Type-Safety (kein `any`)
- [ ] JSON Schema für Validierung (optional, aber empfohlen)

**Test-Plan**:
- TypeScript kompiliert ohne Fehler
- Modelle können instanziiert werden
- Type-Checking funktioniert

**Abhängigkeiten**: TODO-004

**Schätzung**: 1-2 Stunden

---

### TODO-008: Payment-Domain-Model erstellen
**Beschreibung**: TypeScript-Modelle/Interfaces für Payment, PaymentStatus

**Akzeptanzkriterien**:
- [ ] Payment-Interface mit allen Feldern
- [ ] PaymentStatus Enum (pending, processing, succeeded, failed, cancelled)
- [ ] PaymentProvider Enum (stripe, btcpay, etc.)
- [ ] Type-Safety

**Test-Plan**:
- TypeScript kompiliert ohne Fehler
- Modelle können instanziiert werden

**Abhängigkeiten**: TODO-005

**Schätzung**: 1 Stunde

---

### TODO-009: Order-Repository implementieren
**Beschreibung**: Repository-Pattern für Order-Datenbankzugriffe (CRUD)

**Akzeptanzkriterien**:
- [ ] `create(order: Order): Promise<Order>`
- [ ] `findById(id: string): Promise<Order | null>`
- [ ] `findBySource(source: string, sourceOrderId: string): Promise<Order | null>`
- [ ] `updateStatus(orderId: string, newStatus: OrderStatus): Promise<void>`
- [ ] Alle Queries mit Prepared Statements / ORM
- [ ] Transaktionen für kritische Operationen

**Test-Plan**:
- Unit Tests für alle Repository-Methoden
- Integration Tests mit echter DB
- Alle Tests grün

**Abhängigkeiten**: TODO-007, TODO-004

**Schätzung**: 3-4 Stunden

---

### TODO-010: Payment-Repository implementieren
**Beschreibung**: Repository-Pattern für Payment-Datenbankzugriffe

**Akzeptanzkriterien**:
- [ ] `create(payment: Payment): Promise<Payment>`
- [ ] `findById(id: string): Promise<Payment | null>`
- [ ] `findByProviderReference(provider: string, reference: string): Promise<Payment | null>`
- [ ] `updateStatus(paymentId: string, newStatus: PaymentStatus): Promise<void>`
- [ ] Prepared Statements / ORM

**Test-Plan**:
- Unit Tests für alle Repository-Methoden
- Integration Tests mit echter DB
- Alle Tests grün

**Abhängigkeiten**: TODO-008, TODO-005

**Schätzung**: 2-3 Stunden

---

### TODO-011: History-Repository implementieren
**Beschreibung**: Repository für Status-History (Order & Payment)

**Akzeptanzkriterien**:
- [ ] `createOrderStatusHistory(history: OrderStatusHistory): Promise<void>`
- [ ] `createPaymentStatusHistory(history: PaymentStatusHistory): Promise<void>`
- [ ] `getOrderHistory(orderId: string): Promise<OrderStatusHistory[]>`
- [ ] `getPaymentHistory(paymentId: string): Promise<PaymentStatusHistory[]>`

**Test-Plan**:
- Unit Tests für alle Methoden
- Integration Tests
- Alle Tests grün

**Abhängigkeiten**: TODO-006

**Schätzung**: 2 Stunden

---

## 🎯 Phase 3: Order-Service (P0)

### TODO-012: Order-Service implementieren (Business-Logic)
**Beschreibung**: Service-Layer für Order-Operationen mit Business-Logic

**Akzeptanzkriterien**:
- [ ] `createOrder(orderData: CreateOrderInput): Promise<Order>`
  - Validiert Input
  - Prüft auf Duplikate (source + source_order_id)
  - Erstellt Order in Transaktion
  - Schreibt initialen Status in History
- [ ] `getOrderById(id: string): Promise<Order>`
- [ ] `getOrderBySource(source: string, sourceOrderId: string): Promise<Order>`
- [ ] `updateOrderStatus(orderId: string, newStatus: OrderStatus, changedBy?: string): Promise<void>`
  - Validiert Status-Transition
  - Schreibt in History
  - Transaktion

**Test-Plan**:
- Unit Tests für alle Service-Methoden
- Integration Tests mit DB
- Status-Transition-Validierung getestet
- Duplikat-Prüfung getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-009, TODO-011

**Schätzung**: 4-5 Stunden

---

### TODO-013: Order API Endpunkte implementieren
**Beschreibung**: REST API für Orders (Express/Fastify/etc.)

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/orders` - Order erstellen
  - Input Validation (JSON Schema)
  - Idempotenz-Check (Idempotency-Key Header)
  - Authentifizierung (API Key)
  - Response mit Order-Objekt
- [ ] `GET /api/v1/orders/:id` - Order abrufen
  - Authentifizierung
  - 404 wenn nicht gefunden
- [ ] `GET /api/v1/orders/by-source/:source/:sourceOrderId` - Order nach Source finden
  - Authentifizierung
  - 404 wenn nicht gefunden

**Test-Plan**:
- Integration Tests für alle Endpunkte
- Idempotenz-Test (gleicher Request 2x = gleiche Response)
- Validation-Tests (ungültige Inputs)
- Auth-Tests (ohne API Key = 401)
- Alle Tests grün

**Abhängigkeiten**: TODO-012

**Schätzung**: 4-5 Stunden

---

## 💳 Phase 4: Payment-Service (P0)

### TODO-014: Payment-Service implementieren
**Beschreibung**: Service-Layer für Payment-Operationen

**Akzeptanzkriterien**:
- [ ] `createPayment(paymentData: CreatePaymentInput): Promise<Payment>`
  - Validiert Input
  - Prüft Order existiert
  - Erstellt Payment in Transaktion
  - Schreibt initialen Status in History
- [ ] `getPaymentById(id: string): Promise<Payment>`
- [ ] `updatePaymentStatus(paymentId: string, newStatus: PaymentStatus, changedBy?: string): Promise<void>`
  - Validiert Status-Transition
  - Schreibt in History
  - Transaktion
- [ ] `findPaymentByProviderReference(provider: string, reference: string): Promise<Payment | null>`

**Test-Plan**:
- Unit Tests für alle Service-Methoden
- Integration Tests
- Status-Transition-Validierung
- Alle Tests grün

**Abhängigkeiten**: TODO-010, TODO-011

**Schätzung**: 3-4 Stunden

---

### TODO-015: Payment API Endpunkte implementieren
**Beschreibung**: REST API für Payments

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/payments` - Payment erstellen
  - Input Validation
  - Idempotenz-Check
  - Authentifizierung
  - Response mit Payment-Objekt
- [ ] `GET /api/v1/payments/:id` - Payment abrufen
  - Authentifizierung
  - 404 wenn nicht gefunden

**Test-Plan**:
- Integration Tests für alle Endpunkte
- Idempotenz-Test
- Validation-Tests
- Auth-Tests
- Alle Tests grün

**Abhängigkeiten**: TODO-014

**Schätzung**: 2-3 Stunden

---

## 🔐 Phase 5: Sicherheit & Authentifizierung (P0)

### TODO-016: API-Key-Authentifizierung implementieren
**Beschreibung**: Middleware für API-Key-Validierung

**Akzeptanzkriterien**:
- [ ] API-Key-Middleware
- [ ] API-Keys in DB oder Environment-Variablen
- [ ] Rate Limiting pro API-Key
- [ ] Alle Endpunkte (außer Health-Check) geschützt
- [ ] 401 bei ungültigem/fehlendem API-Key

**Test-Plan**:
- Tests für gültige API-Keys
- Tests für ungültige API-Keys
- Tests für fehlende API-Keys
- Rate Limiting getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-013, TODO-015

**Schätzung**: 3-4 Stunden

---

### TODO-017: Idempotenz-Mechanismus implementieren
**Beschreibung**: Idempotency-Key-Validierung für kritische Endpunkte

**Akzeptanzkriterien**:
- [ ] Idempotency-Key im Header (`Idempotency-Key`)
- [ ] Key-Store (DB oder Redis) für bereits verarbeitete Keys
- [ ] Gleiche Request-ID = gleiche Response (aus Cache)
- [ ] TTL für Idempotency-Keys (z.B. 24h)
- [ ] Funktioniert für POST /orders und POST /payments

**Test-Plan**:
- Test: Gleicher Request 2x = gleiche Response
- Test: Verschiedene Requests = verschiedene Responses
- Test: TTL funktioniert
- Alle Tests grün

**Abhängigkeiten**: TODO-013, TODO-015

**Schätzung**: 3-4 Stunden

---

## 🔔 Phase 6: Webhook-Handler (P1)

### TODO-018: Stripe-Webhook-Handler implementieren
**Beschreibung**: Webhook-Endpunkt für Stripe mit Signatur-Validierung

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/webhooks/stripe` Endpunkt
- [ ] Signatur-Validierung (X-Stripe-Signature Header)
- [ ] Idempotente Verarbeitung (Event-ID)
- [ ] Handler für `payment_intent.succeeded`
  - Findet Payment anhand provider_reference
  - Setzt Payment.Status = succeeded
  - Setzt Order.Status = paid (wenn alle Payments succeeded)
  - Schreibt in History
- [ ] Handler für `payment_intent.failed`
  - Setzt Payment.Status = failed
  - Schreibt in History

**Test-Plan**:
- Integration Tests mit Stripe CLI
- Signatur-Validierung getestet (gültig/ungültig)
- Idempotenz getestet (gleiche Event-ID 2x)
- Payment-Status-Update getestet
- Order-Status-Update getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-014, TODO-016

**Schätzung**: 5-6 Stunden

---

### TODO-019: BTCPay-Webhook-Handler implementieren
**Beschreibung**: Webhook-Endpunkt für BTCPay mit Signatur-Validierung

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/webhooks/btcpay` Endpunkt
- [ ] Signatur-Validierung (BTCPay-Sig Header)
- [ ] Idempotente Verarbeitung
- [ ] Handler für `invoice_settled`
  - Findet Payment anhand provider_reference
  - Setzt Payment.Status = succeeded
  - Setzt Order.Status = paid
  - Schreibt in History

**Test-Plan**:
- Integration Tests mit BTCPay Test-Server
- Signatur-Validierung getestet
- Idempotenz getestet
- Payment/Order-Status-Update getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-014, TODO-016

**Schätzung**: 4-5 Stunden

---

## 🔄 Phase 7: Callback-Mechanismus (P1)

### TODO-020: Callback-Service implementieren
**Beschreibung**: Service für Callbacks an Channels (WooCommerce, POS, etc.)

**Akzeptanzkriterien**:
- [ ] `sendCallbackToChannel(channel: string, callbackUrl: string, payload: CallbackPayload): Promise<void>`
- [ ] Idempotente Callbacks (gleiche Order-ID = kein Duplikat)
- [ ] Retry-Logik (Exponential Backoff, max 3 Retries)
- [ ] Timeout-Handling (max 30s)
- [ ] Callback-Status-Tracking (erfolgreich/fehlgeschlagen)

**Test-Plan**:
- Unit Tests für Callback-Logik
- Integration Tests mit Mock-Server
- Retry-Logik getestet
- Timeout getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-012, TODO-014

**Schätzung**: 4-5 Stunden

---

### TODO-021: Callback-Integration in Webhook-Handler
**Beschreibung**: Callbacks automatisch auslösen bei Status-Änderungen

**Akzeptanzkriterien**:
- [ ] Bei Order.Status = paid → Callback an Source-Channel
- [ ] Bei Payment.Status = succeeded → Callback an Source-Channel
- [ ] Callback-URL aus Order.metadata oder Config
- [ ] Async-Verarbeitung (nicht blockierend)

**Test-Plan**:
- Integration Tests
- Callback wird ausgelöst bei Status-Änderung
- Callback-Payload korrekt
- Alle Tests grün

**Abhängigkeiten**: TODO-020, TODO-018

**Schätzung**: 2-3 Stunden

---

## 🔌 Phase 8: Payment-Provider-Adapter (P1)

### TODO-022: Payment-Provider-Adapter-Interface definieren
**Beschreibung**: Abstraktes Interface für alle Payment-Provider

**Akzeptanzkriterien**:
- [ ] `IPaymentProvider` Interface mit:
  - `createPaymentIntent(order: Order, amount: number): Promise<PaymentIntent>`
  - `getPaymentStatus(reference: string): Promise<PaymentStatus>`
- [ ] `PaymentIntent` Interface (id, redirect_url, etc.)

**Test-Plan**:
- TypeScript kompiliert ohne Fehler
- Interface kann implementiert werden

**Abhängigkeiten**: TODO-014

**Schätzung**: 1 Stunde

---

### TODO-023: Stripe-Adapter implementieren
**Beschreibung**: Stripe-Integration als Payment-Provider

**Akzeptanzkriterien**:
- [ ] Implementiert `IPaymentProvider`
- [ ] `createPaymentIntent` erstellt Stripe Payment Intent
- [ ] Gibt redirect_url zurück
- [ ] Fehlerbehandlung für Stripe-API-Fehler
- [ ] Retry-Logik für transient errors

**Test-Plan**:
- Unit Tests mit Stripe-Mock
- Integration Tests mit Stripe Test-API
- Fehlerbehandlung getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-022

**Schätzung**: 4-5 Stunden

---

### TODO-024: BTCPay-Adapter implementieren
**Beschreibung**: BTCPay-Integration als Payment-Provider

**Akzeptanzkriterien**:
- [ ] Implementiert `IPaymentProvider`
- [ ] `createPaymentIntent` erstellt BTCPay Invoice
- [ ] Gibt redirect_url (QR-Code URL) zurück
- [ ] Fehlerbehandlung
- [ ] Retry-Logik

**Test-Plan**:
- Unit Tests mit BTCPay-Mock
- Integration Tests mit BTCPay Test-Server
- Fehlerbehandlung getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-022

**Schätzung**: 4-5 Stunden

---

## 📊 Phase 9: Monitoring & Logging (P1)

### TODO-025: Strukturiertes Logging implementieren
**Beschreibung**: JSON-Logging mit Request-ID, Log-Levels

**Akzeptanzkriterien**:
- [ ] Strukturierte Logs (JSON-Format)
- [ ] Log-Levels: DEBUG, INFO, WARN, ERROR
- [ ] Request-ID für Request-Tracking
- [ ] Logging für kritische Operationen:
  - Order erstellt
  - Payment erstellt
  - Status-Änderungen
  - Webhook-Empfang
  - Callback-Versand

**Test-Plan**:
- Logs werden in korrektem Format geschrieben
- Request-ID wird durchgereicht
- Log-Levels funktionieren
- Alle kritischen Operationen werden geloggt

**Abhängigkeiten**: TODO-012, TODO-014

**Schätzung**: 2-3 Stunden

---

### TODO-026: Health-Check Endpunkt implementieren
**Beschreibung**: Health-Check für Monitoring (Docker, Load-Balancer)

**Akzeptanzkriterien**:
- [ ] `GET /health` Endpunkt
  - Prüft DB-Connection
  - Gibt Status zurück (200 = healthy, 503 = unhealthy)
- [ ] `GET /health/ready` für Readiness
- [ ] `GET /health/live` für Liveness

**Test-Plan**:
- Health-Check antwortet 200 wenn DB verbunden
- Health-Check antwortet 503 wenn DB nicht verbunden
- Alle Tests grün

**Abhängigkeiten**: TODO-003

**Schätzung**: 1-2 Stunden

---

## 🚀 Phase 10: Deployment & Production-Ready (P0)

### TODO-027: Environment-Configuration
**Beschreibung**: Separate Configs für Dev/Staging/Production

**Akzeptanzkriterien**:
- [ ] Environment-Variablen für alle Konfigurationen:
  - DB-Connection
  - API-Keys (Stripe, BTCPay)
  - Callback-URLs
  - Log-Level
- [ ] `.env.example` mit allen Variablen
- [ ] Config-Validation beim Start
- [ ] Keine Secrets im Code

**Test-Plan**:
- App startet mit korrekten Environment-Variablen
- App schlägt fehl bei fehlenden kritischen Variablen
- Alle Tests grün

**Abhängigkeiten**: TODO-002

**Schätzung**: 2 Stunden

---

### TODO-028: CI/CD-Pipeline Setup
**Beschreibung**: GitHub Actions / GitLab CI für automatische Tests & Deployment

**Akzeptanzkriterien**:
- [ ] Pipeline bei jedem Commit:
  - Linting
  - Type-Checking
  - Unit Tests
  - Integration Tests
- [ ] Pipeline bei Merge zu Main:
  - Build Docker Image
  - Push zu Registry
  - Deployment zu Staging (optional)
- [ ] Pipeline bricht bei Fehlern

**Test-Plan**:
- Pipeline läuft bei Commit
- Pipeline bricht bei Linting-Fehlern
- Pipeline bricht bei Test-Fehlern
- Docker Image wird gebaut

**Abhängigkeiten**: TODO-002

**Schätzung**: 3-4 Stunden

---

### TODO-029: Production-Deployment-Vorbereitung
**Beschreibung**: Production-Config, Domain-Setup, SSL

**Akzeptanzkriterien**:
- [ ] Docker-Compose für Production
- [ ] Reverse-Proxy Config (Nginx/Traefik) für orders.mojo-institut.de
- [ ] SSL-Zertifikat (Let's Encrypt)
- [ ] Database-Backup-Strategie
- [ ] Monitoring-Setup (optional: Prometheus, Grafana)

**Test-Plan**:
- Domain zeigt auf Service
- SSL funktioniert
- Backup-Strategie dokumentiert

**Abhängigkeiten**: TODO-028

**Schätzung**: 4-5 Stunden

---

## 📝 Phase 11: Dokumentation (P1)

### TODO-030: API-Dokumentation erstellen
**Beschreibung**: OpenAPI/Swagger Spezifikation für alle Endpunkte

**Akzeptanzkriterien**:
- [ ] OpenAPI 3.0 Spezifikation
- [ ] Alle Endpunkte dokumentiert
- [ ] Request/Response-Schemas
- [ ] Beispiele
- [ ] Swagger UI erreichbar unter `/api-docs`

**Test-Plan**:
- Swagger UI zeigt alle Endpunkte
- Beispiele funktionieren
- Dokumentation ist vollständig

**Abhängigkeiten**: TODO-013, TODO-015

**Schätzung**: 3-4 Stunden

---

### TODO-031: README & Deployment-Dokumentation
**Beschreibung**: Vollständige Dokumentation für Entwickler & DevOps

**Akzeptanzkriterien**:
- [ ] README.md mit:
  - Projekt-Übersicht
  - Setup-Anleitung
  - Development-Guide
  - API-Übersicht
- [ ] DEPLOYMENT.md mit:
  - Deployment-Schritte
  - Environment-Variablen
  - Troubleshooting

**Test-Plan**:
- Entwickler kann Projekt mit README aufsetzen
- DevOps kann mit DEPLOYMENT.md deployen

**Abhängigkeiten**: Alle vorherigen To-Dos

**Schätzung**: 2-3 Stunden

---

## 📊 Zusammenfassung

### Prioritäten
- **P0 (Kritisch)**: TODO-001 bis TODO-017, TODO-027 bis TODO-029
- **P1 (Wichtig)**: TODO-018 bis TODO-026, TODO-030, TODO-031
- **P2 (Nice-to-Have)**: Später (z.B. WooCommerce-Adapter, POS-Adapter, B2B-Features)

### Geschätzte Gesamtzeit
- **P0**: ~60-75 Stunden (~8-10 Arbeitstage)
- **P1**: ~40-50 Stunden (~5-7 Arbeitstage)
- **Gesamt MVP (P0+P1)**: ~100-125 Stunden (~13-16 Arbeitstage)

### Nächste Schritte
1. **TODO-001** starten: Projekt-Grundstruktur erstellen
2. Schritt für Schritt durcharbeiten
3. Jedes To-Do testen bevor das nächste beginnt

---

**Status-Tracking**: Nutze diese Datei als Checkliste und markiere erledigte To-Dos mit `[x]`




**Projekt**: Order Hub  
**Domain**: orders.mojo-institut.de  
**Stack**: Docker + PostgreSQL + Backend (Node.js/TypeScript empfohlen)

---

## 📋 Übersicht

Dieser Plan unterteilt die Entwicklung in klare, testbare To-Dos. Jedes To-Do ist:
- **Spezifisch**: Klare Beschreibung was gemacht wird
- **Testbar**: Akzeptanzkriterien definiert
- **Abgrenzbar**: 1-4 Stunden Arbeit (max. 1 Tag)
- **Abhängig**: Klare Voraussetzungen

---

## 🎯 Phase 0: Projekt-Setup & Infrastruktur (P0)

### TODO-001: Projekt-Grundstruktur erstellen
**Beschreibung**: Basis-Projektstruktur mit Ordnerstruktur, Package-Management, TypeScript-Config

**Akzeptanzkriterien**:
- [ ] Projekt-Ordnerstruktur erstellt (`/src/domains`, `/src/api`, `/src/adapters`, etc.)
- [ ] `package.json` mit TypeScript, Express (oder ähnlich), Dependencies
- [ ] `tsconfig.json` mit strict mode
- [ ] `.gitignore` für Node.js/TypeScript
- [ ] `.env.example` Template
- [ ] README.md mit Setup-Anleitung

**Test-Plan**: 
- Projekt kann mit `npm install` installiert werden
- TypeScript kompiliert ohne Fehler
- Projekt-Struktur entspricht Architektur-Vorgaben

**Abhängigkeiten**: Keine

**Schätzung**: 1-2 Stunden

---

### TODO-002: Docker-Setup erstellen
**Beschreibung**: Docker-Compose mit Backend-Container und PostgreSQL-Container

**Akzeptanzkriterien**:
- [ ] `Dockerfile` für Backend-Service
- [ ] `docker-compose.yml` mit:
  - Backend-Service (Port 3000)
  - PostgreSQL-Service (Port 5432)
  - Volumes für DB-Persistenz
  - Environment-Variablen
- [ ] `.dockerignore` Datei
- [ ] Container starten mit `docker-compose up`
- [ ] Backend erreichbar auf `http://localhost:3000`
- [ ] PostgreSQL erreichbar auf `localhost:5432`

**Test-Plan**:
- `docker-compose up -d` startet beide Container
- `docker-compose ps` zeigt beide Container als "Up"
- Backend-Health-Check Endpunkt antwortet (später)

**Abhängigkeiten**: TODO-001

**Schätzung**: 2-3 Stunden

---

### TODO-003: Datenbank-Connection & Migration-Setup
**Beschreibung**: PostgreSQL-Connection einrichten, Migration-Tool (z.B. Knex.js, TypeORM, Prisma) konfigurieren

**Akzeptanzkriterien**:
- [ ] Datenbank-Connection funktioniert
- [ ] Migration-Tool installiert & konfiguriert
- [ ] Erste Test-Migration kann ausgeführt werden
- [ ] Rollback funktioniert
- [ ] Connection-Pooling konfiguriert

**Test-Plan**:
- Connection-Test-Script verbindet erfolgreich zur DB
- Migration kann erstellt und ausgeführt werden
- Rollback funktioniert

**Abhängigkeiten**: TODO-002

**Schätzung**: 2-3 Stunden

---

## 🗄️ Phase 1: Datenbank-Schema (P0)

### TODO-004: Basis-Tabellen erstellen (customers, orders, order_items)
**Beschreibung**: Migration für Core-Tabellen: customers, orders, order_items mit allen Feldern

**Akzeptanzkriterien**:
- [ ] `customers` Tabelle mit: id, email, name, created_at, updated_at
- [ ] `orders` Tabelle mit: id, customer_id, source, source_order_id, status, currency, totals (JSON), metadata (JSON), created_at, updated_at
- [ ] `order_items` Tabelle mit: id, order_id, name, sku, quantity, unit_price, tax_rate, tax_amount
- [ ] Foreign Keys definiert
- [ ] Unique Constraint auf `orders.source + source_order_id`
- [ ] Indexes auf Foreign Keys und häufig abgefragte Spalten

**Test-Plan**:
- Migration läuft ohne Fehler
- Tabellen existieren in DB
- Foreign Keys funktionieren
- Unique Constraint verhindert Duplikate
- Test-Insert funktioniert

**Abhängigkeiten**: TODO-003

**Schätzung**: 2-3 Stunden

---

### TODO-005: Payment-Tabellen erstellen
**Beschreibung**: Migration für payments Tabelle

**Akzeptanzkriterien**:
- [ ] `payments` Tabelle mit: id, order_id, provider, provider_reference, payment_method, status, amount, currency, metadata (JSON), created_at, updated_at
- [ ] Foreign Key zu orders
- [ ] Index auf provider_reference
- [ ] Index auf status

**Test-Plan**:
- Migration läuft ohne Fehler
- Foreign Key zu orders funktioniert
- Test-Insert funktioniert

**Abhängigkeiten**: TODO-004

**Schätzung**: 1-2 Stunden

---

### TODO-006: History-Tabellen erstellen (Auditing)
**Beschreibung**: Migration für order_status_history und payment_status_history

**Akzeptanzkriterien**:
- [ ] `order_status_history` mit: id, order_id, old_status, new_status, changed_by, changed_at
- [ ] `payment_status_history` mit: id, payment_id, old_status, new_status, changed_by, changed_at
- [ ] Foreign Keys zu orders/payments
- [ ] Indexes auf order_id/payment_id und changed_at

**Test-Plan**:
- Migration läuft ohne Fehler
- Foreign Keys funktionieren
- Test-Insert funktioniert

**Abhängigkeiten**: TODO-004, TODO-005

**Schätzung**: 1-2 Stunden

---

## 🔧 Phase 2: Core-Domänen (P0)

### TODO-007: Order-Domain-Model erstellen
**Beschreibung**: TypeScript-Modelle/Interfaces für Order, OrderItem, OrderStatus

**Akzeptanzkriterien**:
- [ ] Order-Interface mit allen Feldern
- [ ] OrderItem-Interface
- [ ] OrderStatus Enum (pending, confirmed, paid, shipped, cancelled, etc.)
- [ ] Type-Safety (kein `any`)
- [ ] JSON Schema für Validierung (optional, aber empfohlen)

**Test-Plan**:
- TypeScript kompiliert ohne Fehler
- Modelle können instanziiert werden
- Type-Checking funktioniert

**Abhängigkeiten**: TODO-004

**Schätzung**: 1-2 Stunden

---

### TODO-008: Payment-Domain-Model erstellen
**Beschreibung**: TypeScript-Modelle/Interfaces für Payment, PaymentStatus

**Akzeptanzkriterien**:
- [ ] Payment-Interface mit allen Feldern
- [ ] PaymentStatus Enum (pending, processing, succeeded, failed, cancelled)
- [ ] PaymentProvider Enum (stripe, btcpay, etc.)
- [ ] Type-Safety

**Test-Plan**:
- TypeScript kompiliert ohne Fehler
- Modelle können instanziiert werden

**Abhängigkeiten**: TODO-005

**Schätzung**: 1 Stunde

---

### TODO-009: Order-Repository implementieren
**Beschreibung**: Repository-Pattern für Order-Datenbankzugriffe (CRUD)

**Akzeptanzkriterien**:
- [ ] `create(order: Order): Promise<Order>`
- [ ] `findById(id: string): Promise<Order | null>`
- [ ] `findBySource(source: string, sourceOrderId: string): Promise<Order | null>`
- [ ] `updateStatus(orderId: string, newStatus: OrderStatus): Promise<void>`
- [ ] Alle Queries mit Prepared Statements / ORM
- [ ] Transaktionen für kritische Operationen

**Test-Plan**:
- Unit Tests für alle Repository-Methoden
- Integration Tests mit echter DB
- Alle Tests grün

**Abhängigkeiten**: TODO-007, TODO-004

**Schätzung**: 3-4 Stunden

---

### TODO-010: Payment-Repository implementieren
**Beschreibung**: Repository-Pattern für Payment-Datenbankzugriffe

**Akzeptanzkriterien**:
- [ ] `create(payment: Payment): Promise<Payment>`
- [ ] `findById(id: string): Promise<Payment | null>`
- [ ] `findByProviderReference(provider: string, reference: string): Promise<Payment | null>`
- [ ] `updateStatus(paymentId: string, newStatus: PaymentStatus): Promise<void>`
- [ ] Prepared Statements / ORM

**Test-Plan**:
- Unit Tests für alle Repository-Methoden
- Integration Tests mit echter DB
- Alle Tests grün

**Abhängigkeiten**: TODO-008, TODO-005

**Schätzung**: 2-3 Stunden

---

### TODO-011: History-Repository implementieren
**Beschreibung**: Repository für Status-History (Order & Payment)

**Akzeptanzkriterien**:
- [ ] `createOrderStatusHistory(history: OrderStatusHistory): Promise<void>`
- [ ] `createPaymentStatusHistory(history: PaymentStatusHistory): Promise<void>`
- [ ] `getOrderHistory(orderId: string): Promise<OrderStatusHistory[]>`
- [ ] `getPaymentHistory(paymentId: string): Promise<PaymentStatusHistory[]>`

**Test-Plan**:
- Unit Tests für alle Methoden
- Integration Tests
- Alle Tests grün

**Abhängigkeiten**: TODO-006

**Schätzung**: 2 Stunden

---

## 🎯 Phase 3: Order-Service (P0)

### TODO-012: Order-Service implementieren (Business-Logic)
**Beschreibung**: Service-Layer für Order-Operationen mit Business-Logic

**Akzeptanzkriterien**:
- [ ] `createOrder(orderData: CreateOrderInput): Promise<Order>`
  - Validiert Input
  - Prüft auf Duplikate (source + source_order_id)
  - Erstellt Order in Transaktion
  - Schreibt initialen Status in History
- [ ] `getOrderById(id: string): Promise<Order>`
- [ ] `getOrderBySource(source: string, sourceOrderId: string): Promise<Order>`
- [ ] `updateOrderStatus(orderId: string, newStatus: OrderStatus, changedBy?: string): Promise<void>`
  - Validiert Status-Transition
  - Schreibt in History
  - Transaktion

**Test-Plan**:
- Unit Tests für alle Service-Methoden
- Integration Tests mit DB
- Status-Transition-Validierung getestet
- Duplikat-Prüfung getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-009, TODO-011

**Schätzung**: 4-5 Stunden

---

### TODO-013: Order API Endpunkte implementieren
**Beschreibung**: REST API für Orders (Express/Fastify/etc.)

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/orders` - Order erstellen
  - Input Validation (JSON Schema)
  - Idempotenz-Check (Idempotency-Key Header)
  - Authentifizierung (API Key)
  - Response mit Order-Objekt
- [ ] `GET /api/v1/orders/:id` - Order abrufen
  - Authentifizierung
  - 404 wenn nicht gefunden
- [ ] `GET /api/v1/orders/by-source/:source/:sourceOrderId` - Order nach Source finden
  - Authentifizierung
  - 404 wenn nicht gefunden

**Test-Plan**:
- Integration Tests für alle Endpunkte
- Idempotenz-Test (gleicher Request 2x = gleiche Response)
- Validation-Tests (ungültige Inputs)
- Auth-Tests (ohne API Key = 401)
- Alle Tests grün

**Abhängigkeiten**: TODO-012

**Schätzung**: 4-5 Stunden

---

## 💳 Phase 4: Payment-Service (P0)

### TODO-014: Payment-Service implementieren
**Beschreibung**: Service-Layer für Payment-Operationen

**Akzeptanzkriterien**:
- [ ] `createPayment(paymentData: CreatePaymentInput): Promise<Payment>`
  - Validiert Input
  - Prüft Order existiert
  - Erstellt Payment in Transaktion
  - Schreibt initialen Status in History
- [ ] `getPaymentById(id: string): Promise<Payment>`
- [ ] `updatePaymentStatus(paymentId: string, newStatus: PaymentStatus, changedBy?: string): Promise<void>`
  - Validiert Status-Transition
  - Schreibt in History
  - Transaktion
- [ ] `findPaymentByProviderReference(provider: string, reference: string): Promise<Payment | null>`

**Test-Plan**:
- Unit Tests für alle Service-Methoden
- Integration Tests
- Status-Transition-Validierung
- Alle Tests grün

**Abhängigkeiten**: TODO-010, TODO-011

**Schätzung**: 3-4 Stunden

---

### TODO-015: Payment API Endpunkte implementieren
**Beschreibung**: REST API für Payments

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/payments` - Payment erstellen
  - Input Validation
  - Idempotenz-Check
  - Authentifizierung
  - Response mit Payment-Objekt
- [ ] `GET /api/v1/payments/:id` - Payment abrufen
  - Authentifizierung
  - 404 wenn nicht gefunden

**Test-Plan**:
- Integration Tests für alle Endpunkte
- Idempotenz-Test
- Validation-Tests
- Auth-Tests
- Alle Tests grün

**Abhängigkeiten**: TODO-014

**Schätzung**: 2-3 Stunden

---

## 🔐 Phase 5: Sicherheit & Authentifizierung (P0)

### TODO-016: API-Key-Authentifizierung implementieren
**Beschreibung**: Middleware für API-Key-Validierung

**Akzeptanzkriterien**:
- [ ] API-Key-Middleware
- [ ] API-Keys in DB oder Environment-Variablen
- [ ] Rate Limiting pro API-Key
- [ ] Alle Endpunkte (außer Health-Check) geschützt
- [ ] 401 bei ungültigem/fehlendem API-Key

**Test-Plan**:
- Tests für gültige API-Keys
- Tests für ungültige API-Keys
- Tests für fehlende API-Keys
- Rate Limiting getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-013, TODO-015

**Schätzung**: 3-4 Stunden

---

### TODO-017: Idempotenz-Mechanismus implementieren
**Beschreibung**: Idempotency-Key-Validierung für kritische Endpunkte

**Akzeptanzkriterien**:
- [ ] Idempotency-Key im Header (`Idempotency-Key`)
- [ ] Key-Store (DB oder Redis) für bereits verarbeitete Keys
- [ ] Gleiche Request-ID = gleiche Response (aus Cache)
- [ ] TTL für Idempotency-Keys (z.B. 24h)
- [ ] Funktioniert für POST /orders und POST /payments

**Test-Plan**:
- Test: Gleicher Request 2x = gleiche Response
- Test: Verschiedene Requests = verschiedene Responses
- Test: TTL funktioniert
- Alle Tests grün

**Abhängigkeiten**: TODO-013, TODO-015

**Schätzung**: 3-4 Stunden

---

## 🔔 Phase 6: Webhook-Handler (P1)

### TODO-018: Stripe-Webhook-Handler implementieren
**Beschreibung**: Webhook-Endpunkt für Stripe mit Signatur-Validierung

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/webhooks/stripe` Endpunkt
- [ ] Signatur-Validierung (X-Stripe-Signature Header)
- [ ] Idempotente Verarbeitung (Event-ID)
- [ ] Handler für `payment_intent.succeeded`
  - Findet Payment anhand provider_reference
  - Setzt Payment.Status = succeeded
  - Setzt Order.Status = paid (wenn alle Payments succeeded)
  - Schreibt in History
- [ ] Handler für `payment_intent.failed`
  - Setzt Payment.Status = failed
  - Schreibt in History

**Test-Plan**:
- Integration Tests mit Stripe CLI
- Signatur-Validierung getestet (gültig/ungültig)
- Idempotenz getestet (gleiche Event-ID 2x)
- Payment-Status-Update getestet
- Order-Status-Update getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-014, TODO-016

**Schätzung**: 5-6 Stunden

---

### TODO-019: BTCPay-Webhook-Handler implementieren
**Beschreibung**: Webhook-Endpunkt für BTCPay mit Signatur-Validierung

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/webhooks/btcpay` Endpunkt
- [ ] Signatur-Validierung (BTCPay-Sig Header)
- [ ] Idempotente Verarbeitung
- [ ] Handler für `invoice_settled`
  - Findet Payment anhand provider_reference
  - Setzt Payment.Status = succeeded
  - Setzt Order.Status = paid
  - Schreibt in History

**Test-Plan**:
- Integration Tests mit BTCPay Test-Server
- Signatur-Validierung getestet
- Idempotenz getestet
- Payment/Order-Status-Update getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-014, TODO-016

**Schätzung**: 4-5 Stunden

---

## 🔄 Phase 7: Callback-Mechanismus (P1)

### TODO-020: Callback-Service implementieren
**Beschreibung**: Service für Callbacks an Channels (WooCommerce, POS, etc.)

**Akzeptanzkriterien**:
- [ ] `sendCallbackToChannel(channel: string, callbackUrl: string, payload: CallbackPayload): Promise<void>`
- [ ] Idempotente Callbacks (gleiche Order-ID = kein Duplikat)
- [ ] Retry-Logik (Exponential Backoff, max 3 Retries)
- [ ] Timeout-Handling (max 30s)
- [ ] Callback-Status-Tracking (erfolgreich/fehlgeschlagen)

**Test-Plan**:
- Unit Tests für Callback-Logik
- Integration Tests mit Mock-Server
- Retry-Logik getestet
- Timeout getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-012, TODO-014

**Schätzung**: 4-5 Stunden

---

### TODO-021: Callback-Integration in Webhook-Handler
**Beschreibung**: Callbacks automatisch auslösen bei Status-Änderungen

**Akzeptanzkriterien**:
- [ ] Bei Order.Status = paid → Callback an Source-Channel
- [ ] Bei Payment.Status = succeeded → Callback an Source-Channel
- [ ] Callback-URL aus Order.metadata oder Config
- [ ] Async-Verarbeitung (nicht blockierend)

**Test-Plan**:
- Integration Tests
- Callback wird ausgelöst bei Status-Änderung
- Callback-Payload korrekt
- Alle Tests grün

**Abhängigkeiten**: TODO-020, TODO-018

**Schätzung**: 2-3 Stunden

---

## 🔌 Phase 8: Payment-Provider-Adapter (P1)

### TODO-022: Payment-Provider-Adapter-Interface definieren
**Beschreibung**: Abstraktes Interface für alle Payment-Provider

**Akzeptanzkriterien**:
- [ ] `IPaymentProvider` Interface mit:
  - `createPaymentIntent(order: Order, amount: number): Promise<PaymentIntent>`
  - `getPaymentStatus(reference: string): Promise<PaymentStatus>`
- [ ] `PaymentIntent` Interface (id, redirect_url, etc.)

**Test-Plan**:
- TypeScript kompiliert ohne Fehler
- Interface kann implementiert werden

**Abhängigkeiten**: TODO-014

**Schätzung**: 1 Stunde

---

### TODO-023: Stripe-Adapter implementieren
**Beschreibung**: Stripe-Integration als Payment-Provider

**Akzeptanzkriterien**:
- [ ] Implementiert `IPaymentProvider`
- [ ] `createPaymentIntent` erstellt Stripe Payment Intent
- [ ] Gibt redirect_url zurück
- [ ] Fehlerbehandlung für Stripe-API-Fehler
- [ ] Retry-Logik für transient errors

**Test-Plan**:
- Unit Tests mit Stripe-Mock
- Integration Tests mit Stripe Test-API
- Fehlerbehandlung getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-022

**Schätzung**: 4-5 Stunden

---

### TODO-024: BTCPay-Adapter implementieren
**Beschreibung**: BTCPay-Integration als Payment-Provider

**Akzeptanzkriterien**:
- [ ] Implementiert `IPaymentProvider`
- [ ] `createPaymentIntent` erstellt BTCPay Invoice
- [ ] Gibt redirect_url (QR-Code URL) zurück
- [ ] Fehlerbehandlung
- [ ] Retry-Logik

**Test-Plan**:
- Unit Tests mit BTCPay-Mock
- Integration Tests mit BTCPay Test-Server
- Fehlerbehandlung getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-022

**Schätzung**: 4-5 Stunden

---

## 📊 Phase 9: Monitoring & Logging (P1)

### TODO-025: Strukturiertes Logging implementieren
**Beschreibung**: JSON-Logging mit Request-ID, Log-Levels

**Akzeptanzkriterien**:
- [ ] Strukturierte Logs (JSON-Format)
- [ ] Log-Levels: DEBUG, INFO, WARN, ERROR
- [ ] Request-ID für Request-Tracking
- [ ] Logging für kritische Operationen:
  - Order erstellt
  - Payment erstellt
  - Status-Änderungen
  - Webhook-Empfang
  - Callback-Versand

**Test-Plan**:
- Logs werden in korrektem Format geschrieben
- Request-ID wird durchgereicht
- Log-Levels funktionieren
- Alle kritischen Operationen werden geloggt

**Abhängigkeiten**: TODO-012, TODO-014

**Schätzung**: 2-3 Stunden

---

### TODO-026: Health-Check Endpunkt implementieren
**Beschreibung**: Health-Check für Monitoring (Docker, Load-Balancer)

**Akzeptanzkriterien**:
- [ ] `GET /health` Endpunkt
  - Prüft DB-Connection
  - Gibt Status zurück (200 = healthy, 503 = unhealthy)
- [ ] `GET /health/ready` für Readiness
- [ ] `GET /health/live` für Liveness

**Test-Plan**:
- Health-Check antwortet 200 wenn DB verbunden
- Health-Check antwortet 503 wenn DB nicht verbunden
- Alle Tests grün

**Abhängigkeiten**: TODO-003

**Schätzung**: 1-2 Stunden

---

## 🚀 Phase 10: Deployment & Production-Ready (P0)

### TODO-027: Environment-Configuration
**Beschreibung**: Separate Configs für Dev/Staging/Production

**Akzeptanzkriterien**:
- [ ] Environment-Variablen für alle Konfigurationen:
  - DB-Connection
  - API-Keys (Stripe, BTCPay)
  - Callback-URLs
  - Log-Level
- [ ] `.env.example` mit allen Variablen
- [ ] Config-Validation beim Start
- [ ] Keine Secrets im Code

**Test-Plan**:
- App startet mit korrekten Environment-Variablen
- App schlägt fehl bei fehlenden kritischen Variablen
- Alle Tests grün

**Abhängigkeiten**: TODO-002

**Schätzung**: 2 Stunden

---

### TODO-028: CI/CD-Pipeline Setup
**Beschreibung**: GitHub Actions / GitLab CI für automatische Tests & Deployment

**Akzeptanzkriterien**:
- [ ] Pipeline bei jedem Commit:
  - Linting
  - Type-Checking
  - Unit Tests
  - Integration Tests
- [ ] Pipeline bei Merge zu Main:
  - Build Docker Image
  - Push zu Registry
  - Deployment zu Staging (optional)
- [ ] Pipeline bricht bei Fehlern

**Test-Plan**:
- Pipeline läuft bei Commit
- Pipeline bricht bei Linting-Fehlern
- Pipeline bricht bei Test-Fehlern
- Docker Image wird gebaut

**Abhängigkeiten**: TODO-002

**Schätzung**: 3-4 Stunden

---

### TODO-029: Production-Deployment-Vorbereitung
**Beschreibung**: Production-Config, Domain-Setup, SSL

**Akzeptanzkriterien**:
- [ ] Docker-Compose für Production
- [ ] Reverse-Proxy Config (Nginx/Traefik) für orders.mojo-institut.de
- [ ] SSL-Zertifikat (Let's Encrypt)
- [ ] Database-Backup-Strategie
- [ ] Monitoring-Setup (optional: Prometheus, Grafana)

**Test-Plan**:
- Domain zeigt auf Service
- SSL funktioniert
- Backup-Strategie dokumentiert

**Abhängigkeiten**: TODO-028

**Schätzung**: 4-5 Stunden

---

## 📝 Phase 11: Dokumentation (P1)

### TODO-030: API-Dokumentation erstellen
**Beschreibung**: OpenAPI/Swagger Spezifikation für alle Endpunkte

**Akzeptanzkriterien**:
- [ ] OpenAPI 3.0 Spezifikation
- [ ] Alle Endpunkte dokumentiert
- [ ] Request/Response-Schemas
- [ ] Beispiele
- [ ] Swagger UI erreichbar unter `/api-docs`

**Test-Plan**:
- Swagger UI zeigt alle Endpunkte
- Beispiele funktionieren
- Dokumentation ist vollständig

**Abhängigkeiten**: TODO-013, TODO-015

**Schätzung**: 3-4 Stunden

---

### TODO-031: README & Deployment-Dokumentation
**Beschreibung**: Vollständige Dokumentation für Entwickler & DevOps

**Akzeptanzkriterien**:
- [ ] README.md mit:
  - Projekt-Übersicht
  - Setup-Anleitung
  - Development-Guide
  - API-Übersicht
- [ ] DEPLOYMENT.md mit:
  - Deployment-Schritte
  - Environment-Variablen
  - Troubleshooting

**Test-Plan**:
- Entwickler kann Projekt mit README aufsetzen
- DevOps kann mit DEPLOYMENT.md deployen

**Abhängigkeiten**: Alle vorherigen To-Dos

**Schätzung**: 2-3 Stunden

---

## 📊 Zusammenfassung

### Prioritäten
- **P0 (Kritisch)**: TODO-001 bis TODO-017, TODO-027 bis TODO-029
- **P1 (Wichtig)**: TODO-018 bis TODO-026, TODO-030, TODO-031
- **P2 (Nice-to-Have)**: Später (z.B. WooCommerce-Adapter, POS-Adapter, B2B-Features)

### Geschätzte Gesamtzeit
- **P0**: ~60-75 Stunden (~8-10 Arbeitstage)
- **P1**: ~40-50 Stunden (~5-7 Arbeitstage)
- **Gesamt MVP (P0+P1)**: ~100-125 Stunden (~13-16 Arbeitstage)

### Nächste Schritte
1. **TODO-001** starten: Projekt-Grundstruktur erstellen
2. Schritt für Schritt durcharbeiten
3. Jedes To-Do testen bevor das nächste beginnt

---

**Status-Tracking**: Nutze diese Datei als Checkliste und markiere erledigte To-Dos mit `[x]`




**Projekt**: Order Hub  
**Domain**: orders.mojo-institut.de  
**Stack**: Docker + PostgreSQL + Backend (Node.js/TypeScript empfohlen)

---

## 📋 Übersicht

Dieser Plan unterteilt die Entwicklung in klare, testbare To-Dos. Jedes To-Do ist:
- **Spezifisch**: Klare Beschreibung was gemacht wird
- **Testbar**: Akzeptanzkriterien definiert
- **Abgrenzbar**: 1-4 Stunden Arbeit (max. 1 Tag)
- **Abhängig**: Klare Voraussetzungen

---

## 🎯 Phase 0: Projekt-Setup & Infrastruktur (P0)

### TODO-001: Projekt-Grundstruktur erstellen
**Beschreibung**: Basis-Projektstruktur mit Ordnerstruktur, Package-Management, TypeScript-Config

**Akzeptanzkriterien**:
- [ ] Projekt-Ordnerstruktur erstellt (`/src/domains`, `/src/api`, `/src/adapters`, etc.)
- [ ] `package.json` mit TypeScript, Express (oder ähnlich), Dependencies
- [ ] `tsconfig.json` mit strict mode
- [ ] `.gitignore` für Node.js/TypeScript
- [ ] `.env.example` Template
- [ ] README.md mit Setup-Anleitung

**Test-Plan**: 
- Projekt kann mit `npm install` installiert werden
- TypeScript kompiliert ohne Fehler
- Projekt-Struktur entspricht Architektur-Vorgaben

**Abhängigkeiten**: Keine

**Schätzung**: 1-2 Stunden

---

### TODO-002: Docker-Setup erstellen
**Beschreibung**: Docker-Compose mit Backend-Container und PostgreSQL-Container

**Akzeptanzkriterien**:
- [ ] `Dockerfile` für Backend-Service
- [ ] `docker-compose.yml` mit:
  - Backend-Service (Port 3000)
  - PostgreSQL-Service (Port 5432)
  - Volumes für DB-Persistenz
  - Environment-Variablen
- [ ] `.dockerignore` Datei
- [ ] Container starten mit `docker-compose up`
- [ ] Backend erreichbar auf `http://localhost:3000`
- [ ] PostgreSQL erreichbar auf `localhost:5432`

**Test-Plan**:
- `docker-compose up -d` startet beide Container
- `docker-compose ps` zeigt beide Container als "Up"
- Backend-Health-Check Endpunkt antwortet (später)

**Abhängigkeiten**: TODO-001

**Schätzung**: 2-3 Stunden

---

### TODO-003: Datenbank-Connection & Migration-Setup
**Beschreibung**: PostgreSQL-Connection einrichten, Migration-Tool (z.B. Knex.js, TypeORM, Prisma) konfigurieren

**Akzeptanzkriterien**:
- [ ] Datenbank-Connection funktioniert
- [ ] Migration-Tool installiert & konfiguriert
- [ ] Erste Test-Migration kann ausgeführt werden
- [ ] Rollback funktioniert
- [ ] Connection-Pooling konfiguriert

**Test-Plan**:
- Connection-Test-Script verbindet erfolgreich zur DB
- Migration kann erstellt und ausgeführt werden
- Rollback funktioniert

**Abhängigkeiten**: TODO-002

**Schätzung**: 2-3 Stunden

---

## 🗄️ Phase 1: Datenbank-Schema (P0)

### TODO-004: Basis-Tabellen erstellen (customers, orders, order_items)
**Beschreibung**: Migration für Core-Tabellen: customers, orders, order_items mit allen Feldern

**Akzeptanzkriterien**:
- [ ] `customers` Tabelle mit: id, email, name, created_at, updated_at
- [ ] `orders` Tabelle mit: id, customer_id, source, source_order_id, status, currency, totals (JSON), metadata (JSON), created_at, updated_at
- [ ] `order_items` Tabelle mit: id, order_id, name, sku, quantity, unit_price, tax_rate, tax_amount
- [ ] Foreign Keys definiert
- [ ] Unique Constraint auf `orders.source + source_order_id`
- [ ] Indexes auf Foreign Keys und häufig abgefragte Spalten

**Test-Plan**:
- Migration läuft ohne Fehler
- Tabellen existieren in DB
- Foreign Keys funktionieren
- Unique Constraint verhindert Duplikate
- Test-Insert funktioniert

**Abhängigkeiten**: TODO-003

**Schätzung**: 2-3 Stunden

---

### TODO-005: Payment-Tabellen erstellen
**Beschreibung**: Migration für payments Tabelle

**Akzeptanzkriterien**:
- [ ] `payments` Tabelle mit: id, order_id, provider, provider_reference, payment_method, status, amount, currency, metadata (JSON), created_at, updated_at
- [ ] Foreign Key zu orders
- [ ] Index auf provider_reference
- [ ] Index auf status

**Test-Plan**:
- Migration läuft ohne Fehler
- Foreign Key zu orders funktioniert
- Test-Insert funktioniert

**Abhängigkeiten**: TODO-004

**Schätzung**: 1-2 Stunden

---

### TODO-006: History-Tabellen erstellen (Auditing)
**Beschreibung**: Migration für order_status_history und payment_status_history

**Akzeptanzkriterien**:
- [ ] `order_status_history` mit: id, order_id, old_status, new_status, changed_by, changed_at
- [ ] `payment_status_history` mit: id, payment_id, old_status, new_status, changed_by, changed_at
- [ ] Foreign Keys zu orders/payments
- [ ] Indexes auf order_id/payment_id und changed_at

**Test-Plan**:
- Migration läuft ohne Fehler
- Foreign Keys funktionieren
- Test-Insert funktioniert

**Abhängigkeiten**: TODO-004, TODO-005

**Schätzung**: 1-2 Stunden

---

## 🔧 Phase 2: Core-Domänen (P0)

### TODO-007: Order-Domain-Model erstellen
**Beschreibung**: TypeScript-Modelle/Interfaces für Order, OrderItem, OrderStatus

**Akzeptanzkriterien**:
- [ ] Order-Interface mit allen Feldern
- [ ] OrderItem-Interface
- [ ] OrderStatus Enum (pending, confirmed, paid, shipped, cancelled, etc.)
- [ ] Type-Safety (kein `any`)
- [ ] JSON Schema für Validierung (optional, aber empfohlen)

**Test-Plan**:
- TypeScript kompiliert ohne Fehler
- Modelle können instanziiert werden
- Type-Checking funktioniert

**Abhängigkeiten**: TODO-004

**Schätzung**: 1-2 Stunden

---

### TODO-008: Payment-Domain-Model erstellen
**Beschreibung**: TypeScript-Modelle/Interfaces für Payment, PaymentStatus

**Akzeptanzkriterien**:
- [ ] Payment-Interface mit allen Feldern
- [ ] PaymentStatus Enum (pending, processing, succeeded, failed, cancelled)
- [ ] PaymentProvider Enum (stripe, btcpay, etc.)
- [ ] Type-Safety

**Test-Plan**:
- TypeScript kompiliert ohne Fehler
- Modelle können instanziiert werden

**Abhängigkeiten**: TODO-005

**Schätzung**: 1 Stunde

---

### TODO-009: Order-Repository implementieren
**Beschreibung**: Repository-Pattern für Order-Datenbankzugriffe (CRUD)

**Akzeptanzkriterien**:
- [ ] `create(order: Order): Promise<Order>`
- [ ] `findById(id: string): Promise<Order | null>`
- [ ] `findBySource(source: string, sourceOrderId: string): Promise<Order | null>`
- [ ] `updateStatus(orderId: string, newStatus: OrderStatus): Promise<void>`
- [ ] Alle Queries mit Prepared Statements / ORM
- [ ] Transaktionen für kritische Operationen

**Test-Plan**:
- Unit Tests für alle Repository-Methoden
- Integration Tests mit echter DB
- Alle Tests grün

**Abhängigkeiten**: TODO-007, TODO-004

**Schätzung**: 3-4 Stunden

---

### TODO-010: Payment-Repository implementieren
**Beschreibung**: Repository-Pattern für Payment-Datenbankzugriffe

**Akzeptanzkriterien**:
- [ ] `create(payment: Payment): Promise<Payment>`
- [ ] `findById(id: string): Promise<Payment | null>`
- [ ] `findByProviderReference(provider: string, reference: string): Promise<Payment | null>`
- [ ] `updateStatus(paymentId: string, newStatus: PaymentStatus): Promise<void>`
- [ ] Prepared Statements / ORM

**Test-Plan**:
- Unit Tests für alle Repository-Methoden
- Integration Tests mit echter DB
- Alle Tests grün

**Abhängigkeiten**: TODO-008, TODO-005

**Schätzung**: 2-3 Stunden

---

### TODO-011: History-Repository implementieren
**Beschreibung**: Repository für Status-History (Order & Payment)

**Akzeptanzkriterien**:
- [ ] `createOrderStatusHistory(history: OrderStatusHistory): Promise<void>`
- [ ] `createPaymentStatusHistory(history: PaymentStatusHistory): Promise<void>`
- [ ] `getOrderHistory(orderId: string): Promise<OrderStatusHistory[]>`
- [ ] `getPaymentHistory(paymentId: string): Promise<PaymentStatusHistory[]>`

**Test-Plan**:
- Unit Tests für alle Methoden
- Integration Tests
- Alle Tests grün

**Abhängigkeiten**: TODO-006

**Schätzung**: 2 Stunden

---

## 🎯 Phase 3: Order-Service (P0)

### TODO-012: Order-Service implementieren (Business-Logic)
**Beschreibung**: Service-Layer für Order-Operationen mit Business-Logic

**Akzeptanzkriterien**:
- [ ] `createOrder(orderData: CreateOrderInput): Promise<Order>`
  - Validiert Input
  - Prüft auf Duplikate (source + source_order_id)
  - Erstellt Order in Transaktion
  - Schreibt initialen Status in History
- [ ] `getOrderById(id: string): Promise<Order>`
- [ ] `getOrderBySource(source: string, sourceOrderId: string): Promise<Order>`
- [ ] `updateOrderStatus(orderId: string, newStatus: OrderStatus, changedBy?: string): Promise<void>`
  - Validiert Status-Transition
  - Schreibt in History
  - Transaktion

**Test-Plan**:
- Unit Tests für alle Service-Methoden
- Integration Tests mit DB
- Status-Transition-Validierung getestet
- Duplikat-Prüfung getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-009, TODO-011

**Schätzung**: 4-5 Stunden

---

### TODO-013: Order API Endpunkte implementieren
**Beschreibung**: REST API für Orders (Express/Fastify/etc.)

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/orders` - Order erstellen
  - Input Validation (JSON Schema)
  - Idempotenz-Check (Idempotency-Key Header)
  - Authentifizierung (API Key)
  - Response mit Order-Objekt
- [ ] `GET /api/v1/orders/:id` - Order abrufen
  - Authentifizierung
  - 404 wenn nicht gefunden
- [ ] `GET /api/v1/orders/by-source/:source/:sourceOrderId` - Order nach Source finden
  - Authentifizierung
  - 404 wenn nicht gefunden

**Test-Plan**:
- Integration Tests für alle Endpunkte
- Idempotenz-Test (gleicher Request 2x = gleiche Response)
- Validation-Tests (ungültige Inputs)
- Auth-Tests (ohne API Key = 401)
- Alle Tests grün

**Abhängigkeiten**: TODO-012

**Schätzung**: 4-5 Stunden

---

## 💳 Phase 4: Payment-Service (P0)

### TODO-014: Payment-Service implementieren
**Beschreibung**: Service-Layer für Payment-Operationen

**Akzeptanzkriterien**:
- [ ] `createPayment(paymentData: CreatePaymentInput): Promise<Payment>`
  - Validiert Input
  - Prüft Order existiert
  - Erstellt Payment in Transaktion
  - Schreibt initialen Status in History
- [ ] `getPaymentById(id: string): Promise<Payment>`
- [ ] `updatePaymentStatus(paymentId: string, newStatus: PaymentStatus, changedBy?: string): Promise<void>`
  - Validiert Status-Transition
  - Schreibt in History
  - Transaktion
- [ ] `findPaymentByProviderReference(provider: string, reference: string): Promise<Payment | null>`

**Test-Plan**:
- Unit Tests für alle Service-Methoden
- Integration Tests
- Status-Transition-Validierung
- Alle Tests grün

**Abhängigkeiten**: TODO-010, TODO-011

**Schätzung**: 3-4 Stunden

---

### TODO-015: Payment API Endpunkte implementieren
**Beschreibung**: REST API für Payments

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/payments` - Payment erstellen
  - Input Validation
  - Idempotenz-Check
  - Authentifizierung
  - Response mit Payment-Objekt
- [ ] `GET /api/v1/payments/:id` - Payment abrufen
  - Authentifizierung
  - 404 wenn nicht gefunden

**Test-Plan**:
- Integration Tests für alle Endpunkte
- Idempotenz-Test
- Validation-Tests
- Auth-Tests
- Alle Tests grün

**Abhängigkeiten**: TODO-014

**Schätzung**: 2-3 Stunden

---

## 🔐 Phase 5: Sicherheit & Authentifizierung (P0)

### TODO-016: API-Key-Authentifizierung implementieren
**Beschreibung**: Middleware für API-Key-Validierung

**Akzeptanzkriterien**:
- [ ] API-Key-Middleware
- [ ] API-Keys in DB oder Environment-Variablen
- [ ] Rate Limiting pro API-Key
- [ ] Alle Endpunkte (außer Health-Check) geschützt
- [ ] 401 bei ungültigem/fehlendem API-Key

**Test-Plan**:
- Tests für gültige API-Keys
- Tests für ungültige API-Keys
- Tests für fehlende API-Keys
- Rate Limiting getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-013, TODO-015

**Schätzung**: 3-4 Stunden

---

### TODO-017: Idempotenz-Mechanismus implementieren
**Beschreibung**: Idempotency-Key-Validierung für kritische Endpunkte

**Akzeptanzkriterien**:
- [ ] Idempotency-Key im Header (`Idempotency-Key`)
- [ ] Key-Store (DB oder Redis) für bereits verarbeitete Keys
- [ ] Gleiche Request-ID = gleiche Response (aus Cache)
- [ ] TTL für Idempotency-Keys (z.B. 24h)
- [ ] Funktioniert für POST /orders und POST /payments

**Test-Plan**:
- Test: Gleicher Request 2x = gleiche Response
- Test: Verschiedene Requests = verschiedene Responses
- Test: TTL funktioniert
- Alle Tests grün

**Abhängigkeiten**: TODO-013, TODO-015

**Schätzung**: 3-4 Stunden

---

## 🔔 Phase 6: Webhook-Handler (P1)

### TODO-018: Stripe-Webhook-Handler implementieren
**Beschreibung**: Webhook-Endpunkt für Stripe mit Signatur-Validierung

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/webhooks/stripe` Endpunkt
- [ ] Signatur-Validierung (X-Stripe-Signature Header)
- [ ] Idempotente Verarbeitung (Event-ID)
- [ ] Handler für `payment_intent.succeeded`
  - Findet Payment anhand provider_reference
  - Setzt Payment.Status = succeeded
  - Setzt Order.Status = paid (wenn alle Payments succeeded)
  - Schreibt in History
- [ ] Handler für `payment_intent.failed`
  - Setzt Payment.Status = failed
  - Schreibt in History

**Test-Plan**:
- Integration Tests mit Stripe CLI
- Signatur-Validierung getestet (gültig/ungültig)
- Idempotenz getestet (gleiche Event-ID 2x)
- Payment-Status-Update getestet
- Order-Status-Update getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-014, TODO-016

**Schätzung**: 5-6 Stunden

---

### TODO-019: BTCPay-Webhook-Handler implementieren
**Beschreibung**: Webhook-Endpunkt für BTCPay mit Signatur-Validierung

**Akzeptanzkriterien**:
- [ ] `POST /api/v1/webhooks/btcpay` Endpunkt
- [ ] Signatur-Validierung (BTCPay-Sig Header)
- [ ] Idempotente Verarbeitung
- [ ] Handler für `invoice_settled`
  - Findet Payment anhand provider_reference
  - Setzt Payment.Status = succeeded
  - Setzt Order.Status = paid
  - Schreibt in History

**Test-Plan**:
- Integration Tests mit BTCPay Test-Server
- Signatur-Validierung getestet
- Idempotenz getestet
- Payment/Order-Status-Update getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-014, TODO-016

**Schätzung**: 4-5 Stunden

---

## 🔄 Phase 7: Callback-Mechanismus (P1)

### TODO-020: Callback-Service implementieren
**Beschreibung**: Service für Callbacks an Channels (WooCommerce, POS, etc.)

**Akzeptanzkriterien**:
- [ ] `sendCallbackToChannel(channel: string, callbackUrl: string, payload: CallbackPayload): Promise<void>`
- [ ] Idempotente Callbacks (gleiche Order-ID = kein Duplikat)
- [ ] Retry-Logik (Exponential Backoff, max 3 Retries)
- [ ] Timeout-Handling (max 30s)
- [ ] Callback-Status-Tracking (erfolgreich/fehlgeschlagen)

**Test-Plan**:
- Unit Tests für Callback-Logik
- Integration Tests mit Mock-Server
- Retry-Logik getestet
- Timeout getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-012, TODO-014

**Schätzung**: 4-5 Stunden

---

### TODO-021: Callback-Integration in Webhook-Handler
**Beschreibung**: Callbacks automatisch auslösen bei Status-Änderungen

**Akzeptanzkriterien**:
- [ ] Bei Order.Status = paid → Callback an Source-Channel
- [ ] Bei Payment.Status = succeeded → Callback an Source-Channel
- [ ] Callback-URL aus Order.metadata oder Config
- [ ] Async-Verarbeitung (nicht blockierend)

**Test-Plan**:
- Integration Tests
- Callback wird ausgelöst bei Status-Änderung
- Callback-Payload korrekt
- Alle Tests grün

**Abhängigkeiten**: TODO-020, TODO-018

**Schätzung**: 2-3 Stunden

---

## 🔌 Phase 8: Payment-Provider-Adapter (P1)

### TODO-022: Payment-Provider-Adapter-Interface definieren
**Beschreibung**: Abstraktes Interface für alle Payment-Provider

**Akzeptanzkriterien**:
- [ ] `IPaymentProvider` Interface mit:
  - `createPaymentIntent(order: Order, amount: number): Promise<PaymentIntent>`
  - `getPaymentStatus(reference: string): Promise<PaymentStatus>`
- [ ] `PaymentIntent` Interface (id, redirect_url, etc.)

**Test-Plan**:
- TypeScript kompiliert ohne Fehler
- Interface kann implementiert werden

**Abhängigkeiten**: TODO-014

**Schätzung**: 1 Stunde

---

### TODO-023: Stripe-Adapter implementieren
**Beschreibung**: Stripe-Integration als Payment-Provider

**Akzeptanzkriterien**:
- [ ] Implementiert `IPaymentProvider`
- [ ] `createPaymentIntent` erstellt Stripe Payment Intent
- [ ] Gibt redirect_url zurück
- [ ] Fehlerbehandlung für Stripe-API-Fehler
- [ ] Retry-Logik für transient errors

**Test-Plan**:
- Unit Tests mit Stripe-Mock
- Integration Tests mit Stripe Test-API
- Fehlerbehandlung getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-022

**Schätzung**: 4-5 Stunden

---

### TODO-024: BTCPay-Adapter implementieren
**Beschreibung**: BTCPay-Integration als Payment-Provider

**Akzeptanzkriterien**:
- [ ] Implementiert `IPaymentProvider`
- [ ] `createPaymentIntent` erstellt BTCPay Invoice
- [ ] Gibt redirect_url (QR-Code URL) zurück
- [ ] Fehlerbehandlung
- [ ] Retry-Logik

**Test-Plan**:
- Unit Tests mit BTCPay-Mock
- Integration Tests mit BTCPay Test-Server
- Fehlerbehandlung getestet
- Alle Tests grün

**Abhängigkeiten**: TODO-022

**Schätzung**: 4-5 Stunden

---

## 📊 Phase 9: Monitoring & Logging (P1)

### TODO-025: Strukturiertes Logging implementieren
**Beschreibung**: JSON-Logging mit Request-ID, Log-Levels

**Akzeptanzkriterien**:
- [ ] Strukturierte Logs (JSON-Format)
- [ ] Log-Levels: DEBUG, INFO, WARN, ERROR
- [ ] Request-ID für Request-Tracking
- [ ] Logging für kritische Operationen:
  - Order erstellt
  - Payment erstellt
  - Status-Änderungen
  - Webhook-Empfang
  - Callback-Versand

**Test-Plan**:
- Logs werden in korrektem Format geschrieben
- Request-ID wird durchgereicht
- Log-Levels funktionieren
- Alle kritischen Operationen werden geloggt

**Abhängigkeiten**: TODO-012, TODO-014

**Schätzung**: 2-3 Stunden

---

### TODO-026: Health-Check Endpunkt implementieren
**Beschreibung**: Health-Check für Monitoring (Docker, Load-Balancer)

**Akzeptanzkriterien**:
- [ ] `GET /health` Endpunkt
  - Prüft DB-Connection
  - Gibt Status zurück (200 = healthy, 503 = unhealthy)
- [ ] `GET /health/ready` für Readiness
- [ ] `GET /health/live` für Liveness

**Test-Plan**:
- Health-Check antwortet 200 wenn DB verbunden
- Health-Check antwortet 503 wenn DB nicht verbunden
- Alle Tests grün

**Abhängigkeiten**: TODO-003

**Schätzung**: 1-2 Stunden

---

## 🚀 Phase 10: Deployment & Production-Ready (P0)

### TODO-027: Environment-Configuration
**Beschreibung**: Separate Configs für Dev/Staging/Production

**Akzeptanzkriterien**:
- [ ] Environment-Variablen für alle Konfigurationen:
  - DB-Connection
  - API-Keys (Stripe, BTCPay)
  - Callback-URLs
  - Log-Level
- [ ] `.env.example` mit allen Variablen
- [ ] Config-Validation beim Start
- [ ] Keine Secrets im Code

**Test-Plan**:
- App startet mit korrekten Environment-Variablen
- App schlägt fehl bei fehlenden kritischen Variablen
- Alle Tests grün

**Abhängigkeiten**: TODO-002

**Schätzung**: 2 Stunden

---

### TODO-028: CI/CD-Pipeline Setup
**Beschreibung**: GitHub Actions / GitLab CI für automatische Tests & Deployment

**Akzeptanzkriterien**:
- [ ] Pipeline bei jedem Commit:
  - Linting
  - Type-Checking
  - Unit Tests
  - Integration Tests
- [ ] Pipeline bei Merge zu Main:
  - Build Docker Image
  - Push zu Registry
  - Deployment zu Staging (optional)
- [ ] Pipeline bricht bei Fehlern

**Test-Plan**:
- Pipeline läuft bei Commit
- Pipeline bricht bei Linting-Fehlern
- Pipeline bricht bei Test-Fehlern
- Docker Image wird gebaut

**Abhängigkeiten**: TODO-002

**Schätzung**: 3-4 Stunden

---

### TODO-029: Production-Deployment-Vorbereitung
**Beschreibung**: Production-Config, Domain-Setup, SSL

**Akzeptanzkriterien**:
- [ ] Docker-Compose für Production
- [ ] Reverse-Proxy Config (Nginx/Traefik) für orders.mojo-institut.de
- [ ] SSL-Zertifikat (Let's Encrypt)
- [ ] Database-Backup-Strategie
- [ ] Monitoring-Setup (optional: Prometheus, Grafana)

**Test-Plan**:
- Domain zeigt auf Service
- SSL funktioniert
- Backup-Strategie dokumentiert

**Abhängigkeiten**: TODO-028

**Schätzung**: 4-5 Stunden

---

## 📝 Phase 11: Dokumentation (P1)

### TODO-030: API-Dokumentation erstellen
**Beschreibung**: OpenAPI/Swagger Spezifikation für alle Endpunkte

**Akzeptanzkriterien**:
- [ ] OpenAPI 3.0 Spezifikation
- [ ] Alle Endpunkte dokumentiert
- [ ] Request/Response-Schemas
- [ ] Beispiele
- [ ] Swagger UI erreichbar unter `/api-docs`

**Test-Plan**:
- Swagger UI zeigt alle Endpunkte
- Beispiele funktionieren
- Dokumentation ist vollständig

**Abhängigkeiten**: TODO-013, TODO-015

**Schätzung**: 3-4 Stunden

---

### TODO-031: README & Deployment-Dokumentation
**Beschreibung**: Vollständige Dokumentation für Entwickler & DevOps

**Akzeptanzkriterien**:
- [ ] README.md mit:
  - Projekt-Übersicht
  - Setup-Anleitung
  - Development-Guide
  - API-Übersicht
- [ ] DEPLOYMENT.md mit:
  - Deployment-Schritte
  - Environment-Variablen
  - Troubleshooting

**Test-Plan**:
- Entwickler kann Projekt mit README aufsetzen
- DevOps kann mit DEPLOYMENT.md deployen

**Abhängigkeiten**: Alle vorherigen To-Dos

**Schätzung**: 2-3 Stunden

---

## 📊 Zusammenfassung

### Prioritäten
- **P0 (Kritisch)**: TODO-001 bis TODO-017, TODO-027 bis TODO-029
- **P1 (Wichtig)**: TODO-018 bis TODO-026, TODO-030, TODO-031
- **P2 (Nice-to-Have)**: Später (z.B. WooCommerce-Adapter, POS-Adapter, B2B-Features)

### Geschätzte Gesamtzeit
- **P0**: ~60-75 Stunden (~8-10 Arbeitstage)
- **P1**: ~40-50 Stunden (~5-7 Arbeitstage)
- **Gesamt MVP (P0+P1)**: ~100-125 Stunden (~13-16 Arbeitstage)

### Nächste Schritte
1. **TODO-001** starten: Projekt-Grundstruktur erstellen
2. Schritt für Schritt durcharbeiten
3. Jedes To-Do testen bevor das nächste beginnt

---

**Status-Tracking**: Nutze diese Datei als Checkliste und markiere erledigte To-Dos mit `[x]`





