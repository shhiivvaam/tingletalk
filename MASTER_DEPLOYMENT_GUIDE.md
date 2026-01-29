# 👑 MASTER DEPLOYMENT GUIDE

**This is the only guide you need.**
Ignore all previous guides (`FINAL_DEPLOYMENT_GUIDE`, `SIMPLE_DEPLOYMENT`, etc.).

**Goal**: Production-grade, zero-downtime deployment for TingleTalk using GitHub Actions, Docker Hub, and EC2.

---

## 🛠️ Phase 1: Preparation (Do this NOW)

### 1. GitHub Secrets
Go to your Repo Settings → Secrets and Variables → Actions → **New Repository Secret**.
Add these (you will fill in the EC2 ones after launching the instance):

| Secret Name | Value |
|-------------|-------|
| `DOCKER_USERNAME` | `shhiivvaam` |
| `DOCKER_PASSWORD` | Your Docker Hub Access Token |
| `EC2_HOST` | *(Pending - EC2 IP)* |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | *(Pending - private key content)* |

### 2. Local Scripts
Ensure `scripts/deploy.sh` exists in your project (I've just created it).
Push it to GitHub:
```bash
git add scripts/deploy.sh
git commit -m "add: robust deployment script"
git push origin main
```

---

## ☁️ Phase 2: Infrastructure (AWS EC2)

### 1. Launch Instance (Fresh Start)
1.  **Name**: `tingletalk-prod`
2.  **OS**: Ubuntu Server 22.04 LTS (Free Tier)
3.  **Instance Type**: `t2.micro` (Free Tier)
4.  **Key Pair**: Create new → `tingletalk-prod-key.pem`. **Download it.**
5.  **Security Group**: Allow:
    *   SSH (22) - My IP
    *   HTTP (80) - Anywhere
    *   HTTPS (443) - Anywhere
    *   Custom TCP (5000) - Anywhere (for testing backend directly)
6.  **Launch.**

### 2. Connect
```bash
# Windows PowerShell
ssh -i path/to/tingletalk-prod-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 3. Server Setup (Run these on EC2)
Copy-paste these blocks to set up the server in minutes.

**A. Install Docker & Nginx**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io nginx -y
sudo usermod -aG docker ubuntu
# Log out and back in for permissions to take effect
exit
```
*(Reconnect via SSH now)*

**B. Setup Directories & Deployment Script**
```bash
mkdir -p ~/app-config
mkdir -p ~/app-logs

# Create the deployment script
nano ~/deploy.sh
```
*Paste the content of `scripts/deploy.sh` from your local project into this file.*
*Save: Ctrl+X, Y, Enter.*

```bash
chmod +x ~/deploy.sh
```

**C. Configure Environment**
```bash
nano ~/app-config/.env.production
```
*Paste your production variables:*
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/tingletalk?sslmode=require
REDIS_HOST=your-redis-url.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-pass
# Add other secrets...
```

**D. Configure Nginx (Reverse Proxy)**
```bash
sudo nano /etc/nginx/sites-available/tingletalk
```
*Paste:*
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP; # Or your domain name

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
*Enable it:*
```bash
sudo ln -s /etc/nginx/sites-available/tingletalk /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

---

## 🚀 Phase 3: Connect CI/CD

### 1. Update GitHub Secrets
Now that you have the EC2 instance:
1.  **EC2_HOST**: Copy the Public IP from AWS Console.
2.  **EC2_SSH_KEY**: Open your `tingletalk-prod-key.pem` file locally (Notepad), copy **everything**, paste into the secret.

### 2. Run First Deployment
You don't need to manually deploy! Just trigger the workflow.
1.  Go to GitHub Actions.
2.  Re-run the latest "Build and Deploy" workflow.
    *   OR push a small change to `main`.

### 3. Verify
*   **Workflow**: Should allow "Deploy to EC2" to turn Green ✅.
*   **Browser**: Visit `http://YOUR_EC2_PUBLIC_IP/health`. You should see `{"status":"ok"...}`.

---

## 🔄 Routine Workflow

From now on, **Deployment is Automatic**.

1.  **Code** on your laptop.
2.  **Commit & Push** to `main`.
3.  **Wait** ~3 mins.
4.  **Done.** Production is updated.

---

## 🚑 Troubleshooting

*   **View Logs**: `ssh ubuntu@IP` -> `docker logs tingletalk-api`
*   **Manual Deploy**: `ssh ubuntu@IP` -> `./deploy.sh`
*   **SSL (Domain Needed)**: run `sudo apt install certbot python3-certbot-nginx` then `sudo certbot --nginx`.

---
**This is the definitive way.**
