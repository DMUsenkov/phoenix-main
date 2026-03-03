.PHONY: help up down logs restart reset build ps shell-api shell-db health \
        prod-up prod-down prod-logs prod-build prod-deploy prod-backup init-ssl


help:
	@echo "Phoenix Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "=== Development ==="
	@echo "  up        - Start all services (detached)"
	@echo "  down      - Stop all services"
	@echo "  restart   - Restart all services"
	@echo "  logs      - Show logs (follow mode)"
	@echo "  logs-api  - Show API logs only"
	@echo "  ps        - Show running containers"
	@echo "  build     - Rebuild containers"
	@echo ""
	@echo "=== Database & Storage ==="
	@echo "  reset     - Stop, remove volumes, and restart fresh"
	@echo "  shell-db  - Open psql shell in postgres"
	@echo ""
	@echo "=== API ==="
	@echo "  shell-api - Open bash shell in API container"
	@echo "  health    - Check API health endpoint"
	@echo ""
	@echo "=== Frontend ==="
	@echo "  web       - Start frontend dev server (outside Docker)"
	@echo ""
	@echo "=== Production ==="
	@echo "  prod-up     - Start production services"
	@echo "  prod-down   - Stop production services"
	@echo "  prod-logs   - Show production logs"
	@echo "  prod-build  - Build production images"
	@echo "  prod-deploy - Full production deployment"
	@echo "  prod-backup - Backup database"
	@echo "  init-ssl    - Initialize SSL certificates"
	@echo ""


up:
	docker compose up -d
	@echo ""
	@echo "OK Phoenix is starting..."
	@echo ""
	@echo "Services:"
	@echo "  API:          http://localhost:$${API_PORT:-8001}"
	@echo "  API Docs:     http://localhost:$${API_PORT:-8001}/docs"
	@echo "  API Health:   http://localhost:$${API_PORT:-8001}/health"
	@echo "  MinIO API:    http://localhost:$${MINIO_API_PORT:-9000}"
	@echo "  MinIO Console: http://localhost:$${MINIO_CONSOLE_PORT:-9001}"
	@echo "  PostgreSQL:   localhost:$${POSTGRES_PORT:-5433}"
	@echo ""
	@echo "Run 'make logs' to see logs"

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

ps:
	docker compose ps

build:
	docker compose build --no-cache


reset:
	@echo "Warning  This will delete all data (postgres + minio volumes)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose down -v
	docker compose up -d
	@echo "OK Fresh environment started"

shell-db:
	docker compose exec postgres psql -U phoenix -d phoenix


shell-api:
	docker compose exec api bash

health:
	@curl -s http://localhost:$${API_PORT:-8001}/health | python3 -m json.tool || echo "API not responding"


web:
	cd apps/web && npm run dev


prod-up:
	docker compose -f docker-compose.prod.yml up -d
	@echo ""
	@echo "OK Phoenix Production is starting..."
	@echo "Run 'make prod-logs' to see logs"

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

prod-build:
	docker compose -f docker-compose.prod.yml build --no-cache

prod-deploy:
	./infra/scripts/deploy.sh

prod-backup:
	./infra/scripts/backup.sh

init-ssl:
	sudo ./infra/scripts/init-ssl.sh

prod-migrate:
	docker compose -f docker-compose.prod.yml run --rm api alembic upgrade head

prod-ps:
	docker compose -f docker-compose.prod.yml ps
