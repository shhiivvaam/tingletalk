# 🚀 Tingle Talk Production Deployment Guide

This is your master guide to deploying Tingle Talk.
We will deploy:
1.  **Backend** (`apps/api`) to **AWS App Runner** (Serverless Container).
2.  **Frontend** (`apps/web`) to **Vercel** (Next.js Optimization).

---

## ✅ Phase 0: Prerequisites

Before starting, ensure you have these installed on your machine:
1.  **Docker Desktop**: [Download Here](https://www.docker.com/products/docker-desktop/) (Must be running).
2.  **AWS CLI**: [Download Here](https://aws.amazon.com/cli).
    -   Run `aws configure` in your terminal and enter your `Access Key ID`, `Secret Access Key`, region (use `us-east-1`), and format (`json`).

---

## 🛢 Phase 1: Database & Redis (Check)
Your database and Redis are already cloud-hosted (Neon & Upstash).
*   **Database**: `postgresql://neondb_owner...`
*   **Redis**: `wealthy-drum...`
*   **Verification**: Ensure your `apps/api/.env` file has the correct values. We will need these values in Phase 2.

---

## ⚙️ Phase 2: Deploy Backend (AWS)

We will package your API into a Docker container and run it on AWS App Runner.

### Step 1: Create ECR Repository
This is where your code lives in the cloud.
```bash
aws ecr create-repository --repository-name tingletalk-api --region us-east-1
```
*   **Copy the URI** from the output (e.g., `123456789.dkr.ecr.us-east-1.amazonaws.com/tingletalk-api`). Only copy the part *before* the repository name if needed, but usually the full URI is best. Let's refer to this as `YOUR_ECR_URI`.

### Step 2: Login to ECR
Authenticate Docker with AWS. **Replace `123456789` with your AWS Account ID** (found in top right of AWS Console).
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
```

### Step 3: Build & Push
Run these commands from the root of your project (`tingletalk/`):

1.  **Build the Docker Image**:
    ```bash
    docker build -f apps/api/Dockerfile -t tingletalk-api .
    ```
    *(If this fails, ensure Docker Desktop is running)*

2.  **Tag the Image**:
    ```bash
    docker tag tingletalk-api:latest YOUR_ECR_URI:latest
    ```
    *(Replace `YOUR_ECR_URI` with the one from Step 1)*

3.  **Push to Cloud**:
    ```bash
    docker push YOUR_ECR_URI:latest
    ```

### Step 4: Launch Service (AWS Console)
1.  Go to **AWS App Runner Console**.
2.  Click **Create service**.
3.  **Source**: "Container registry" -> **Amazon ECR**.
4.  **Image URI**: Browse and select the `tingletalk-api` image you just pushed.
5.  **Deployment triggers**: Select **Automatic** (so it updates when you push new code).
6.  **Configuration**:
    -   **Service name**: `tingletalk-backend`
    -   **Port**: `5000`
    -   **Environment variables**: (Add these manually)
        -   `DATABASE_URL`: *(Copy from your .env)*
        -   `REDIS_URL`: *(Copy from your .env)*
        -   `REDIS_HOST`: *(Copy from your .env)*
        -   `REDIS_PORT`: `6379`
        -   `JWT_SECRET`: *(Copy from your .env)*
        -   `NEW_RELIC_LICENSE_KEY`: *(Copy from your .env)*
        -   `PORT`: `5000`
7.  **Create & Deploy**.
8.  **Wait** for it to turn Green.
9.  **Copy the Default Domain** (e.g., `https://xyz.awsapprunner.com`). This is your **Backend URL**.

---

## 🌐 Phase 3: Deploy Frontend (Vercel)

Now that the backend is live, we connect the frontend.

1.  Push your latest code to GitHub:
    ```bash
    git add .
    git commit -m "Ready for deploy"
    git push origin main
    ```
2.  Go to **Vercel Dashboard** -> **Add New** -> **Project**.
3.  Import `shhiivvaam/tingletalk`.
4.  **Configure Project**:
    -   **Root Directory**: Click Edit -> Select `apps/web`.
    -   **Framework Preset**: Next.js (should be auto-detected).
5.  **Environment Variables**:
    -   `NEXT_PUBLIC_API_URL`: Paste your **AWS Backend URL** (e.g., `https://xyz.awsapprunner.com`).
    -   `NEXT_PUBLIC_WS_URL`: Paste the same URL.
    -   `NEXT_PUBLIC_SENTRY_DSN`: *(Copy from apps/web/.env)*
6.  Click **Deploy**.

---

## 🚀 Phase 4: Verification

1.  Open your new Vercel URL.
2.  Open Chrome DevTools (F12) -> Network Tab.
3.  Try to Login.
4.  Verify you see requests going to `xyz.awsapprunner.com`.

**You are now live!** 🎉
