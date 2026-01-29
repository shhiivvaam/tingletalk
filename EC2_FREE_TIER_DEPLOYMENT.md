# Deploy Tingletalk Backend to EC2 Free Tier

This guide shows how to deploy your NestJS backend to AWS EC2 **t2.micro** (free tier eligible) using Docker, with Upstash Redis and Neon PostgreSQL.

## Total Cost: **$0/month** (within free tier limits)

- EC2 t2.micro: 750 hours/month free (first 12 months)
- Upstash Redis: Free tier (10,000 commands/day)
- Neon PostgreSQL: Free tier (0.5 GB storage)

---

## Prerequisites

✅ AWS Account (free tier eligible)
✅ Upstash Redis URL (you already have this)
✅ Neon PostgreSQL URL (you already have this)
✅ Docker Desktop running locally

---

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance via AWS Console

1. Go to **EC2 Dashboard** → **Launch Instance**
2. **Name**: `tingletalk-api`
3. **AMI**: **Ubuntu Server 22.04 LTS** (Free tier eligible)
4. **Instance Type**: **t2.micro** (Free tier eligible - 1 vCPU, 1 GB RAM)
5. **Key Pair**: 
   - Click **Create new key pair**
   - Name: `tingletalk-key`
   - Type: RSA
   - Format: `.pem` (for Mac/Linux) or `.ppk` (for Windows/PuTTY)
   - **Download and save** this file securely!
6. **Network Settings**:
   - ✅ Allow SSH traffic from: **My IP** (or Anywhere for testing)
   - ✅ Allow HTTP traffic from the internet
   - ✅ Allow HTTPS traffic from the internet
7. **Configure Storage**: 8 GB gp3 (free tier includes up to 30 GB)
8. Click **Launch Instance**

### 1.2 Configure Security Group

After launch, edit the security group to allow your API port:

1. Go to **EC2** → **Security Groups**
2. Select the security group for your instance
3. Click **Edit inbound rules** → **Add rule**:
   - **Type**: Custom TCP
   - **Port**: 5000
   - **Source**: Anywhere IPv4 (0.0.0.0/0)
4. **Save rules**

---

## Step 2: Connect to EC2 Instance

### Option A: Using SSH (Mac/Linux/Windows PowerShell)

```bash
# Set permissions on key file (Mac/Linux only)
chmod 400 tingletalk-key.pem

# Connect to instance (replace with your instance's public IP)
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Option B: Using PuTTY (Windows)

1. Open PuTTY
2. **Host Name**: `ubuntu@YOUR_EC2_PUBLIC_IP`
3. **Connection** → **SSH** → **Auth** → Browse and select your `.ppk` file
4. Click **Open**

### Option C: Using EC2 Instance Connect (Browser-based)

1. Go to **EC2 Dashboard** → **Instances**
2. Select your instance → **Connect** → **EC2 Instance Connect**
3. Click **Connect** (opens a browser terminal)

---

## Step 3: Set Up EC2 Instance

Once connected, run these commands:

```bash
# Update system packages
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

# IMPORTANT: Log out and log back in for docker group to take effect
exit
```

**Re-connect to the instance** after logging out.

---

## Step 4: Clone Your Repository

```bash
# Clone your repository (replace with your GitHub repo URL)
git clone https://github.com/YOUR_USERNAME/tingletalk.git
cd tingletalk
```

---

## Step 5: Create Production Environment File

```bash
# Create .env file in apps/api
nano apps/api/.env.production
```

**Paste your environment variables** (replace with your actual values):

```env
NODE_ENV=production
PORT=5000

# Neon PostgreSQL (replace with your actual Neon URL)
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/tingletalk?sslmode=require

# Upstash Redis (replace with your actual Upstash URL)
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password
# OR if you have a full Redis URL:
# REDIS_URL=redis://default:password@host:port

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS (your Vercel frontend URL)
CORS_ORIGIN=https://your-app.vercel.app

# Optional: Sentry, New Relic, etc.
# SENTRY_DSN=your-sentry-dsn
# NEW_RELIC_LICENSE_KEY=your-key
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 6: Build Docker Image

```bash
# Build the Docker image (this will take 5-10 minutes)
docker build -f apps/api/Dockerfile -t tingletalk-api .

# Verify the image was created
docker images | grep tingletalk-api
```

---

## Step 7: Run Database Migrations

Before starting the container, run Prisma migrations:

```bash
# Load environment variables and run migrations
cd apps/api
export $(cat .env.production | xargs)
npx prisma migrate deploy
cd ../..
```

---

## Step 8: Run Docker Container

```bash
# Run the container in detached mode
docker run -d \
  --name tingletalk-api \
  -p 5000:5000 \
  --env-file apps/api/.env.production \
  --restart unless-stopped \
  tingletalk-api

# Check if container is running
docker ps

# View logs
docker logs -f tingletalk-api
```

**Press `Ctrl+C` to exit logs**

---

## Step 9: Test Your API

```bash
# Test from EC2 instance
curl http://localhost:5000

# Test from your local machine (replace with EC2 public IP)
curl http://YOUR_EC2_PUBLIC_IP:5000
```

You should see a response from your API!

---

## Step 10: Set Up Nginx as Reverse Proxy (Optional but Recommended)

This allows you to:
- Use port 80 (HTTP) instead of 5000
- Add SSL/HTTPS later with Let's Encrypt
- Better security and performance

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/tingletalk
```

**Paste this configuration**:

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;  # Or your domain name

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
        
        # Disable buffering for real-time features
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save and exit**, then:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/tingletalk /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

Now your API is accessible at: `http://YOUR_EC2_PUBLIC_IP`

---

## Step 11: Update Frontend Environment Variables

Update your Vercel frontend's environment variables:

```env
NEXT_PUBLIC_API_URL=http://YOUR_EC2_PUBLIC_IP
NEXT_PUBLIC_WS_URL=ws://YOUR_EC2_PUBLIC_IP
```

**Redeploy your frontend** on Vercel for changes to take effect.

---

## Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View logs
docker logs tingletalk-api
docker logs -f tingletalk-api  # Follow logs in real-time

# Stop container
docker stop tingletalk-api

# Start container
docker start tingletalk-api

# Restart container
docker restart tingletalk-api

# Remove container
docker rm tingletalk-api

# View resource usage
docker stats tingletalk-api
```

---

## Updating Your Application

When you push code changes:

```bash
# SSH into EC2
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Navigate to project
cd tingletalk

# Pull latest changes
git pull origin main

# Rebuild Docker image
docker build -f apps/api/Dockerfile -t tingletalk-api .

# Stop and remove old container
docker stop tingletalk-api
docker rm tingletalk-api

# Run new container
docker run -d \
  --name tingletalk-api \
  -p 5000:5000 \
  --env-file apps/api/.env.production \
  --restart unless-stopped \
  tingletalk-api

# Verify
docker logs -f tingletalk-api
```

---

## Setting Up a Custom Domain (Optional)

If you have a domain name:

1. **Add A Record** in your DNS provider:
   - Type: A
   - Name: `api` (or `@` for root domain)
   - Value: `YOUR_EC2_PUBLIC_IP`
   - TTL: 3600

2. **Update Nginx config**:
   ```bash
   sudo nano /etc/nginx/sites-available/tingletalk
   ```
   Change `server_name YOUR_EC2_PUBLIC_IP;` to `server_name api.yourdomain.com;`

3. **Restart Nginx**:
   ```bash
   sudo systemctl restart nginx
   ```

---

## Adding SSL/HTTPS with Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d api.yourdomain.com

# Follow the prompts
# Certbot will automatically configure Nginx for HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

Now your API will be accessible at: `https://api.yourdomain.com`

---

## Monitoring and Maintenance

### View System Resources

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

### Set Up Log Rotation (Prevent disk from filling up)

```bash
# Docker logs can grow large, set up log rotation
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### Automatic Backups (Optional)

Create a backup script:
```bash
nano ~/backup.sh
```

Add:
```bash
#!/bin/bash
# Backup database (if using Neon, they handle backups)
# Backup environment files
tar -czf ~/backup-$(date +%Y%m%d).tar.gz ~/tingletalk/apps/api/.env.production
```

Make executable and schedule with cron:
```bash
chmod +x ~/backup.sh
crontab -e
# Add: 0 2 * * * ~/backup.sh  # Runs daily at 2 AM
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs tingletalk-api

# Common issues:
# - DATABASE_URL incorrect
# - Redis connection failed
# - Port 5000 already in use
```

### Out of memory
```bash
# t2.micro has only 1GB RAM
# Monitor memory usage
free -h

# If needed, add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Can't connect to API
```bash
# Check if container is running
docker ps

# Check if port 5000 is listening
sudo netstat -tlnp | grep 5000

# Check security group allows port 5000/80
# Check Nginx is running
sudo systemctl status nginx
```

### WebSocket connections failing
- Ensure Nginx config has WebSocket headers (Upgrade, Connection)
- Check CORS_ORIGIN matches your frontend domain
- Verify Redis connection (Upstash URL is correct)

---

## Cost Monitoring

Even though you're on free tier, monitor your usage:

1. Go to **AWS Billing Dashboard**
2. Set up **Billing Alerts** for $1, $5, $10
3. Check **Free Tier Usage** regularly

**Free tier limits**:
- EC2 t2.micro: 750 hours/month (1 instance running 24/7)
- 30 GB EBS storage
- 15 GB data transfer out

---

## Security Best Practices

```bash
# 1. Keep system updated
sudo apt update && sudo apt upgrade -y

# 2. Set up UFW firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5000  # API (if not using Nginx)
sudo ufw enable

# 3. Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# 4. Use environment variables, never commit secrets
# 5. Regularly update Docker images
# 6. Monitor logs for suspicious activity
```

---

## Next Steps

1. ✅ Deploy backend to EC2
2. ✅ Update Vercel frontend env vars
3. ⬜ Set up custom domain (optional)
4. ⬜ Add SSL with Let's Encrypt (optional)
5. ⬜ Set up CI/CD with GitHub Actions (optional)
6. ⬜ Configure monitoring/alerts

---

## Quick Reference

**Your EC2 Public IP**: `YOUR_EC2_PUBLIC_IP`
**API Endpoint**: `http://YOUR_EC2_PUBLIC_IP:5000` (or `http://YOUR_EC2_PUBLIC_IP` with Nginx)
**SSH Command**: `ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP`

**Container Management**:
- Start: `docker start tingletalk-api`
- Stop: `docker stop tingletalk-api`
- Logs: `docker logs -f tingletalk-api`
- Restart: `docker restart tingletalk-api`
