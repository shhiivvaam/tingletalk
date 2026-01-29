# Production-grade Dockerfile for NestJS API in Turborepo monorepo
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Install dependencies and build
FROM base AS builder

# Copy package files
COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Copy source code (needed for Prisma schema before install)
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Generate Prisma Client (now schema is available)
RUN cd apps/api && npx prisma generate

# Build shared package
RUN cd packages/shared && npm run build

# Build API
RUN cd apps/api && npm run build

# Stage 2: Production image
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package files for production install
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Copy Prisma schema BEFORE installing (for postinstall script)
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Install production dependencies only
RUN npm ci --omit=dev && \
    cd apps/api && npx prisma generate && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/dist ./packages/shared/dist

# Fix ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
