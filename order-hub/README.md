# Order Hub

Universal Commerce HUB - Central order and payment management system for MOJO Institut.

**Domain**: paymentsapi.mojo-institut.de  
**Status**: MVP Complete ✅

## 🎯 Überblick

Der Order Hub ist ein zentraler Service zur Verwaltung von:
- Bestellungen (Orders)
- Zahlungen (Payments)
- Statusverläufen & Auditing
- Rückmeldungen an externe Systeme (WooCommerce, POS, B2B)

## 🏗️ Architektur

Modularer Monolith mit klarer Domänentrennung:
- **Domains**: Order, Payment, Customer, Event
- **Adapters**: WooCommerce, Stripe, BTCPay
- **API**: REST API v1
- **Infrastructure**: Database, Logging, Monitoring

## ✨ Features

### Implementiert (MVP)
- ✅ Order Management (CRUD, Status-Transitions)
- ✅ Payment Management (CRUD, Provider-Integration)
- ✅ API-Key-Authentifizierung
- ✅ Rate Limiting
- ✅ Idempotenz-Mechanismus
- ✅ Stripe Webhook-Integration
- ✅ BTCPay Webhook-Integration
- ✅ Callback-System für externe Systeme
- ✅ Status-History & Auditing
- ✅ PostgreSQL mit Migrationen
- ✅ Docker-Setup

## 🚀 Quick Start

### Voraussetzungen

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Docker & Docker Compose

### Installation

```bash
# Dependencies installieren
npm install

# Environment-Variablen konfigurieren
cp .env.example .env
# .env Datei anpassen

# Datenbank-Migrationen ausführen
npm run migrate

# Development-Server starten
npm run dev
```

### Mit Docker

```bash
# Production Build & Start
docker-compose up -d --build

# Development Mode (mit Hot-Reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Migrationen ausführen
docker-compose exec backend npm run migrate

# Logs anzeigen
docker-compose logs -f backend

# Container stoppen
docker-compose down

# Status prüfen
docker-compose ps
```

## 📡 API Endpoints

### Orders
```
POST   /api/v1/orders                           - Create order
GET    /api/v1/orders/:id                       - Get order by ID
GET    /api/v1/orders/by-source/:source/:id    - Get order by source
GET    /api/v1/orders/:id/history               - Get order history
```

### Payments
```
POST   /api/v1/payments                         - Create payment
GET    /api/v1/payments/:id                     - Get payment by ID
GET    /api/v1/payments/order/:orderId          - Get payments for order
GET    /api/v1/payments/:id/history             - Get payment history
```

### Webhooks
```
POST   /api/v1/webhooks/stripe                  - Stripe webhook
POST   /api/v1/webhooks/btcpay                  - BTCPay webhook
```

### Authentication
All endpoints (except webhooks & health) require API key:
```
Authorization: Bearer <your-api-key>
```

### Idempotency
Critical endpoints support idempotency:
```
Idempotency-Key: <unique-key>
```

## 🗄️ Database

### Migrationen

```bash
# Neue Migration erstellen
npm run migrate:make migration_name

# Migrationen ausführen
npm run migrate

# Migration-Status prüfen
npm run migrate:status

# Letzte Migration rückgängig machen
npm run migrate:rollback
```

### Schema

- **customers** - Kundendaten
- **orders** - Bestellungen
- **order_items** - Bestellpositionen
- **payments** - Zahlungen
- **order_status_history** - Order-Status-Historie
- **payment_status_history** - Payment-Status-Historie
- **idempotency_keys** - Idempotenz-Keys

## 🧪 Testing

```bash
# Connection testen
npm run test:db

# Schema validieren
npm run validate:schema

# Alle Tests (wenn implementiert)
npm test
```

## 🔒 Sicherheit

- API-Key-Authentifizierung für alle Endpunkte
- Webhook-Signatur-Validierung (Stripe, BTCPay)
- Rate Limiting (100 req/15min standard)
- Idempotenz für kritische Operationen
- HTTPS in Production (empfohlen)
- Helmet Security Headers
- CORS-Konfiguration

## 📝 Environment-Variablen

Siehe `.env.example` für alle verfügbaren Konfigurationsoptionen.

Wichtigste Variablen:
- `DB_*` - Datenbank-Konfiguration
- `API_KEY_SECRET` / `API_KEYS` - API-Authentifizierung
- `STRIPE_*` - Stripe-Integration
- `BTCPAY_*` - BTCPay-Integration
- `*_CALLBACK_URL` - Callback-URLs für Channels

## 🐳 Docker

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📊 Monitoring

- Health-Check: `/health`
- API Health: `/api/v1/health`
- Database-Connection-Status
- Connection-Pool-Status

## 🔄 Workflow

### Order-Creation
1. External system (WooCommerce, POS) creates order via API
2. Order Hub validates and stores order
3. Returns order ID
4. External system creates payment
5. Payment provider processes payment
6. Webhook updates payment status
7. Order Hub updates order status
8. Callback sent to external system

### Status-Transitions

**Order**: pending → confirmed → paid → processing → shipped → delivered  
**Payment**: pending → processing → succeeded

All transitions are validated and logged in history tables.

## 🎯 Roadmap

### MVP (Completed)
- [x] Order & Payment Management
- [x] API-Key-Auth & Rate Limiting
- [x] Idempotenz
- [x] Stripe & BTCPay Webhooks
- [x] Callback-System

### Phase 2 (Planned)
- [ ] Payment-Provider-Adapter (abstrahiert)
- [ ] WooCommerce-Adapter
- [ ] POS-Adapter
- [ ] Structured Logging (Winston)
- [ ] Metrics & Observability
- [ ] Integration Tests
- [ ] E2E Tests

### Phase 3 (Future)
- [ ] B2B-Vertragsstrecke
- [ ] Multi-Currency Support
- [ ] Refund-Handling
- [ ] Advanced Reconciliation
- [ ] Admin-Dashboard

## 🤝 Contributing

Bitte folge den Entwicklungsstandards in `.cursorrules`.

## 📄 License

ISC

---

**Entwickelt für MOJO Institut** 🚀

Universal Commerce HUB - Central order and payment management system for MOJO Institut.

**Domain**: paymentsapi.mojo-institut.de  
**Status**: MVP Complete ✅

## 🎯 Überblick

Der Order Hub ist ein zentraler Service zur Verwaltung von:
- Bestellungen (Orders)
- Zahlungen (Payments)
- Statusverläufen & Auditing
- Rückmeldungen an externe Systeme (WooCommerce, POS, B2B)

## 🏗️ Architektur

Modularer Monolith mit klarer Domänentrennung:
- **Domains**: Order, Payment, Customer, Event
- **Adapters**: WooCommerce, Stripe, BTCPay
- **API**: REST API v1
- **Infrastructure**: Database, Logging, Monitoring

## ✨ Features

### Implementiert (MVP)
- ✅ Order Management (CRUD, Status-Transitions)
- ✅ Payment Management (CRUD, Provider-Integration)
- ✅ API-Key-Authentifizierung
- ✅ Rate Limiting
- ✅ Idempotenz-Mechanismus
- ✅ Stripe Webhook-Integration
- ✅ BTCPay Webhook-Integration
- ✅ Callback-System für externe Systeme
- ✅ Status-History & Auditing
- ✅ PostgreSQL mit Migrationen
- ✅ Docker-Setup

## 🚀 Quick Start

### Voraussetzungen

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Docker & Docker Compose

### Installation

```bash
# Dependencies installieren
npm install

# Environment-Variablen konfigurieren
cp .env.example .env
# .env Datei anpassen

# Datenbank-Migrationen ausführen
npm run migrate

# Development-Server starten
npm run dev
```

### Mit Docker

```bash
# Production Build & Start
docker-compose up -d --build

# Development Mode (mit Hot-Reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Migrationen ausführen
docker-compose exec backend npm run migrate

# Logs anzeigen
docker-compose logs -f backend

# Container stoppen
docker-compose down

# Status prüfen
docker-compose ps
```

## 📡 API Endpoints

### Orders
```
POST   /api/v1/orders                           - Create order
GET    /api/v1/orders/:id                       - Get order by ID
GET    /api/v1/orders/by-source/:source/:id    - Get order by source
GET    /api/v1/orders/:id/history               - Get order history
```

### Payments
```
POST   /api/v1/payments                         - Create payment
GET    /api/v1/payments/:id                     - Get payment by ID
GET    /api/v1/payments/order/:orderId          - Get payments for order
GET    /api/v1/payments/:id/history             - Get payment history
```

### Webhooks
```
POST   /api/v1/webhooks/stripe                  - Stripe webhook
POST   /api/v1/webhooks/btcpay                  - BTCPay webhook
```

### Authentication
All endpoints (except webhooks & health) require API key:
```
Authorization: Bearer <your-api-key>
```

### Idempotency
Critical endpoints support idempotency:
```
Idempotency-Key: <unique-key>
```

## 🗄️ Database

### Migrationen

```bash
# Neue Migration erstellen
npm run migrate:make migration_name

# Migrationen ausführen
npm run migrate

# Migration-Status prüfen
npm run migrate:status

# Letzte Migration rückgängig machen
npm run migrate:rollback
```

### Schema

- **customers** - Kundendaten
- **orders** - Bestellungen
- **order_items** - Bestellpositionen
- **payments** - Zahlungen
- **order_status_history** - Order-Status-Historie
- **payment_status_history** - Payment-Status-Historie
- **idempotency_keys** - Idempotenz-Keys

## 🧪 Testing

```bash
# Connection testen
npm run test:db

# Schema validieren
npm run validate:schema

# Alle Tests (wenn implementiert)
npm test
```

## 🔒 Sicherheit

- API-Key-Authentifizierung für alle Endpunkte
- Webhook-Signatur-Validierung (Stripe, BTCPay)
- Rate Limiting (100 req/15min standard)
- Idempotenz für kritische Operationen
- HTTPS in Production (empfohlen)
- Helmet Security Headers
- CORS-Konfiguration

## 📝 Environment-Variablen

Siehe `.env.example` für alle verfügbaren Konfigurationsoptionen.

Wichtigste Variablen:
- `DB_*` - Datenbank-Konfiguration
- `API_KEY_SECRET` / `API_KEYS` - API-Authentifizierung
- `STRIPE_*` - Stripe-Integration
- `BTCPAY_*` - BTCPay-Integration
- `*_CALLBACK_URL` - Callback-URLs für Channels

## 🐳 Docker

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📊 Monitoring

- Health-Check: `/health`
- API Health: `/api/v1/health`
- Database-Connection-Status
- Connection-Pool-Status

## 🔄 Workflow

### Order-Creation
1. External system (WooCommerce, POS) creates order via API
2. Order Hub validates and stores order
3. Returns order ID
4. External system creates payment
5. Payment provider processes payment
6. Webhook updates payment status
7. Order Hub updates order status
8. Callback sent to external system

### Status-Transitions

**Order**: pending → confirmed → paid → processing → shipped → delivered  
**Payment**: pending → processing → succeeded

All transitions are validated and logged in history tables.

## 🎯 Roadmap

### MVP (Completed)
- [x] Order & Payment Management
- [x] API-Key-Auth & Rate Limiting
- [x] Idempotenz
- [x] Stripe & BTCPay Webhooks
- [x] Callback-System

### Phase 2 (Planned)
- [ ] Payment-Provider-Adapter (abstrahiert)
- [ ] WooCommerce-Adapter
- [ ] POS-Adapter
- [ ] Structured Logging (Winston)
- [ ] Metrics & Observability
- [ ] Integration Tests
- [ ] E2E Tests

### Phase 3 (Future)
- [ ] B2B-Vertragsstrecke
- [ ] Multi-Currency Support
- [ ] Refund-Handling
- [ ] Advanced Reconciliation
- [ ] Admin-Dashboard

## 🤝 Contributing

Bitte folge den Entwicklungsstandards in `.cursorrules`.

## 📄 License

ISC

---

**Entwickelt für MOJO Institut** 🚀

Universal Commerce HUB - Central order and payment management system for MOJO Institut.

**Domain**: paymentsapi.mojo-institut.de  
**Status**: MVP Complete ✅

## 🎯 Überblick

Der Order Hub ist ein zentraler Service zur Verwaltung von:
- Bestellungen (Orders)
- Zahlungen (Payments)
- Statusverläufen & Auditing
- Rückmeldungen an externe Systeme (WooCommerce, POS, B2B)

## 🏗️ Architektur

Modularer Monolith mit klarer Domänentrennung:
- **Domains**: Order, Payment, Customer, Event
- **Adapters**: WooCommerce, Stripe, BTCPay
- **API**: REST API v1
- **Infrastructure**: Database, Logging, Monitoring

## ✨ Features

### Implementiert (MVP)
- ✅ Order Management (CRUD, Status-Transitions)
- ✅ Payment Management (CRUD, Provider-Integration)
- ✅ API-Key-Authentifizierung
- ✅ Rate Limiting
- ✅ Idempotenz-Mechanismus
- ✅ Stripe Webhook-Integration
- ✅ BTCPay Webhook-Integration
- ✅ Callback-System für externe Systeme
- ✅ Status-History & Auditing
- ✅ PostgreSQL mit Migrationen
- ✅ Docker-Setup

## 🚀 Quick Start

### Voraussetzungen

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Docker & Docker Compose

### Installation

```bash
# Dependencies installieren
npm install

# Environment-Variablen konfigurieren
cp .env.example .env
# .env Datei anpassen

# Datenbank-Migrationen ausführen
npm run migrate

# Development-Server starten
npm run dev
```

### Mit Docker

```bash
# Production Build & Start
docker-compose up -d --build

# Development Mode (mit Hot-Reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Migrationen ausführen
docker-compose exec backend npm run migrate

# Logs anzeigen
docker-compose logs -f backend

# Container stoppen
docker-compose down

# Status prüfen
docker-compose ps
```

## 📡 API Endpoints

### Orders
```
POST   /api/v1/orders                           - Create order
GET    /api/v1/orders/:id                       - Get order by ID
GET    /api/v1/orders/by-source/:source/:id    - Get order by source
GET    /api/v1/orders/:id/history               - Get order history
```

### Payments
```
POST   /api/v1/payments                         - Create payment
GET    /api/v1/payments/:id                     - Get payment by ID
GET    /api/v1/payments/order/:orderId          - Get payments for order
GET    /api/v1/payments/:id/history             - Get payment history
```

### Webhooks
```
POST   /api/v1/webhooks/stripe                  - Stripe webhook
POST   /api/v1/webhooks/btcpay                  - BTCPay webhook
```

### Authentication
All endpoints (except webhooks & health) require API key:
```
Authorization: Bearer <your-api-key>
```

### Idempotency
Critical endpoints support idempotency:
```
Idempotency-Key: <unique-key>
```

## 🗄️ Database

### Migrationen

```bash
# Neue Migration erstellen
npm run migrate:make migration_name

# Migrationen ausführen
npm run migrate

# Migration-Status prüfen
npm run migrate:status

# Letzte Migration rückgängig machen
npm run migrate:rollback
```

### Schema

- **customers** - Kundendaten
- **orders** - Bestellungen
- **order_items** - Bestellpositionen
- **payments** - Zahlungen
- **order_status_history** - Order-Status-Historie
- **payment_status_history** - Payment-Status-Historie
- **idempotency_keys** - Idempotenz-Keys

## 🧪 Testing

```bash
# Connection testen
npm run test:db

# Schema validieren
npm run validate:schema

# Alle Tests (wenn implementiert)
npm test
```

## 🔒 Sicherheit

- API-Key-Authentifizierung für alle Endpunkte
- Webhook-Signatur-Validierung (Stripe, BTCPay)
- Rate Limiting (100 req/15min standard)
- Idempotenz für kritische Operationen
- HTTPS in Production (empfohlen)
- Helmet Security Headers
- CORS-Konfiguration

## 📝 Environment-Variablen

Siehe `.env.example` für alle verfügbaren Konfigurationsoptionen.

Wichtigste Variablen:
- `DB_*` - Datenbank-Konfiguration
- `API_KEY_SECRET` / `API_KEYS` - API-Authentifizierung
- `STRIPE_*` - Stripe-Integration
- `BTCPAY_*` - BTCPay-Integration
- `*_CALLBACK_URL` - Callback-URLs für Channels

## 🐳 Docker

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📊 Monitoring

- Health-Check: `/health`
- API Health: `/api/v1/health`
- Database-Connection-Status
- Connection-Pool-Status

## 🔄 Workflow

### Order-Creation
1. External system (WooCommerce, POS) creates order via API
2. Order Hub validates and stores order
3. Returns order ID
4. External system creates payment
5. Payment provider processes payment
6. Webhook updates payment status
7. Order Hub updates order status
8. Callback sent to external system

### Status-Transitions

**Order**: pending → confirmed → paid → processing → shipped → delivered  
**Payment**: pending → processing → succeeded

All transitions are validated and logged in history tables.

## 🎯 Roadmap

### MVP (Completed)
- [x] Order & Payment Management
- [x] API-Key-Auth & Rate Limiting
- [x] Idempotenz
- [x] Stripe & BTCPay Webhooks
- [x] Callback-System

### Phase 2 (Planned)
- [ ] Payment-Provider-Adapter (abstrahiert)
- [ ] WooCommerce-Adapter
- [ ] POS-Adapter
- [ ] Structured Logging (Winston)
- [ ] Metrics & Observability
- [ ] Integration Tests
- [ ] E2E Tests

### Phase 3 (Future)
- [ ] B2B-Vertragsstrecke
- [ ] Multi-Currency Support
- [ ] Refund-Handling
- [ ] Advanced Reconciliation
- [ ] Admin-Dashboard

## 🤝 Contributing

Bitte folge den Entwicklungsstandards in `.cursorrules`.

## 📄 License

ISC

---

**Entwickelt für MOJO Institut** 🚀
