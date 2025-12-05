# Order Hub Admin Dashboard

React-Admin basiertes Dashboard für Order Hub - einfache Visualisierung und Verwaltung von Orders und Payments.

## Features

- 📊 Dashboard mit Statistiken (Total Orders, Revenue, Success Rate)
- 📦 Order-Liste mit Filtern (Status, Source, Date Range)
- 💳 Payment-Liste mit Filtern (Status, Provider)
- 🔍 Detailansichten für Orders und Payments
- 🎨 Material-UI Design
- 🔐 API-Key-Authentifizierung

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: React-Admin 4 + Material-UI 5
- **Build Tool**: Vite
- **Server**: Nginx (Production)
- **Docker**: Multi-stage build

## Entwicklung

### Voraussetzungen

- Node.js >= 18
- Order Hub API läuft auf `http://localhost:3000`

### Setup

```bash
# Dependencies installieren
npm install

# Environment-Variablen
cp .env.example .env
# API_URL und API_KEY anpassen

# Dev-Server starten
npm run dev
```

Dashboard läuft auf: `http://localhost:3001`

### Build

```bash
# Production Build
npm run build

# Preview
npm run preview
```

## Docker

### Development

```bash
docker-compose -f docker-compose.dev.yml up
```

### Production

```bash
# Build und starten
docker-compose up -d --build

# Logs
docker-compose logs -f

# Stoppen
docker-compose down
```

Admin-Dashboard läuft auf: `http://localhost:3001`

## Configuration

### Environment Variables

- `VITE_API_URL` - Order Hub API URL (default: http://localhost:3000)
- `VITE_API_KEY` - API Key für Authentifizierung
- `VITE_APP_TITLE` - Dashboard Title

### API Connection

Das Dashboard konsumiert folgende Order Hub API Endpunkte:

- `GET /api/v1/orders` - Liste aller Orders
- `GET /api/v1/orders/:id` - Order Details
- `GET /api/v1/payments` - Liste aller Payments
- `GET /api/v1/payments/:id` - Payment Details

## Features im Detail

### Dashboard
- Total Orders (alle)
- Paid Orders (bezahlt)
- Total Revenue (Gesamtumsatz)
- Success Rate (Erfolgsquote Payments)
- Recent Orders (letzte 5)
- Recent Payments (letzte 5)

### Order List
**Filter:**
- Search (Order ID, Source Order ID)
- Status (pending, paid, shipped, etc.)
- Source (woo, pos, b2b)
- Date Range (From/To)

**Columns:**
- Order ID
- Source Order ID
- Source
- Status (mit Farben)
- Total Amount
- Currency
- Created Date

### Payment List
**Filter:**
- Search (Payment ID)
- Status (succeeded, failed, etc.)
- Provider (stripe, btcpay, etc.)

**Columns:**
- Payment ID
- Order ID
- Provider
- Method
- Status (mit Farben)
- Amount
- Created Date

### Detail Views
- Order Details mit Items
- Payment Details
- Status History (geplant)

## Netzwerk

Das Admin-Dashboard verbindet sich mit dem Order Hub über:
- Direkter API-Call (Development)
- Docker-Network (Production)

Network: `order-hub_order-hub-network`

## Security

- API-Key-Authentifizierung
- Nginx Security Headers
- No sensitive data in frontend

## Deployment

### Mit Order Hub zusammen

```bash
# In order-hub Verzeichnis
docker-compose up -d

# In order-hub-admin Verzeichnis  
docker-compose up -d
```

Beide Services teilen sich das gleiche Docker-Network.

## Entwickelt für MOJO Institut

🚀 **Status**: Ready for Production




React-Admin basiertes Dashboard für Order Hub - einfache Visualisierung und Verwaltung von Orders und Payments.

## Features

- 📊 Dashboard mit Statistiken (Total Orders, Revenue, Success Rate)
- 📦 Order-Liste mit Filtern (Status, Source, Date Range)
- 💳 Payment-Liste mit Filtern (Status, Provider)
- 🔍 Detailansichten für Orders und Payments
- 🎨 Material-UI Design
- 🔐 API-Key-Authentifizierung

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: React-Admin 4 + Material-UI 5
- **Build Tool**: Vite
- **Server**: Nginx (Production)
- **Docker**: Multi-stage build

## Entwicklung

### Voraussetzungen

- Node.js >= 18
- Order Hub API läuft auf `http://localhost:3000`

### Setup

```bash
# Dependencies installieren
npm install

# Environment-Variablen
cp .env.example .env
# API_URL und API_KEY anpassen

# Dev-Server starten
npm run dev
```

Dashboard läuft auf: `http://localhost:3001`

### Build

```bash
# Production Build
npm run build

# Preview
npm run preview
```

## Docker

### Development

```bash
docker-compose -f docker-compose.dev.yml up
```

### Production

```bash
# Build und starten
docker-compose up -d --build

# Logs
docker-compose logs -f

# Stoppen
docker-compose down
```

Admin-Dashboard läuft auf: `http://localhost:3001`

## Configuration

### Environment Variables

- `VITE_API_URL` - Order Hub API URL (default: http://localhost:3000)
- `VITE_API_KEY` - API Key für Authentifizierung
- `VITE_APP_TITLE` - Dashboard Title

### API Connection

Das Dashboard konsumiert folgende Order Hub API Endpunkte:

- `GET /api/v1/orders` - Liste aller Orders
- `GET /api/v1/orders/:id` - Order Details
- `GET /api/v1/payments` - Liste aller Payments
- `GET /api/v1/payments/:id` - Payment Details

## Features im Detail

### Dashboard
- Total Orders (alle)
- Paid Orders (bezahlt)
- Total Revenue (Gesamtumsatz)
- Success Rate (Erfolgsquote Payments)
- Recent Orders (letzte 5)
- Recent Payments (letzte 5)

### Order List
**Filter:**
- Search (Order ID, Source Order ID)
- Status (pending, paid, shipped, etc.)
- Source (woo, pos, b2b)
- Date Range (From/To)

**Columns:**
- Order ID
- Source Order ID
- Source
- Status (mit Farben)
- Total Amount
- Currency
- Created Date

### Payment List
**Filter:**
- Search (Payment ID)
- Status (succeeded, failed, etc.)
- Provider (stripe, btcpay, etc.)

**Columns:**
- Payment ID
- Order ID
- Provider
- Method
- Status (mit Farben)
- Amount
- Created Date

### Detail Views
- Order Details mit Items
- Payment Details
- Status History (geplant)

## Netzwerk

Das Admin-Dashboard verbindet sich mit dem Order Hub über:
- Direkter API-Call (Development)
- Docker-Network (Production)

Network: `order-hub_order-hub-network`

## Security

- API-Key-Authentifizierung
- Nginx Security Headers
- No sensitive data in frontend

## Deployment

### Mit Order Hub zusammen

```bash
# In order-hub Verzeichnis
docker-compose up -d

# In order-hub-admin Verzeichnis  
docker-compose up -d
```

Beide Services teilen sich das gleiche Docker-Network.

## Entwickelt für MOJO Institut

🚀 **Status**: Ready for Production




React-Admin basiertes Dashboard für Order Hub - einfache Visualisierung und Verwaltung von Orders und Payments.

## Features

- 📊 Dashboard mit Statistiken (Total Orders, Revenue, Success Rate)
- 📦 Order-Liste mit Filtern (Status, Source, Date Range)
- 💳 Payment-Liste mit Filtern (Status, Provider)
- 🔍 Detailansichten für Orders und Payments
- 🎨 Material-UI Design
- 🔐 API-Key-Authentifizierung

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: React-Admin 4 + Material-UI 5
- **Build Tool**: Vite
- **Server**: Nginx (Production)
- **Docker**: Multi-stage build

## Entwicklung

### Voraussetzungen

- Node.js >= 18
- Order Hub API läuft auf `http://localhost:3000`

### Setup

```bash
# Dependencies installieren
npm install

# Environment-Variablen
cp .env.example .env
# API_URL und API_KEY anpassen

# Dev-Server starten
npm run dev
```

Dashboard läuft auf: `http://localhost:3001`

### Build

```bash
# Production Build
npm run build

# Preview
npm run preview
```

## Docker

### Development

```bash
docker-compose -f docker-compose.dev.yml up
```

### Production

```bash
# Build und starten
docker-compose up -d --build

# Logs
docker-compose logs -f

# Stoppen
docker-compose down
```

Admin-Dashboard läuft auf: `http://localhost:3001`

## Configuration

### Environment Variables

- `VITE_API_URL` - Order Hub API URL (default: http://localhost:3000)
- `VITE_API_KEY` - API Key für Authentifizierung
- `VITE_APP_TITLE` - Dashboard Title

### API Connection

Das Dashboard konsumiert folgende Order Hub API Endpunkte:

- `GET /api/v1/orders` - Liste aller Orders
- `GET /api/v1/orders/:id` - Order Details
- `GET /api/v1/payments` - Liste aller Payments
- `GET /api/v1/payments/:id` - Payment Details

## Features im Detail

### Dashboard
- Total Orders (alle)
- Paid Orders (bezahlt)
- Total Revenue (Gesamtumsatz)
- Success Rate (Erfolgsquote Payments)
- Recent Orders (letzte 5)
- Recent Payments (letzte 5)

### Order List
**Filter:**
- Search (Order ID, Source Order ID)
- Status (pending, paid, shipped, etc.)
- Source (woo, pos, b2b)
- Date Range (From/To)

**Columns:**
- Order ID
- Source Order ID
- Source
- Status (mit Farben)
- Total Amount
- Currency
- Created Date

### Payment List
**Filter:**
- Search (Payment ID)
- Status (succeeded, failed, etc.)
- Provider (stripe, btcpay, etc.)

**Columns:**
- Payment ID
- Order ID
- Provider
- Method
- Status (mit Farben)
- Amount
- Created Date

### Detail Views
- Order Details mit Items
- Payment Details
- Status History (geplant)

## Netzwerk

Das Admin-Dashboard verbindet sich mit dem Order Hub über:
- Direkter API-Call (Development)
- Docker-Network (Production)

Network: `order-hub_order-hub-network`

## Security

- API-Key-Authentifizierung
- Nginx Security Headers
- No sensitive data in frontend

## Deployment

### Mit Order Hub zusammen

```bash
# In order-hub Verzeichnis
docker-compose up -d

# In order-hub-admin Verzeichnis  
docker-compose up -d
```

Beide Services teilen sich das gleiche Docker-Network.

## Entwickelt für MOJO Institut

🚀 **Status**: Ready for Production




