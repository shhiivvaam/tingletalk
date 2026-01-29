# 🚀 Complete Deployment Guide - Final Steps

This is your **complete, step-by-step deployment guide** that combines Docker Hub, CI/CD, and EC2 deployment.

---

## 📋 Overview

We're deploying:
- **Backend**: EC2 (free tier) using Docker images from Docker Hub
- **Frontend**: Vercel (free tier)
- **Database**: Neon PostgreSQL (free tier)
- **Redis**: Upstash (free tier)
- **CI/CD**: GitHub Actions → Docker Hub → EC2

**Total Cost: $0/month** 🎉

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] AWS Account (free tier eligible)
- [ ] Docker Hub account (create at [hub.docker.com](https://hub.docker.com))
- [ ] GitHub repository with your code
- [ ] Neon PostgreSQL URL (you already have this)
- [ ] Upstash Redis credentials (you already have this)
- [ ] Docker Desktop running on your local machine

---

## 🎯 Part 1: Docker Hub Setup (5 minutes)

### Step 1.1: Create Docker Hub Account

1. Go to [hub.docker.com](https://hub.docker.com)
2. Sign up for a free account
3. Verify your email
4. **Note your username** (e.g., `yourusername`)

### Step 1.2: Create Access Token

1. Go to **Account Settings** → **Security** → **Access Tokens**
2. Click **New Access Token**
3. **Description**: `GitHub Actions`
4. **Permissions**: Read, Write, Delete
5. Click **Generate**
6. **COPY THE TOKEN** and save it somewhere safe (you won't see it again!)

---

## 🎯 Part 2: GitHub Secrets Setup (5 minutes)

### Step 2.1: Add Docker Hub Secrets

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/tingletalk`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these **2 secrets**:

#### Secret 1: DOCKER_USERNAME
- **Name**: `DOCKER_USERNAME`
- **Value**: Your Docker Hub username (e.g., `yourusername`)

#### Secret 2: DOCKER_PASSWORD
- **Name**: `DOCKER_PASSWORD`
- **Value**: The access token you just created

### Step 2.2: Prepare EC2 Secrets (We'll add these after EC2 setup)

You'll need these later:
- `EC2_HOST` - Your EC2 public IP
- `EC2_USERNAME` - `ubuntu`
- `EC2_SSH_KEY` - Your private key content

---

## 🎯 Part 3: Push Code to Trigger First Build (2 minutes)

Now let's build and push your Docker images to Docker Hub:

### Step 3.1: Commit and Push

```bash
# On your local machine
cd c:\Users\lifes\Documents\Projects\tingletalk

# Add all files
git add .

# Commit
git commit -m "feat: add Docker Hub CI/CD pipeline"

# Push to main
git push origin main
```

### Step 3.2: Monitor the Build

1. Go to GitHub → **Actions** tab
2. You should see a workflow running: "Build and Deploy"
3. Click on it to watch the progress
4. Wait for **"Build and Push Docker Images"** to complete (~5-10 minutes)

**Expected result**:
- ✅ Build and push Backend image
- ✅ Build and push Frontend image
- ❌ Deploy Backend to EC2 (will fail - EC2 not set up yet, this is expected!)

### Step 3.3: Verify on Docker Hub

1. Go to [hub.docker.com](https://hub.docker.com)
2. Click on your repositories
3. You should see:
   - `tingletalk-api` with tags: `latest`, `<commit-sha>`
   - `tingletalk-web` with tags: `latest`, `<commit-sha>`

🎉 **Your Docker images are now on Docker Hub!**

---

## 🎯 Part 4: Launch EC2 Instance (10 minutes)

### Step 4.1: Create EC2 Instance

1. Go to **AWS Console** → **EC2 Dashboard**
2. Click **Launch Instance**
3. **Name**: `tingletalk-api`
4. **AMI**: **Ubuntu Server 22.04 LTS** (Free tier eligible)
5. **Instance Type**: **t2.micro** (Free tier eligible)
6. **Key Pair**:
   - Click **Create new key pair**
   - Name: `tingletalk-key`
   - Type: RSA
   - Format: `.pem`
   - **Download and save** the file!
7. **Network Settings**:
   - ✅ Allow SSH traffic from: My IP (or Anywhere)
   - ✅ Allow HTTP traffic from the internet
   - ✅ Allow HTTPS traffic from the internet
8. **Storage**: 8 GB gp3 (default is fine)
9. Click **Launch Instance**

### Step 4.2: Configure Security Group

1. Go to **EC2** → **Security Groups**
2. Select the security group for your instance
3. Click **Edit inbound rules** → **Add rule**:
   - **Type**: Custom TCP
   - **Port**: 5000
   - **Source**: Anywhere IPv4 (0.0.0.0/0)
4. Click **Save rules**

### Step 4.3: Note Your EC2 Public IP

1. Go to **EC2** → **Instances**
2. Select your instance
3. **Copy the Public IPv4 address** (e.g., `54.123.45.67`)
4. Save this - you'll need it!

---

## 🎯 Part 5: Set Up EC2 Instance (15 minutes)

### Step 5.1: Connect to EC2

**On Windows PowerShell**:
```powershell
# Navigate to where you saved the key
cd ~\Downloads

# Set permissions (Windows)
icacls tingletalk-key.pem /inheritance:r
icacls tingletalk-key.pem /grant:r "$($env:USERNAME):(R)"

# Connect (replace with your EC2 IP)
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

**On Mac/Linux**:
```bash
# Set permissions
chmod 400 tingletalk-key.pem

# Connect (replace with your EC2 IP)
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 5.2: Install Docker on EC2

Once connected to EC2, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Verify installations
docker --version
docker-compose --version
git --version

# IMPORTANT: Log out and log back in
exit
```

**Re-connect to EC2** after logging out:
```bash
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 5.3: Login to Docker Hub on EC2

```bash
# Login to Docker Hub (replace with your username)
docker login -u YOUR_DOCKER_USERNAME
# Enter your Docker Hub access token when prompted
```

### Step 5.4: Clone Repository on EC2

```bash
# Clone your repository (replace with your GitHub username)
cd ~
git clone https://github.com/YOUR_USERNAME/tingletalk.git
cd tingletalk

# Configure git
git config --global --add safe.directory ~/tingletalk
```

### Step 5.5: Set Up SSH Key for GitHub (for CI/CD)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/github_deploy -N ""

# Display the public key
cat ~/.ssh/github_deploy.pub
# Copy this output
```

**Add SSH key to GitHub**:
1. Go to GitHub → **Settings** → **SSH and GPG keys**
2. Click **New SSH key**
3. Title: `EC2 Deploy Key`
4. Paste the public key
5. Click **Add SSH key**

**Configure git to use this key**:
```bash
# On EC2
nano ~/.ssh/config
```

Paste this:
```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  StrictHostKeyChecking no
```

Save and exit (Ctrl+X, Y, Enter), then:
```bash
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_deploy

# Test connection
ssh -T git@github.com
# Should see: "Hi username! You've successfully authenticated..."
```

---

## 🎯 Part 6: Configure Environment Variables (5 minutes)

### Step 6.1: Create .env.production File

```bash
# On EC2
cd ~/tingletalk/apps/api
nano .env.production
```

### Step 6.2: Paste Your Environment Variables

Replace with your actual values:

```env
NODE_ENV=production
PORT=5000

# Neon PostgreSQL (replace with your actual URL)
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/tingletalk?sslmode=require

# Upstash Redis (replace with your actual credentials)
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random

# CORS (your Vercel frontend URL - we'll update this later)
CORS_ORIGIN=https://your-app.vercel.app

# Optional: Sentry, New Relic, etc.
# SENTRY_DSN=your-sentry-dsn
```

**Save and exit**: Ctrl+X, Y, Enter

---

## 🎯 Part 7: Run Database Migrations (2 minutes)

```bash
# On EC2, in ~/tingletalk/apps/api
export $(cat .env.production | xargs)
npx prisma migrate deploy
cd ../..
```

---

## 🎯 Part 8: Pull and Run Docker Container (5 minutes)

### Step 8.1: Pull Image from Docker Hub

```bash
# On EC2 (replace with your Docker Hub username)
docker pull YOUR_DOCKER_USERNAME/tingletalk-api:latest
```

### Step 8.2: Run Container

```bash
# Run the container
docker run -d \
  --name tingletalk-api \
  -p 5000:5000 \
  --env-file ~/tingletalk/apps/api/.env.production \
  --restart unless-stopped \
  YOUR_DOCKER_USERNAME/tingletalk-api:latest

# Check if container is running
docker ps

# View logs
docker logs -f tingletalk-api
```

Press Ctrl+C to exit logs.

### Step 8.3: Test Your API

```bash
# Test from EC2
curl http://localhost:5000

# Test from your local machine (replace with EC2 IP)
curl http://YOUR_EC2_PUBLIC_IP:5000
```

🎉 **Your backend is now running on EC2!**

---

## 🎯 Part 9: Set Up Nginx (Optional but Recommended) (5 minutes)

### Step 9.1: Install Nginx

```bash
# On EC2
sudo apt install nginx -y
```

### Step 9.2: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/tingletalk
```

Paste this (replace YOUR_EC2_PUBLIC_IP):

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable buffering
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save and exit, then:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/tingletalk /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

Now your API is accessible at: `http://YOUR_EC2_PUBLIC_IP` (port 80)

---

## 🎯 Part 10: Add EC2 Secrets to GitHub (3 minutes)

Now that EC2 is set up, add the remaining GitHub Secrets:

### Step 10.1: Get Your Private Key Content

**On Windows PowerShell**:
```powershell
Get-Content tingletalk-key.pem | Out-String
```

**On Mac/Linux**:
```bash
cat tingletalk-key.pem
```

Copy the entire output (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

### Step 10.2: Add Secrets to GitHub

Go to GitHub → Settings → Secrets and variables → Actions

Add these **3 secrets**:

#### Secret 1: EC2_HOST
- **Name**: `EC2_HOST`
- **Value**: Your EC2 public IP (e.g., `54.123.45.67`)

#### Secret 2: EC2_USERNAME
- **Name**: `EC2_USERNAME`
- **Value**: `ubuntu`

#### Secret 3: EC2_SSH_KEY
- **Name**: `EC2_SSH_KEY`
- **Value**: Your private key content (paste the entire output from above)

---

## 🎯 Part 11: Deploy Frontend to Vercel (10 minutes)

### Step 11.1: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **Add New** → **Project**
4. Import your `tingletalk` repository

### Step 11.2: Configure Vercel

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: Click **Edit** → Select `apps/web`
- **Include source files outside Root Directory**: ✅ YES (important!)

### Step 11.3: Build Command

Override the build command:
```bash
cd ../.. && npx turbo run build --filter=web
```

### Step 11.4: Environment Variables

Add these environment variables in Vercel:

```env
NEXT_PUBLIC_API_URL=http://YOUR_EC2_PUBLIC_IP
NEXT_PUBLIC_WS_URL=ws://YOUR_EC2_PUBLIC_IP
```

(Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 IP)

### Step 11.5: Deploy

Click **Deploy** and wait for it to complete (~3-5 minutes)

### Step 11.6: Update Backend CORS

After Vercel deployment, you'll get a URL like: `https://your-app.vercel.app`

**Update your backend .env.production**:

```bash
# SSH into EC2
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Edit .env.production
nano ~/tingletalk/apps/api/.env.production
```

Update the CORS_ORIGIN line:
```env
CORS_ORIGIN=https://your-app.vercel.app
```

Save and exit, then restart the container:
```bash
docker restart tingletalk-api
```

---

## 🎯 Part 12: Test CI/CD Pipeline (5 minutes)

### Step 12.1: Make a Test Change

```bash
# On your local machine
cd c:\Users\lifes\Documents\Projects\tingletalk

# Make a small change
echo "// CI/CD test" >> apps/api/src/main.ts

# Commit and push
git add .
git commit -m "test: CI/CD pipeline"
git push origin main
```

### Step 12.2: Watch the Magic Happen

1. Go to GitHub → **Actions** tab
2. Watch the workflow run
3. You should see:
   - ✅ Build and push Backend image
   - ✅ Build and push Frontend image
   - ✅ Deploy Backend to EC2
   - ✅ Deploy Frontend to Vercel (automatic)

### Step 12.3: Verify Deployment

```bash
# Check your API
curl http://YOUR_EC2_PUBLIC_IP

# Check your frontend
# Visit: https://your-app.vercel.app
```

🎉 **Everything is now automated!**

---

## 📊 Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ YOU                                                          │
│ git push origin main                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ GITHUB ACTIONS                                              │
│ • Build backend Docker image                                │
│ • Build frontend Docker image                               │
│ • Push both to Docker Hub                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DOCKER HUB                                                  │
│ • tingletalk-api:latest                                     │
│ • tingletalk-api:<commit-sha>                               │
│ • tingletalk-web:latest                                     │
│ • tingletalk-web:<commit-sha>                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ EC2 (Backend)                                               │
│ • Pull latest image from Docker Hub                         │
│ • Restart container                                         │
│ • Connected to Neon (PostgreSQL) + Upstash (Redis)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ VERCEL (Frontend)                                           │
│ • Auto-deploys from GitHub                                  │
│ • Connects to EC2 backend                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Deployment Checklist

### Initial Setup (One-time)
- [ ] Create Docker Hub account
- [ ] Create Docker Hub access token
- [ ] Add Docker Hub secrets to GitHub
- [ ] Launch EC2 instance
- [ ] Install Docker on EC2
- [ ] Clone repository on EC2
- [ ] Set up SSH key for GitHub on EC2
- [ ] Create .env.production file
- [ ] Run database migrations
- [ ] Pull and run Docker container
- [ ] Set up Nginx
- [ ] Add EC2 secrets to GitHub
- [ ] Deploy frontend to Vercel
- [ ] Update backend CORS

### Ongoing Development (Automatic)
- [ ] Make code changes
- [ ] `git push origin main`
- [ ] ✅ Done! Everything deploys automatically

---

## 🎯 Quick Reference

### Your URLs
- **Backend API**: `http://YOUR_EC2_PUBLIC_IP`
- **Frontend**: `https://your-app.vercel.app`
- **Docker Hub**: `https://hub.docker.com/u/YOUR_DOCKER_USERNAME`

### SSH into EC2
```bash
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### View Container Logs
```bash
docker logs -f tingletalk-api
```

### Restart Container
```bash
docker restart tingletalk-api
```

### Rollback to Previous Version
```bash
docker pull YOUR_DOCKER_USERNAME/tingletalk-api:COMMIT_SHA
docker stop tingletalk-api && docker rm tingletalk-api
docker run -d --name tingletalk-api -p 5000:5000 --env-file ~/tingletalk/apps/api/.env.production --restart unless-stopped YOUR_DOCKER_USERNAME/tingletalk-api:COMMIT_SHA
```

---

## 💰 Total Cost

**$0/month** 🎉

- EC2 t2.micro: Free (12 months)
- Docker Hub: Free (unlimited public repos)
- GitHub Actions: Free (2,000 minutes/month)
- Neon PostgreSQL: Free tier
- Upstash Redis: Free tier
- Vercel: Free tier

---

## 🆘 Troubleshooting

### CI/CD fails at "Build and Push"
- Check Docker Hub credentials in GitHub Secrets
- Ensure `DOCKER_USERNAME` and `DOCKER_PASSWORD` are correct

### CI/CD fails at "Deploy to EC2"
- Check EC2 secrets in GitHub Secrets
- Ensure EC2 instance is running
- Verify SSH key is correct

### Container won't start on EC2
```bash
docker logs tingletalk-api
# Check for errors in .env.production
```

### Can't connect to API
- Check security group allows port 5000 (or 80 if using Nginx)
- Check container is running: `docker ps`
- Check Nginx is running: `sudo systemctl status nginx`

---

## 🎉 You're Done!

From now on, your workflow is:

```bash
# Make changes
git add .
git commit -m "feat: new feature"
git push origin main

# ✨ Magic happens automatically! ✨
```

**No more manual deployments!** 🚀
