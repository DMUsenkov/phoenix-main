#!/bin/bash


set -e


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Phoenix Production Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""


if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo -e "Copy .env.production.example to .env and fill in values"
    exit 1
fi


export $(grep -v '^#' .env | xargs)


REQUIRED_VARS="DOMAIN POSTGRES_PASSWORD MINIO_ROOT_PASSWORD JWT_SECRET_KEY"
for var in $REQUIRED_VARS; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Error: $var is not set in .env${NC}"
        exit 1
    fi
done


if [[ "$POSTGRES_PASSWORD" == *"CHANGE_ME"* ]] || [[ "$JWT_SECRET_KEY" == *"CHANGE_ME"* ]]; then
    echo -e "${RED}Error: Please change default passwords in .env${NC}"
    exit 1
fi

echo -e "${GREEN}OK Environment validated${NC}"


if [ -d .git ]; then
    echo -e "${YELLOW}Pulling latest changes...${NC}"
    git pull origin main || git pull origin master || true
fi


echo -e "${YELLOW}Building Docker images...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache


echo -e "${YELLOW}Running database migrations...${NC}"
docker compose -f docker-compose.prod.yml up -d postgres
sleep 10

docker compose -f docker-compose.prod.yml run --rm api alembic upgrade head


echo -e "${YELLOW}Starting all services...${NC}"
docker compose -f docker-compose.prod.yml up -d


echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 15


echo -e "${YELLOW}Checking service health...${NC}"
if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}OK API is healthy${NC}"
else
    echo -e "${RED}X API health check failed${NC}"
fi


echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
docker compose -f docker-compose.prod.yml ps
echo ""
echo -e "Website: ${YELLOW}https://$DOMAIN${NC}"
echo -e "API Docs: ${YELLOW}https://$DOMAIN/api/docs${NC}"
echo ""
echo -e "View logs: ${BLUE}docker compose -f docker-compose.prod.yml logs -f${NC}"
