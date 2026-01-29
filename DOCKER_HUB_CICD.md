# Docker Hub CI/CD Setup Guide

This guide shows how to automatically build and push Docker images to Docker Hub on every push to `main`, then deploy to EC2.

## What This Does

✅ **Builds both backend and frontend** Docker images
✅ **Pushes to Docker Hub** with two tags:
   - `latest` - Always the newest version (gets replaced)
   - `<commit-sha>` - Specific version for rollback (e.g., `abc1234`)
✅ **Deploys backend to EC2** using the Docker Hub image
✅ **Keeps image history** for easy rollback

---

## Benefits

1. **Backup**: All your images are stored on Docker Hub
2. **Rollback**: Easy to revert to any previous version
3. **Consistency**: Same image across all environments
4. **Speed**: EC2 pulls image instead of building (faster deployments)
5. **Free**: Docker Hub free tier includes unlimited public repos

---

## Setup Instructions

### Step 1: Create Docker Hub Account

1. Go to [hub.docker.com](https://hub.docker.com)
2. Sign up for a free account
3. Note your username (e.g., `yourusername`)

### Step 2: Create Docker Hub Access Token

1. Go to **Account Settings** → **Security** → **Access Tokens**
2. Click **New Access Token**
3. **Description**: `GitHub Actions`
4. **Permissions**: Read, Write, Delete
5. Click **Generate**
6. **Copy the token** (you won't see it again!)

### Step 3: Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

#### 1. `DOCKER_USERNAME`
- **Name**: `DOCKER_USERNAME`
- **Value**: Your Docker Hub username (e.g., `yourusername`)

#### 2. `DOCKER_PASSWORD`
- **Name**: `DOCKER_PASSWORD`
- **Value**: The access token you just created

#### 3. Keep existing EC2 secrets:
- `EC2_HOST` - Your EC2 public IP
- `EC2_USERNAME` - `ubuntu`
- `EC2_SSH_KEY` - Your private key

---

## How It Works

### Workflow Stages

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BUILD AND PUSH                                           │
├─────────────────────────────────────────────────────────────┤
│ • Checkout code                                             │
│ • Build backend Docker image                                │
│ • Push to Docker Hub:                                       │
│   - yourusername/tingletalk-api:latest                      │
│   - yourusername/tingletalk-api:abc1234                     │
│ • Build frontend Docker image                               │
│ • Push to Docker Hub:                                       │
│   - yourusername/tingletalk-web:latest                      │
│   - yourusername/tingletalk-web:abc1234                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. DEPLOY BACKEND TO EC2                                    │
├─────────────────────────────────────────────────────────────┤
│ • SSH into EC2                                              │
│ • Login to Docker Hub                                       │
│ • Pull latest image                                         │
│ • Stop old container                                        │
│ • Run new container                                         │
│ • Clean up old images                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. DEPLOY FRONTEND TO VERCEL                                │
├─────────────────────────────────────────────────────────────┤
│ • Vercel auto-deploys from GitHub                           │
│ • Frontend image also available on Docker Hub               │
└─────────────────────────────────────────────────────────────┘
```

---

## Image Tagging Strategy

Each push creates **2 tags** per image:

### 1. `latest` Tag
- Always points to the newest version
- Gets replaced on every push
- Use for: Production deployments

### 2. Commit SHA Tag (e.g., `abc1234`)
- Unique for each commit
- Never gets replaced
- Use for: Rollbacks, debugging, specific versions

**Example**:
```
yourusername/tingletalk-api:latest      ← Always newest
yourusername/tingletalk-api:abc1234     ← Commit abc1234
yourusername/tingletalk-api:def5678     ← Commit def5678
yourusername/tingletalk-api:ghi9012     ← Commit ghi9012
```

---

## Testing the Setup

### 1. Push a change

```bash
# On your local machine
cd c:\Users\lifes\Documents\Projects\tingletalk

# Make a small change
echo "// Test Docker Hub deployment" >> apps/api/src/main.ts

# Commit and push
git add .
git commit -m "test: Docker Hub CI/CD"
git push origin main
```

### 2. Monitor the workflow

1. Go to GitHub → **Actions** tab
2. Watch the workflow run (takes ~5-10 minutes)
3. You should see:
   - ✅ Build and Push Docker Images
   - ✅ Deploy Backend to EC2
   - ✅ Deploy Frontend to Vercel

### 3. Verify on Docker Hub

1. Go to [hub.docker.com](https://hub.docker.com)
2. Click on your repositories
3. You should see:
   - `tingletalk-api` with tags: `latest`, `abc1234`
   - `tingletalk-web` with tags: `latest`, `abc1234`

### 4. Verify on EC2

```bash
# SSH into EC2
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Check running container
docker ps | grep tingletalk-api

# Check image
docker images | grep tingletalk-api
```

---

## Rollback to Previous Version

If something breaks, you can easily rollback:

### Option 1: Rollback via Git

```bash
# On your local machine
git revert HEAD
git push origin main
# This triggers a new deployment with the previous code
```

### Option 2: Rollback on EC2 (Manual)

```bash
# SSH into EC2
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# See available images
docker images yourusername/tingletalk-api

# Stop current container
docker stop tingletalk-api
docker rm tingletalk-api

# Run previous version (replace abc1234 with actual commit SHA)
docker run -d \
  --name tingletalk-api \
  -p 5000:5000 \
  --env-file ~/tingletalk/apps/api/.env.production \
  --restart unless-stopped \
  yourusername/tingletalk-api:abc1234
```

### Option 3: Pull Specific Version

```bash
# SSH into EC2
docker pull yourusername/tingletalk-api:abc1234
docker stop tingletalk-api && docker rm tingletalk-api
docker run -d --name tingletalk-api -p 5000:5000 --env-file ~/tingletalk/apps/api/.env.production --restart unless-stopped yourusername/tingletalk-api:abc1234
```

---

## Managing Docker Hub Storage

Docker Hub free tier includes:
- ✅ **Unlimited public repositories**
- ✅ **Unlimited pulls**
- ⚠️ **Limited storage** (~500 MB per repo)

### Keep Storage Under Control

The workflow automatically cleans up old images on EC2, but Docker Hub keeps all versions.

**To manually clean up old images on Docker Hub**:

1. Go to Docker Hub → Your repository → **Tags**
2. Select old tags you don't need
3. Click **Delete**

**Or use a script** (optional):

```bash
# Keep only last 10 versions
# Install docker-hub-utils: npm install -g docker-hub-utils
docker-hub-utils clean yourusername/tingletalk-api --keep 10
```

---

## Advanced: Multi-Environment Deployment

You can deploy different branches to different environments:

### Staging Environment

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - develop

# ... similar to main workflow but:
# - Tag images with 'staging' instead of 'latest'
# - Deploy to staging EC2 instance
```

### Production Environment

Keep the main workflow for production.

---

## Cost Breakdown

| Service | Cost |
|---------|------|
| Docker Hub (Free Tier) | $0/month |
| GitHub Actions (Free Tier) | $0/month (2,000 minutes) |
| EC2 t2.micro | $0/month (first 12 months) |
| Upstash Redis | $0/month (free tier) |
| Neon PostgreSQL | $0/month (free tier) |
| Vercel | $0/month (free tier) |
| **Total** | **$0/month** 🎉 |

---

## Troubleshooting

### Build fails: "denied: requested access to the resource is denied"

**Solution**: Check Docker Hub credentials
1. Verify `DOCKER_USERNAME` is correct
2. Verify `DOCKER_PASSWORD` is the access token (not your password)
3. Ensure token has Read, Write, Delete permissions

### EC2 deployment fails: "pull access denied"

**Solution**: Login to Docker Hub on EC2
```bash
# SSH into EC2
docker login -u yourusername
# Enter your access token when prompted
```

### Images are too large

**Solution**: Optimize Dockerfile
- Use multi-stage builds (already done ✅)
- Use `.dockerignore` file
- Remove unnecessary dependencies

### Out of Docker Hub storage

**Solution**: Delete old tags
1. Go to Docker Hub → Repository → Tags
2. Delete tags you don't need
3. Keep `latest` and last 5-10 commit SHAs

---

## Monitoring

### View Build Logs

GitHub Actions → Your repository → Actions → Select workflow run

### View Deployment Logs

GitHub Actions → Deploy Backend to EC2 → View logs

### View Container Logs on EC2

```bash
docker logs -f tingletalk-api
```

### Check Image Size

```bash
docker images yourusername/tingletalk-api
```

---

## Security Best Practices

1. ✅ **Use access tokens** instead of passwords
2. ✅ **Never commit secrets** to the repository
3. ✅ **Use GitHub Secrets** for sensitive data
4. ✅ **Rotate access tokens** every 6 months
5. ✅ **Use private repos** if your code is sensitive (Docker Hub free tier supports 1 private repo)

---

## Next Steps

1. ✅ Set up Docker Hub account
2. ✅ Add GitHub Secrets
3. ✅ Push code to test
4. ⬜ Set up Slack/Discord notifications (optional)
5. ⬜ Create staging environment (optional)
6. ⬜ Add automated tests before deployment (optional)

---

## Quick Reference

### Your Docker Hub Images

- Backend: `yourusername/tingletalk-api:latest`
- Frontend: `yourusername/tingletalk-web:latest`

### Pull Images Locally

```bash
# Backend
docker pull yourusername/tingletalk-api:latest

# Frontend
docker pull yourusername/tingletalk-web:latest
```

### Run Images Locally

```bash
# Backend
docker run -p 5000:5000 --env-file .env yourusername/tingletalk-api:latest

# Frontend
docker run -p 3000:3000 yourusername/tingletalk-web:latest
```

---

## Summary

With this setup:
- 🚀 **Push to main** → Images built and pushed to Docker Hub → Deployed to EC2
- 📦 **Image backup** on Docker Hub
- ⏮️ **Easy rollback** to any previous version
- 💰 **$0 cost** (all free tiers)
- ⚡ **Faster deployments** (pull instead of build on EC2)

You now have a production-grade CI/CD pipeline! 🎉
