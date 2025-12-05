# Database Infrastructure

## Connection

Die Datenbank-Connection wird über Knex.js verwaltet:

```typescript
import { db, testConnection } from '@infrastructure/database';

// Test connection
const connected = await testConnection();
```

## Migrationen

### Neue Migration erstellen

```bash
npm run migrate:make migration_name
```

Dies erstellt eine neue Migration-Datei in `src/infrastructure/database/migrations/`.

### Migrationen ausführen

```bash
# Alle ausstehenden Migrationen ausführen
npm run migrate

# Migration-Status prüfen
npm run migrate:status

# Letzte Migration rückgängig machen
npm run migrate:rollback
```

### Migration-Template

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Migration-Logik hier
}

export async function down(knex: Knex): Promise<void> {
  // Rollback-Logik hier
}
```

## Connection Pooling

Die Connection-Pool-Konfiguration ist in `knexfile.js` definiert:

- **Development**: min: 2, max: 10
- **Production**: min: 2, max: 20

Pool-Status kann über `getPoolStatus()` abgerufen werden.

## Test Connection

```bash
npm run test:db
```

Dies testet die Datenbank-Verbindung und gibt den Status aus.





## Connection

Die Datenbank-Connection wird über Knex.js verwaltet:

```typescript
import { db, testConnection } from '@infrastructure/database';

// Test connection
const connected = await testConnection();
```

## Migrationen

### Neue Migration erstellen

```bash
npm run migrate:make migration_name
```

Dies erstellt eine neue Migration-Datei in `src/infrastructure/database/migrations/`.

### Migrationen ausführen

```bash
# Alle ausstehenden Migrationen ausführen
npm run migrate

# Migration-Status prüfen
npm run migrate:status

# Letzte Migration rückgängig machen
npm run migrate:rollback
```

### Migration-Template

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Migration-Logik hier
}

export async function down(knex: Knex): Promise<void> {
  // Rollback-Logik hier
}
```

## Connection Pooling

Die Connection-Pool-Konfiguration ist in `knexfile.js` definiert:

- **Development**: min: 2, max: 10
- **Production**: min: 2, max: 20

Pool-Status kann über `getPoolStatus()` abgerufen werden.

## Test Connection

```bash
npm run test:db
```

Dies testet die Datenbank-Verbindung und gibt den Status aus.





## Connection

Die Datenbank-Connection wird über Knex.js verwaltet:

```typescript
import { db, testConnection } from '@infrastructure/database';

// Test connection
const connected = await testConnection();
```

## Migrationen

### Neue Migration erstellen

```bash
npm run migrate:make migration_name
```

Dies erstellt eine neue Migration-Datei in `src/infrastructure/database/migrations/`.

### Migrationen ausführen

```bash
# Alle ausstehenden Migrationen ausführen
npm run migrate

# Migration-Status prüfen
npm run migrate:status

# Letzte Migration rückgängig machen
npm run migrate:rollback
```

### Migration-Template

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Migration-Logik hier
}

export async function down(knex: Knex): Promise<void> {
  // Rollback-Logik hier
}
```

## Connection Pooling

Die Connection-Pool-Konfiguration ist in `knexfile.js` definiert:

- **Development**: min: 2, max: 10
- **Production**: min: 2, max: 20

Pool-Status kann über `getPoolStatus()` abgerufen werden.

## Test Connection

```bash
npm run test:db
```

Dies testet die Datenbank-Verbindung und gibt den Status aus.









