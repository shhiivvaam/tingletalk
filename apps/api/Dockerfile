# Production-grade Dockerfile for NestJS API in Turborepo monorepo
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Install ALL dependencies (including devDependencies for building)
FROM base AS installer
# Copy all package files
COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Install dependencies
RUN npm ci

# Copy all source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generate Prisma Client
RUN cd apps/api && npx prisma generate

# Build shared package
RUN cd packages/shared && npm run build

# Build API
RUN cd apps/api && npm run build

# Stage 2: Production dependencies only
FROM base AS prod-deps
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Install production dependencies only
RUN npm ci --omit=dev

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy production dependencies
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps --chown=nestjs:nodejs /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy built application
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=installer --chown=nestjs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=installer --chown=nestjs:nodejs /app/packages/shared/package.json ./packages/shared/package.json

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
