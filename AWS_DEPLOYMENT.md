# Deploying Tingletalk Backend to AWS

This guide covers deploying your NestJS backend to AWS using **AWS App Runner** with Docker, along with setting up managed PostgreSQL (RDS) and Redis (ElastiCache).

## Architecture Overview

- **App Runner**: Hosts the containerized NestJS API
- **RDS PostgreSQL**: Managed database
- **ElastiCache Redis**: Managed Redis for Socket.IO adapter and caching
- **ECR**: Container registry for Docker images

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured (`aws configure`)
3. **Docker Desktop** running
4. **GitHub Repository** (for CI/CD option)

## Option 1: Deploy with AWS App Runner (Recommended)

### Step 1: Set Up AWS Resources

#### 1.1 Create RDS PostgreSQL Database

```bash
# Create DB subnet group (replace with your VPC subnet IDs)
aws rds create-db-subnet-group \
  --db-subnet-group-name tingletalk-db-subnet \
  --db-subnet-group-description "Subnet group for TingleTalk" \
  --subnet-ids subnet-xxxxx subnet-yyyyy

# Create security group for RDS
aws ec2 create-security-group \
  --group-name tingletalk-rds-sg \
  --description "Security group for TingleTalk RDS" \
  --vpc-id vpc-xxxxx

# Allow PostgreSQL access (port 5432)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier tingletalk-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --db-subnet-group-name tingletalk-db-subnet \
  --vpc-security-group-ids sg-xxxxx \
  --publicly-accessible
```

**Note the endpoint URL** after creation (e.g., `tingletalk-db.xxxxx.us-east-1.rds.amazonaws.com`)

#### 1.2 Create ElastiCache Redis

```bash
# Create cache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name tingletalk-redis-subnet \
  --cache-subnet-group-description "Subnet group for TingleTalk Redis" \
  --subnet-ids subnet-xxxxx subnet-yyyyy

# Create security group for Redis
aws ec2 create-security-group \
  --group-name tingletalk-redis-sg \
  --description "Security group for TingleTalk Redis" \
  --vpc-id vpc-xxxxx

# Allow Redis access (port 6379)
aws ec2 authorize-security-group-ingress \
  --group-id sg-yyyyy \
  --protocol tcp \
  --port 6379 \
  --cidr 0.0.0.0/0

# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id tingletalk-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --cache-subnet-group-name tingletalk-redis-subnet \
  --security-group-ids sg-yyyyy
```

**Note the endpoint URL** after creation (e.g., `tingletalk-redis.xxxxx.cache.amazonaws.com`)

### Step 2: Build and Push Docker Image to ECR

#### 2.1 Create ECR Repository

```bash
aws ecr create-repository --repository-name tingletalk-api --region us-east-1
```

#### 2.2 Authenticate Docker to ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

#### 2.3 Build and Push Image

```bash
# Build the Docker image (from project root)
docker build -f apps/api/Dockerfile -t tingletalk-api .

# Tag the image
docker tag tingletalk-api:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/tingletalk-api:latest

# Push to ECR
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/tingletalk-api:latest
```

### Step 3: Deploy to AWS App Runner

#### 3.1 Create App Runner Service

1. Go to **AWS App Runner Console**
2. Click **Create service**
3. **Source**: Container registry → Amazon ECR
4. **Container image URI**: Select your `tingletalk-api:latest` image
5. **Deployment trigger**: Manual (or Automatic for CI/CD)
6. **Service settings**:
   - **Service name**: `tingletalk-api`
   - **Port**: `5000`
   - **CPU**: 1 vCPU
   - **Memory**: 2 GB
7. **Environment variables** (click Add environment variable):
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@tingletalk-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tingletalk
   REDIS_HOST=tingletalk-redis.xxxxx.cache.amazonaws.com
   REDIS_PORT=6379
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```
8. **Health check**: `/health` (if you have a health endpoint)
9. Click **Create & deploy**

#### 3.2 Run Database Migrations

After deployment, you need to run Prisma migrations. You can do this by:

**Option A: Use AWS Systems Manager Session Manager** (if you enable it)

**Option B: Run migrations locally** (one-time setup):
```bash
# Set DATABASE_URL to your RDS endpoint
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@tingletalk-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tingletalk"

# Run migrations
cd apps/api
npx prisma migrate deploy
```

### Step 4: Configure CORS and Update Frontend

Update your frontend `.env` to point to the App Runner URL:
```
NEXT_PUBLIC_API_URL=https://xxxxx.us-east-1.awsapprunner.com
NEXT_PUBLIC_WS_URL=wss://xxxxx.us-east-1.awsapprunner.com
```

## Option 2: Deploy with EC2 (More Control)

### Step 1: Launch EC2 Instance

1. **AMI**: Amazon Linux 2023 or Ubuntu 22.04
2. **Instance Type**: t3.small or larger
3. **Security Group**: Allow ports 22 (SSH), 5000 (API), 80 (HTTP), 443 (HTTPS)
4. **Key Pair**: Create or use existing

### Step 2: SSH into EC2 and Set Up

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repository
git clone https://github.com/your-username/tingletalk.git
cd tingletalk
```

### Step 3: Set Up Environment Variables

```bash
# Create .env file in apps/api
cd apps/api
nano .env
```

Add:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@tingletalk-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tingletalk
REDIS_HOST=tingletalk-redis.xxxxx.cache.amazonaws.com
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Step 4: Build and Run with Docker

```bash
# Go back to project root
cd ../..

# Build the image
docker build -f apps/api/Dockerfile -t tingletalk-api .

# Run the container
docker run -d \
  --name tingletalk-api \
  -p 5000:5000 \
  --env-file apps/api/.env \
  --restart unless-stopped \
  tingletalk-api
```

### Step 5: Set Up Nginx as Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo yum install nginx -y

# Configure Nginx
sudo nano /etc/nginx/conf.d/tingletalk.conf
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | API port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_HOST` | Redis hostname | `tingletalk-redis.cache.amazonaws.com` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-app.vercel.app` |

## Monitoring and Logs

### App Runner
- View logs in **CloudWatch Logs** (automatically created)
- Metrics available in **App Runner Console**

### EC2
```bash
# View container logs
docker logs -f tingletalk-api

# Monitor resource usage
docker stats
```

## Scaling Considerations

1. **App Runner**: Auto-scales based on traffic (configure in service settings)
2. **EC2**: Use Auto Scaling Groups with Load Balancer
3. **Database**: Upgrade RDS instance class or enable read replicas
4. **Redis**: Use ElastiCache cluster mode for high availability

## Cost Optimization

- **App Runner**: ~$25-50/month for small apps
- **RDS t3.micro**: ~$15/month
- **ElastiCache t3.micro**: ~$12/month
- **Total**: ~$50-75/month for starter setup

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs tingletalk-api

# Common issues:
# - DATABASE_URL not set correctly
# - Redis connection failed
# - Prisma client not generated
```

### Database connection issues
- Verify security group allows inbound on port 5432
- Check DATABASE_URL format
- Ensure RDS is publicly accessible (or use VPC peering)

### WebSocket connections failing
- Ensure App Runner/EC2 security group allows WebSocket upgrades
- Check CORS_ORIGIN matches your frontend domain
- Verify Redis connection for Socket.IO adapter

## Next Steps

1. Set up **SSL/TLS** with AWS Certificate Manager (for App Runner) or Let's Encrypt (for EC2)
2. Configure **custom domain** in Route 53
3. Set up **CI/CD** with GitHub Actions to auto-deploy on push
4. Enable **monitoring** with CloudWatch alarms
5. Set up **backup strategy** for RDS

## Useful Commands

```bash
# Rebuild and redeploy
docker build -f apps/api/Dockerfile -t tingletalk-api .
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/tingletalk-api:latest

# Force App Runner to redeploy
aws apprunner start-deployment --service-arn YOUR_SERVICE_ARN

# Check RDS status
aws rds describe-db-instances --db-instance-identifier tingletalk-db

# Check Redis status
aws elasticache describe-cache-clusters --cache-cluster-id tingletalk-redis
```
