#!/bin/bash


set -e


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'


if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi


if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}.env file not found!${NC}"
    exit 1
fi


if [ -z "$DOMAIN" ] || [ -z "$CERTBOT_EMAIL" ]; then
    echo -e "${RED}DOMAIN and CERTBOT_EMAIL must be set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Phoenix SSL Initialization${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Domain: ${YELLOW}$DOMAIN${NC}"
echo -e "Email: ${YELLOW}$CERTBOT_EMAIL${NC}"
echo ""


mkdir -p infra/certbot/conf
mkdir -p infra/certbot/www


echo -e "${YELLOW}Creating temporary nginx config...${NC}"
cat > infra/nginx/conf.d/default.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Phoenix is starting...';
        add_header Content-Type text/plain;
    }
}
EOF


echo -e "${YELLOW}Starting nginx for ACME challenge...${NC}"
docker compose -f docker-compose.prod.yml up -d nginx


sleep 5


echo -e "${YELLOW}Obtaining SSL certificates...${NC}"
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $CERTBOT_EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN


echo -e "${YELLOW}Restoring production nginx config...${NC}"
cat > infra/nginx/conf.d/default.conf << 'NGINX_EOF'

server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}


server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;

    location /api/ {
        proxy_pass http://api:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    location /q/ {
        proxy_pass http://api:8000/q/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://web:80;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /nginx-health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
NGINX_EOF


sed -i "s/\${DOMAIN}/$DOMAIN/g" infra/nginx/conf.d/default.conf


echo -e "${YELLOW}Restarting nginx with SSL...${NC}"
docker compose -f docker-compose.prod.yml restart nginx

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SSL certificates obtained successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Your site is now available at: ${YELLOW}https://$DOMAIN${NC}"
echo ""
