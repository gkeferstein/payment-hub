# Order Hub - Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY knexfile.js ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY knexfile.js ./
RUN npm install --only=production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy migrations directory (compiled)
COPY --from=builder /app/dist/infrastructure/database/migrations ./dist/infrastructure/database/migrations

# Remove .d.ts files from migrations
RUN find /app/dist/infrastructure/database/migrations -name "*.d.ts" -type f -delete || true

# Copy docs directory (for plugin downloads)
COPY docs ./docs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]




# Stage 1: Build
