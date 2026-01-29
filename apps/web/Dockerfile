# Production-grade Dockerfile for Next.js frontend in Turborepo monorepo
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Install dependencies and build
FROM base AS builder

# Copy package files and root config
COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Build shared package first
RUN cd packages/shared && npm run build

# Build UI package
RUN cd packages/ui && npm run build

# Build Next.js app
RUN cd apps/web && npm run build

# Stage 2: Production runner
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files for standalone mode
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "apps/web/server.js"]
