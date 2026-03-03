# Phoenix

[![CI](https://github.com/YOUR_USERNAME/phoenix/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/phoenix/actions/workflows/ci.yml)

Платформа мемориальных страниц и объектов памяти.

## Быстрый старт (Docker)

**Рекомендуемый способ** — через Docker Compose:

```bash
# Скопировать env файл
cp .env.example .env

# Поднять все сервисы
make up

# Или без make:
docker compose up -d
```

### Сервисы

| Сервис | URL | Описание |
|--------|-----|----------|
| **API** | http://localhost:8001 | FastAPI backend |
| **API Docs** | http://localhost:8001/docs | Swagger UI |
| **API Health** | http://localhost:8001/health | Health check |
| **MinIO Console** | http://localhost:9001 | S3 storage UI |
| **MinIO API** | http://localhost:9000 | S3 API endpoint |
| **PostgreSQL** | localhost:5433 | Database |

### Полезные команды

```bash
make up        # Запустить все сервисы
make down      # Остановить сервисы
make logs      # Показать логи
make logs-api  # Логи только API
make reset     # Сбросить данные и перезапустить
make health    # Проверить /health
make shell-db  # Открыть psql
make shell-api # Открыть bash в API контейнере
```

### MinIO (S3 Storage)

- **Console:** http://localhost:9001
- **Login:** phoenix / phoenix_secret
- **Bucket:** phoenix-media (создаётся автоматически)

---

## Локальная разработка (без Docker)

### Backend (API)

```bash
cd apps/api

# Создать виртуальное окружение
python -m venv .venv
source .venv/bin/activate  # Linux/macOS

# Установить зависимости
pip install -e ".[dev]"

# Запустить dev сервер
uvicorn app.main:app --reload --port 8000
```

### Frontend (Web)

```bash
cd apps/web

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Web доступен на http://localhost:3000

## Структура проекта

```
phoenix/
├── apps/
│   ├── api/          # FastAPI backend
│   └── web/          # React + TypeScript frontend
├── packages/
│   └── shared/       # Shared types & utilities
├── docs/             # Documentation & ADRs
├── infra/            # Docker, CI/CD configs
└── README.md
```

## Стек технологий

### Backend
- **Python 3.11+**
- **FastAPI** — web framework
- **Pydantic** — validation & settings
- **Structlog** — structured logging
- **Ruff + mypy** — linting & type checking

### Frontend
- **React 18** + **TypeScript**
- **Vite** — build tool
- **TailwindCSS** — styling
- **React Router** — routing
- **ESLint + Prettier** — linting & formatting

## Команды

### Backend

```bash
cd apps/api

# Dev сервер
uvicorn app.main:app --reload

# Тесты
pytest

# Линтинг
ruff check .
ruff format .

# Type checking
mypy app
```

### Frontend

```bash
cd apps/web

# Dev сервер
npm run dev

# Сборка
npm run build

# Линтинг
npm run lint

# Форматирование
npm run format

# Type checking
npm run typecheck
```

## Переменные окружения

### Backend (`apps/api/.env`)

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `APP_NAME` | Название приложения | Phoenix API |
| `APP_VERSION` | Версия | 0.1.0 |
| `DEBUG` | Debug режим | false |
| `ENVIRONMENT` | Окружение | development |
| `HOST` | Хост сервера | 0.0.0.0 |
| `PORT` | Порт сервера | 8000 |
| `CORS_ORIGINS` | Разрешённые origins | ["http://localhost:3000"] |
| `LOG_LEVEL` | Уровень логирования | INFO |
| `LOG_FORMAT` | Формат логов | text |

### Frontend (`apps/web/.env`)

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `VITE_API_URL` | URL API | http://localhost:8000 |
| `VITE_APP_NAME` | Название приложения | Phoenix |
| `VITE_APP_VERSION` | Версия | 0.1.0 |

## Лицензия

Proprietary © Phoenix Team
