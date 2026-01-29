# 🚀 Production Deployment - Complete Guide

**Fresh EC2 instance → Full automation in 45 minutes**

After setup: `git push` = auto-deploy forever! ✨

---

## ✅ Prerequisites

- [x] Code pushed to GitHub
- [x] Docker Hub account created
- [ ] GitHub Secrets to add (we'll do this)
- [ ] Fresh EC2 instance (we'll create this)

---

## 📋 Part 1: GitHub Secrets Setup (5 minutes)

### Step 1.1: Add Docker Hub Secrets

Go to: `https://github.com/shhiivvaam/tingletalk/settings/secrets/actions`

Click **New repository secret** and add:

**Secret 1: DOCKER_USERNAME**
- Name: `DOCKER_USERNAME`
- Value: `shhiivvaam` (your Docker Hub username)

**Secret 2: DOCKER_PASSWORD**
- Name: `DOCKER_PASSWORD`
- Value: Your Docker Hub access token
  - Get it from: hub.docker.com → Account Settings → Security → Access Tokens
  - Create new token with Read, Write, Delete permissions

### Step 1.2: Prepare EC2 Secrets (we'll add these after creating EC2)

You'll add these later:
- `EC2_HOST` - EC2 public IP
- `EC2_USERNAME` - `ubuntu`
- `EC2_SSH_KEY` - Private key content

---

## 📋 Part 2: Launch EC2 Instance (10 minutes)

### Step 2.1: Create EC2 Instance

1. Go to **AWS Console** → **EC2** → **Launch Instance**

2. **Configuration**:
   - **Name**: `tingletalk-production`
   - **AMI**: Ubuntu Server 22.04 LTS (free tier eligible)
   - **Instance Type**: t2.micro (free tier eligible)
   - **Key Pair**: 
     - Click "Create new key pair"
     - Name: `tingletalk-prod`
     - Type: RSA
     - Format: .pem
     - **Download and save the file!**

3. **Network Settings**:
   - ✅ Allow SSH traffic from: Anywhere (or My IP for security)
   - ✅ Allow HTTP traffic from the internet
   - ✅ Allow HTTPS traffic from the internet

4. **Storage**: 8 GB gp3 (default)

5. Click **Launch Instance**

### Step 2.2: Configure Security Group

1. Go to **EC2** → **Instances** → Select your instance
2. Click **Security** tab → Click the security group link
3. Click **Edit inbound rules** → **Add rule**:
   - **Type**: Custom TCP
   - **Port**: 5000
   - **Source**: Anywhere IPv4 (0.0.0.0/0)
4. Click **Save rules**

### Step 2.3: Get EC2 Public IP

1. Go to **EC2** → **Instances**
2. Select your instance
3. **Copy the Public IPv4 address** (e.g., `54.123.45.67`)
4. **Save this** - you'll need it multiple times

---

## 📋 Part 3: Set Up EC2 (15 minutes)

### Step 3.1: Connect to EC2

**Windows PowerShell**:
```powershell
# Navigate to Downloads
cd ~\Downloads

# Set permissions
icacls tingletalk-prod.pem /inheritance:r
icacls tingletalk-prod.pem /grant:r "$($env:USERNAME):(R)"

# Connect (replace with YOUR EC2 IP)
ssh -i tingletalk-prod.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3.2: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Docker Compose (for future use)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version

# IMPORTANT: Log out and back in for docker group to take effect
exit
```

**Re-connect**:
```bash
ssh -i tingletalk-prod.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3.3: Login to Docker Hub

```bash
docker login -u shhiivvaam
# Enter your Docker Hub access token when prompted
```

### Step 3.4: Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

### Step 3.5: Configure Nginx as Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/tingletalk
```

**Paste this** (replace `YOUR_EC2_PUBLIC_IP` with your actual IP):

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    # API endpoint
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Save: `Ctrl+X`, `Y`, `Enter`

**Enable the site**:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tingletalk /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 3.6: Create Environment File

```bash
# Create directory
mkdir -p ~/app-config

# Create .env file
nano ~/app-config/.env.production
```

**Paste this** (replace with your actual values):

```env
NODE_ENV=production
PORT=5000

# Neon PostgreSQL (replace with your actual URL)
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/tingletalk?sslmode=require

# Upstash Redis (replace with your actual credentials)
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# JWT Secret (generate a random string)
JWT_SECRET=change-this-to-a-random-secure-string-min-32-chars

# CORS Origins (add your Vercel URL after deploying frontend)
CORS_ORIGINS=http://localhost:3000
```

Save: `Ctrl+X`, `Y`, `Enter`

---

## 📋 Part 4: Initial Deployment (10 minutes)

### Step 4.1: Pull Docker Image

```bash
docker pull shhiivvaam/tingletalk-api:latest
```

### Step 4.2: Run Database Migrations

```bash
# Run migrations (one-time setup)
docker run --rm \
  --env-file ~/app-config/.env.production \
  shhiivvaam/tingletalk-api:latest \
  sh -c "cd /app/apps/api && npx prisma migrate deploy"
```

### Step 4.3: Start the Container

```bash
docker run -d \
  --name tingletalk-api \
  -p 5000:5000 \
  --env-file ~/app-config/.env.production \
  --restart unless-stopped \
  shhiivvaam/tingletalk-api:latest
```

### Step 4.4: Verify It's Running

```bash
# Check container status
docker ps

# Check logs
docker logs tingletalk-api

# Test health endpoint
curl http://localhost:5000/health

# Test from outside (replace with your EC2 IP)
curl http://YOUR_EC2_PUBLIC_IP/health
```

You should see: `{"status":"ok","timestamp":"..."}`

🎉 **Backend is live!**

---

## 📋 Part 5: Set Up CI/CD Automation (10 minutes)

### Step 5.1: Create Deployment Script on EC2

```bash
nano ~/deploy.sh
```

**Paste this**:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest image
echo "📦 Pulling latest Docker image..."
docker pull shhiivvaam/tingletalk-api:latest

# Stop and remove old container
echo "🛑 Stopping old container..."
docker stop tingletalk-api || true
docker rm tingletalk-api || true

# Start new container
echo "▶️  Starting new container..."
docker run -d \
  --name tingletalk-api \
  -p 5000:5000 \
  --env-file ~/app-config/.env.production \
  --restart unless-stopped \
  shhiivvaam/tingletalk-api:latest

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

# Show status
echo "✅ Deployment complete!"
docker ps | grep tingletalk-api
docker logs --tail 20 tingletalk-api
```

Save: `Ctrl+X`, `Y`, `Enter`

**Make it executable**:
```bash
chmod +x ~/deploy.sh
```

**Test it**:
```bash
~/deploy.sh
```

### Step 5.2: Add GitHub Secrets for EC2

**Get your private key content**:

**On Windows PowerShell** (on your local machine):
```powershell
Get-Content ~\Downloads\tingletalk-prod.pem | Out-String
```

Copy the **entire output** (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

**Add to GitHub**:

Go to: `https://github.com/shhiivvaam/tingletalk/settings/secrets/actions`

Add these 3 secrets:

**Secret 3: EC2_HOST**
- Name: `EC2_HOST`
- Value: Your EC2 public IP (e.g., `54.123.45.67`)

**Secret 4: EC2_USERNAME**
- Name: `EC2_USERNAME`
- Value: `ubuntu`

**Secret 5: EC2_SSH_KEY**
- Name: `EC2_SSH_KEY`
- Value: Paste the entire private key content from above

---

## 📋 Part 6: Test CI/CD (5 minutes)

### Step 6.1: Commit and Push Workflow Update

```bash
# On your local machine
cd c:\Users\lifes\Documents\Projects\tingletalk

git add .github/workflows/deploy-ec2.yml
git commit -m "chore: update deployment workflow to use deploy script"
git push origin main
```

### Step 6.2: Monitor Deployment

1. Go to GitHub → **Actions** tab
2. Watch the workflow run
3. You should see:
   - ✅ Build and Push Docker Images
   - ✅ Deploy Backend to EC2
   - ✅ Deploy Frontend to Vercel

### Step 6.3: Verify on EC2

```bash
# SSH into EC2
ssh -i tingletalk-prod.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Check logs
docker logs tingletalk-api

# Test API
curl http://localhost:5000/health
```

---

## 🎉 You're Done!

### What You Have Now:

✅ **Production-grade setup**:
- Docker containerized backend
- Nginx reverse proxy
- Auto-restart on crashes
- Health checks

✅ **Full CI/CD automation**:
- Push to GitHub → Auto-deploy
- Docker images on Docker Hub
- Zero downtime deployments

✅ **Free tier everything**:
- EC2 t2.micro (free 12 months)
- Neon PostgreSQL (free tier)
- Upstash Redis (free tier)
- Docker Hub (free tier)
- GitHub Actions (free tier)

---

## 🚀 From Now On

```bash
# Make changes to your code
git add .
git commit -m "feat: new feature"
git push origin main

# ✨ That's it! Automatic deployment happens:
# 1. GitHub Actions builds new Docker image
# 2. Pushes to Docker Hub
# 3. SSH into EC2
# 4. Runs ~/deploy.sh
# 5. Pulls latest image
# 6. Restarts container
# 7. ✅ Deployed!
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ YOU                                                          │
│ git push origin main                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ GITHUB ACTIONS                                              │
│ • Build Docker images                                       │
│ • Push to Docker Hub                                        │
│ • SSH to EC2                                                │
│ • Run ~/deploy.sh                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ EC2 (Production)                                            │
│ Nginx (Port 80) → Docker Container (Port 5000)              │
│ Connected to: Neon PostgreSQL + Upstash Redis               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Container won't start
```bash
docker logs tingletalk-api
# Check for errors in environment variables
```

### Can't connect to API
```bash
# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check container
docker ps
curl http://localhost:5000/health
```

### CI/CD fails
- Check GitHub Secrets are correct
- Verify EC2_SSH_KEY has no extra spaces
- Ensure deploy.sh exists and is executable on EC2

---

## 📚 Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Update CORS_ORIGINS in .env.production
3. ⬜ (Optional) Add custom domain
4. ⬜ (Optional) Set up SSL with Let's Encrypt
5. ⬜ (Optional) Add monitoring (New Relic, Sentry)

---

**Congratulations! You have a production-grade, auto-deploying backend! 🎉**
