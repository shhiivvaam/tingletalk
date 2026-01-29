# 🚀 SIMPLIFIED EC2 Deployment - Docker Only

**You're right!** We don't need git, cloning, or building on EC2. Just pull the Docker image and run it.

---

## 📋 What You Need

- ✅ EC2 instance running (t2.micro)
- ✅ Docker installed on EC2
- ✅ Docker Hub images built (already done via GitHub Actions)
- ✅ Neon PostgreSQL URL
- ✅ Upstash Redis credentials

---

## 🎯 Simple Deployment (15 minutes)

### Step 1: Launch EC2 Instance (5 min)

1. Go to **AWS Console** → **EC2** → **Launch Instance**
2. **Name**: `tingletalk-api`
3. **AMI**: Ubuntu Server 22.04 LTS (free tier)
4. **Instance Type**: t2.micro (free tier)
5. **Key Pair**: Create new → Download `tingletalk-key.pem`
6. **Network Settings**:
   - ✅ Allow SSH (port 22)
   - ✅ Allow HTTP (port 80)
   - ✅ Allow Custom TCP (port 5000)
7. Click **Launch Instance**

### Step 2: Connect to EC2 (2 min)

```bash
# Windows PowerShell
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3: Install Docker (3 min)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Log out and back in
exit
```

**Re-connect**:
```bash
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 4: Login to Docker Hub (1 min)

```bash
docker login -u YOUR_DOCKER_USERNAME
# Enter your Docker Hub access token when prompted
```

### Step 5: Create Environment File (2 min)

```bash
# Create directory for env file
mkdir -p ~/tingletalk-env

# Create .env file
nano ~/tingletalk-env/.env.production
```

Paste this (replace with your actual values):

```env
NODE_ENV=production
PORT=5000

# Your Neon PostgreSQL URL
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/tingletalk?sslmode=require

# Your Upstash Redis credentials
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-random-string-here

# CORS (your Vercel frontend URL)
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

Save: `Ctrl+X`, `Y`, `Enter`

### Step 6: Run Database Migrations (2 min)

```bash
# Pull the image
docker pull YOUR_DOCKER_USERNAME/tingletalk-api:latest

# Run migrations (one-time)
docker run --rm \
  --env-file ~/tingletalk-env/.env.production \
  YOUR_DOCKER_USERNAME/tingletalk-api:latest \
  sh -c "cd /app/apps/api && npx prisma migrate deploy"
```

### Step 7: Run the Container (1 min)

```bash
docker run -d \
  --name tingletalk-api \
  -p 5000:5000 \
  --env-file ~/tingletalk-env/.env.production \
  --restart unless-stopped \
  YOUR_DOCKER_USERNAME/tingletalk-api:latest
```

### Step 8: Verify It's Running

```bash
# Check container status
docker ps

# Check logs
docker logs -f tingletalk-api

# Test the API
curl http://localhost:5000/health
```

**From your local machine**:
```bash
curl http://YOUR_EC2_PUBLIC_IP:5000/health
```

---

## 🎉 That's It!

Your backend is now running on EC2 using the Docker image from Docker Hub.

**No git, no cloning, no building on EC2!**

---

## 🔄 To Update (When You Push New Code)

GitHub Actions automatically builds and pushes new images. To update EC2:

```bash
# SSH into EC2
ssh -i tingletalk-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Pull latest image
docker pull YOUR_DOCKER_USERNAME/tingletalk-api:latest

# Stop and remove old container
docker stop tingletalk-api
docker rm tingletalk-api

# Run new container
docker run -d \
  --name tingletalk-api \
  -p 5000:5000 \
  --env-file ~/tingletalk-env/.env.production \
  --restart unless-stopped \
  YOUR_DOCKER_USERNAME/tingletalk-api:latest
```

---

## 🤖 Optional: Automate Updates with CI/CD

**Only if you want automatic deployments**, then you need:
- Git clone on EC2 (for the CI/CD workflow to pull latest code)
- SSH key setup (for GitHub Actions to connect)

But for **manual deployments**, you don't need any of that!

---

## 📊 Comparison

### Docker-Only Approach (What You Should Do)
```
✅ Pull Docker image from Docker Hub
✅ Run container
✅ Done in 15 minutes
✅ Simple and clean
```

### Git + Build Approach (Unnecessary for Initial Setup)
```
❌ Clone entire repository
❌ Install Node.js, npm
❌ Run npm install
❌ Build on EC2 (slow)
❌ Takes 30-45 minutes
❌ Only needed for CI/CD automation
```

---

## 🎯 When You Need Git on EC2

**Only for CI/CD automation** (Part 12 of the full guide):
- GitHub Actions needs to SSH into EC2
- Pull latest code automatically
- Rebuild and restart

**For initial deployment**: **NOT NEEDED!**

---

## Summary

You're absolutely right! For initial deployment:

1. ✅ Launch EC2
2. ✅ Install Docker
3. ✅ Pull image from Docker Hub
4. ✅ Run container
5. ✅ Done!

**Git clone is only for CI/CD automation**, which you can set up later if you want automatic deployments.

---

## Next Steps

1. ✅ Follow this simplified guide
2. ✅ Get your backend running (15 min)
3. ✅ Deploy frontend to Vercel
4. ⬜ (Optional) Set up CI/CD later if you want auto-deployments
