# 🔧 Prisma 7 Migration Issue - Quick Fix

## Problem
When running `npx prisma migrate deploy`, it installs Prisma 7.3.0 which has breaking changes and doesn't support the `url` property in `schema.prisma`.

## Solution
Use the **local Prisma version** (6.19.2) from `node_modules` instead of `npx`.

---

## Steps to Fix on EC2

### 1. SSH into EC2
```bash
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 2. Navigate to API directory
```bash
cd ~/tingletalk/apps/api
```

### 3. Install dependencies (if not already done)
```bash
cd ~/tingletalk
npm ci
cd apps/api
```

### 4. Set environment variables
```bash
export $(cat .env.production | xargs)
```

### 5. Run migrations with LOCAL Prisma
```bash
# Use the local Prisma from node_modules (version 6.19.2)
../../node_modules/.bin/prisma migrate deploy
```

### 6. Verify it worked
You should see:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database
X migrations found in prisma/migrations
X migrations have been applied
```

---

## Why This Happens

- **`npx prisma`**: Downloads and runs the **latest** Prisma version (7.3.0)
- **`node_modules/.bin/prisma`**: Uses your **locked** version (6.19.2 from package-lock.json)

Prisma 7 has breaking changes:
- ❌ No more `url` in `datasource` block
- ❌ Requires `prisma.config.ts` file
- ✅ Your project uses Prisma 6 format

---

## Alternative: Pin Prisma Version Globally (Optional)

If you want to use `npx prisma` in the future:

```bash
# Install specific Prisma version globally
npm install -g prisma@6.19.2

# Now you can use
prisma migrate deploy
```

But **using local version is recommended** for consistency.

---

## Updated Deployment Commands

From now on, always use:

```bash
# ❌ DON'T USE
npx prisma migrate deploy

# ✅ USE THIS
../../node_modules/.bin/prisma migrate deploy
```

Or create an alias:
```bash
# Add to ~/.bashrc
alias prisma='../../node_modules/.bin/prisma'

# Then you can use
prisma migrate deploy
```

---

## For Docker Container

The Docker container already uses the correct Prisma version because it's installed from `package-lock.json`. No changes needed there.

---

## Summary

**Quick fix**: Use `../../node_modules/.bin/prisma` instead of `npx prisma`

This ensures you're using Prisma 6.19.2 (your locked version) instead of Prisma 7.3.0 (latest).
