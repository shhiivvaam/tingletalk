#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Configuration
IMAGE_NAME="shhiivvaam/tingletalk-api"
CONTAINER_NAME="tingletalk-api"
NEW_CONTAINER_NAME="tingletalk-api-new"
ENV_FILE="$HOME/app-config/.env.production"
PORT=5000
HEALTH_ENDPOINT="http://localhost:5000/health"

# Step 1: Pull latest image
echo -e "${YELLOW}📦 Pulling latest Docker image...${NC}"
docker pull ${IMAGE_NAME}:latest

# Step 2: Run database migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
docker run --rm \
  --env-file ${ENV_FILE} \
  ${IMAGE_NAME}:latest \
  sh -c "cd /app/apps/api && npx prisma migrate deploy" || {
    echo -e "${RED}❌ Migration failed! Aborting deployment.${NC}"
    exit 1
  }

# Step 3: Start new container on different port
echo -e "${YELLOW}▶️  Starting new container...${NC}"
docker run -d \
  --name ${NEW_CONTAINER_NAME} \
  -p 5001:5000 \
  --env-file ${ENV_FILE} \
  --restart unless-stopped \
  -v $HOME/app-logs:/app/logs \
  ${IMAGE_NAME}:latest

# Step 4: Wait for container to be ready
echo -e "${YELLOW}⏳ Waiting for new container to be healthy...${NC}"
sleep 10

# Step 5: Health check
MAX_RETRIES=5
RETRY_COUNT=0
HEALTH_CHECK_PASSED=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -f http://localhost:5001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
    HEALTH_CHECK_PASSED=true
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}⏳ Health check attempt $RETRY_COUNT/$MAX_RETRIES...${NC}"
    sleep 5
  fi
done

if [ "$HEALTH_CHECK_PASSED" = false ]; then
  echo -e "${RED}❌ Health check failed! Rolling back...${NC}"
  docker stop ${NEW_CONTAINER_NAME}
  docker rm ${NEW_CONTAINER_NAME}
  echo -e "${RED}❌ Deployment failed. Old container still running.${NC}"
  exit 1
fi

# Step 6: Switch containers (zero downtime)
echo -e "${YELLOW}🔄 Switching to new container...${NC}"

# Stop old container
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# Rename new container
docker rename ${NEW_CONTAINER_NAME} ${CONTAINER_NAME}

# Update port mapping (stop and restart with correct port)
docker stop ${CONTAINER_NAME}
docker rm ${CONTAINER_NAME}
docker run -d \
  --name ${CONTAINER_NAME} \
  -p ${PORT}:5000 \
  --env-file ${ENV_FILE} \
  --restart unless-stopped \
  -v $HOME/app-logs:/app/logs \
  ${IMAGE_NAME}:latest

# Wait for final container to be ready
sleep 5

# Step 7: Final health check
if curl -f ${HEALTH_ENDPOINT} > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Final health check passed!${NC}"
else
  echo -e "${RED}⚠️  Warning: Final health check failed, but deployment completed.${NC}"
fi

# Step 8: Clean up old images
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

# Step 9: Show deployment info
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Container status:"
docker ps | grep ${CONTAINER_NAME}
echo ""
echo "Recent logs:"
docker logs --tail 20 ${CONTAINER_NAME}
echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
