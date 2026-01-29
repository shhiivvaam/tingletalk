FROM node:20-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
# Install turbo globaly
RUN npm install turbo --global
COPY . .
# Prune the workspace for the 'api' app
RUN turbo prune api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json

# Copy full source (including Prisma schema) before npm install
# This is needed because postinstall runs prisma generate
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Now install dependencies (this will run prisma generate via postinstall)
RUN npm install

# Build the API
RUN npx turbo build --filter=api...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy the built app
COPY --from=installer /app/apps/api/dist ./dist
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/api/package.json ./package.json
# Copy Prisma schema/migrations if runtime access is needed (usually client is enough)
COPY --from=installer /app/apps/api/prisma ./prisma

EXPOSE 5000

ENV PORT=5000
# Ensure Node env is production
ENV NODE_ENV=production

CMD ["node", "dist/main"]
