#!/bin/bash


set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y%m%d_%H%M%S)

cd "$PROJECT_DIR"


if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi


mkdir -p "$BACKUP_DIR"

echo "========================================="
echo "Phoenix Backup - $DATE"
echo "========================================="


echo "Backing up PostgreSQL..."
docker compose -f docker-compose.prod.yml exec -T postgres \
    pg_dump -U ${POSTGRES_USER:-phoenix} ${POSTGRES_DB:-phoenix} \
    > "$BACKUP_DIR/postgres_$DATE.sql"

if [ $? -eq 0 ]; then
    gzip "$BACKUP_DIR/postgres_$DATE.sql"
    echo "OK PostgreSQL backup: postgres_$DATE.sql.gz"
else
    echo "X PostgreSQL backup failed"
fi


if [ "$1" == "--with-minio" ]; then
    echo "Backing up MinIO..."
    docker compose -f docker-compose.prod.yml exec -T minio \
        mc mirror /data "$BACKUP_DIR/minio_$DATE" || true
    echo "OK MinIO backup complete"
fi


echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "postgres_*.sql.gz" -mtime +7 -delete

echo ""
echo "========================================="
echo "Backup complete!"
echo "Location: $BACKUP_DIR"
echo "========================================="
ls -lh "$BACKUP_DIR"
