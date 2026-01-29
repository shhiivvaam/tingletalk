# CI/CD Setup for Automatic EC2 Deployment

This guide shows how to set up **GitHub Actions** to automatically deploy your backend to EC2 whenever you push to the `main` branch.

## What This Does

- ✅ Triggers on every push to `main` branch
- ✅ Only runs if backend code changes (`apps/api/**` or `packages/**`)
- ✅ SSH into your EC2 instance
- ✅ Pull latest code
- ✅ Rebuild Docker image
- ✅ Restart container with zero downtime
- ✅ Clean up old images to save disk space
- ✅ Show deployment logs

---

## Setup Instructions

### Step 1: Prepare Your EC2 Instance

First, make sure your repository is cloned on EC2 and the initial deployment is working.

```bash
# SSH into EC2
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Clone repository (if not already done)
cd ~
git clone https://github.com/YOUR_USERNAME/tingletalk.git
cd tingletalk

# Configure git to allow the directory (security measure)
git config --global --add safe.directory ~/tingletalk

# Set up SSH key for GitHub (so EC2 can pull private repos)
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/github_deploy -N ""

# Add the public key to GitHub
cat ~/.ssh/github_deploy.pub
# Copy this output
```

**Add the SSH key to GitHub**:
1. Go to GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Title: "EC2 Deploy Key"
4. Paste the public key
5. Click "Add SSH key"

**Configure git to use this key**:
```bash
# On EC2
nano ~/.ssh/config
```

Add:
```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  StrictHostKeyChecking no
```

Save and exit, then:
```bash
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_deploy

# Test the connection
ssh -T git@github.com
# Should see: "Hi username! You've successfully authenticated..."
```

---

### Step 2: Add GitHub Secrets

You need to add three secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these three secrets:

#### Secret 1: `EC2_HOST`
- **Name**: `EC2_HOST`
- **Value**: Your EC2 public IP (e.g., `54.123.45.67`)

#### Secret 2: `EC2_USERNAME`
- **Name**: `EC2_USERNAME`
- **Value**: `ubuntu` (or `ec2-user` if using Amazon Linux)

#### Secret 3: `EC2_SSH_KEY`
- **Name**: `EC2_SSH_KEY`
- **Value**: Your **private key** content

To get your private key content:

**On Windows (PowerShell)**:
```powershell
Get-Content tingletalk-key.pem | Out-String
```

**On Mac/Linux**:
```bash
cat tingletalk-key.pem
```

Copy the **entire output** including the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` lines.

Paste this into the `EC2_SSH_KEY` secret value.

---

### Step 3: Verify Workflow File

The workflow file should already be created at:
```
.github/workflows/deploy-ec2.yml
```

This file:
- Triggers on push to `main` branch
- Only runs if backend files change
- SSH into EC2 and runs deployment commands
- Shows logs and status

---

### Step 4: Test the CI/CD Pipeline

Make a small change to test:

```bash
# On your local machine
cd c:\Users\lifes\Documents\Projects\tingletalk

# Make a small change (e.g., add a comment in a file)
echo "// Test deployment" >> apps/api/src/main.ts

# Commit and push
git add .
git commit -m "test: CI/CD deployment"
git push origin main
```

---

### Step 5: Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see a new workflow run starting
4. Click on it to see real-time logs
5. Wait for it to complete (usually 2-5 minutes)

If successful, you'll see:
- ✅ Checkout code
- ✅ Deploy to EC2
- ✅ Container logs

---

## Workflow Triggers

The workflow runs when:
- ✅ You push to `main` branch
- ✅ Files in `apps/api/**` change
- ✅ Files in `packages/**` change
- ✅ The workflow file itself changes

It **does NOT** run when:
- ❌ You push to other branches
- ❌ Only frontend (`apps/web/**`) changes
- ❌ Only documentation changes

---

## Advanced: Add Slack/Discord Notifications

### Slack Notifications

Add this step to your workflow:

```yaml
- name: Slack Notification
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to EC2 ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

Then add `SLACK_WEBHOOK` secret with your Slack webhook URL.

### Discord Notifications

```yaml
- name: Discord Notification
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    status: ${{ job.status }}
    title: "EC2 Deployment"
```

---

## Advanced: Database Migrations

If you want to run Prisma migrations automatically:

Add this to the workflow script (before running the container):

```yaml
script: |
  cd ~/tingletalk
  git pull origin main
  
  # Run migrations
  cd apps/api
  export $(cat .env.production | xargs)
  npx prisma migrate deploy
  cd ../..
  
  # Build and run container
  docker build -f apps/api/Dockerfile -t tingletalk-api .
  # ... rest of the script
```

---

## Advanced: Blue-Green Deployment (Zero Downtime)

For zero-downtime deployments:

```yaml
script: |
  cd ~/tingletalk
  git pull origin main
  
  # Build new image with timestamp tag
  TIMESTAMP=$(date +%s)
  docker build -f apps/api/Dockerfile -t tingletalk-api:$TIMESTAMP .
  
  # Start new container on different port
  docker run -d \
    --name tingletalk-api-new \
    -p 5001:5000 \
    --env-file apps/api/.env.production \
    tingletalk-api:$TIMESTAMP
  
  # Wait for new container to be healthy
  sleep 10
  
  # Check if new container is running
  if docker ps | grep tingletalk-api-new; then
    # Update Nginx to point to new container
    # (requires Nginx config change)
    
    # Stop old container
    docker stop tingletalk-api || true
    docker rm tingletalk-api || true
    
    # Rename new container
    docker rename tingletalk-api-new tingletalk-api
    
    # Clean up
    docker image prune -f
  else
    echo "New container failed to start, keeping old one"
    docker stop tingletalk-api-new || true
    docker rm tingletalk-api-new || true
    exit 1
  fi
```

---

## Troubleshooting

### Workflow fails with "Permission denied (publickey)"

**Solution**: Check that:
1. `EC2_SSH_KEY` secret contains the **private key** (not public key)
2. The key includes `-----BEGIN RSA PRIVATE KEY-----` header
3. No extra spaces or newlines

### Workflow fails with "git pull failed"

**Solution**: 
```bash
# SSH into EC2
cd ~/tingletalk

# Check git status
git status

# If there are local changes, stash them
git stash

# Try pulling again
git pull origin main
```

### Container fails to start

**Solution**: Check logs in GitHub Actions or SSH into EC2:
```bash
docker logs tingletalk-api
```

Common issues:
- Environment variables not set correctly
- Database connection failed
- Port 5000 already in use

### Disk space full

**Solution**: Clean up old Docker images:
```bash
# SSH into EC2
docker system prune -a -f
docker volume prune -f
```

---

## Monitoring Deployments

### View Recent Deployments

GitHub Actions → Your repository → Actions tab

### View Deployment Logs

Click on any workflow run → Deploy to EC2 → View logs

### View Container Logs on EC2

```bash
# SSH into EC2
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# View logs
docker logs -f tingletalk-api
```

---

## Cost Considerations

**GitHub Actions Free Tier**:
- 2,000 minutes/month for private repos
- Unlimited for public repos

Each deployment takes ~2-5 minutes, so you can do:
- **400+ deployments/month** on free tier
- More than enough for most projects

---

## Security Best Practices

1. ✅ **Never commit secrets** to the repository
2. ✅ **Use GitHub Secrets** for sensitive data
3. ✅ **Restrict SSH key** to only EC2 instance
4. ✅ **Use deploy keys** instead of personal SSH keys
5. ✅ **Enable branch protection** on `main` branch
6. ✅ **Require PR reviews** before merging to `main`

---

## Next Steps

1. ✅ Set up GitHub Secrets
2. ✅ Test the workflow
3. ⬜ Add Slack/Discord notifications (optional)
4. ⬜ Set up staging environment (optional)
5. ⬜ Add automated tests before deployment (optional)

---

## Rollback Strategy

If a deployment breaks production:

### Option 1: Revert Git Commit

```bash
# On your local machine
git revert HEAD
git push origin main
# This will trigger a new deployment with the previous code
```

### Option 2: Manual Rollback on EC2

```bash
# SSH into EC2
cd ~/tingletalk

# Reset to previous commit
git reset --hard HEAD~1

# Rebuild and restart
docker build -f apps/api/Dockerfile -t tingletalk-api .
docker stop tingletalk-api && docker rm tingletalk-api
docker run -d --name tingletalk-api -p 5000:5000 --env-file apps/api/.env.production --restart unless-stopped tingletalk-api
```

---

## Summary

With this CI/CD setup:
- 🚀 **Push to main** → Automatic deployment
- ⏱️ **2-5 minutes** deployment time
- 💰 **Free** (within GitHub Actions limits)
- 🔄 **Zero manual work** after initial setup
- 📊 **Full visibility** in GitHub Actions logs

You can now focus on coding, and deployments happen automatically! 🎉
