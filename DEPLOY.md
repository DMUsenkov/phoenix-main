#  Инструкция по запуску Phoenix

## Требования

- Docker и Docker Compose
- Порты 3000, 8000, 5432, 9000, 9001 должны быть свободны

## Быстрый старт

### 1. Запуск всех сервисов

```bash
docker-compose up -d
```

Это запустит:
- **PostgreSQL** (порт 5432) — база данных
- **MinIO** (порты 9000, 9001) — хранилище файлов
- **API** (порт 8000) — FastAPI бэкенд
- **Vite** (порт 3000) — React фронтенд

### 2. Проверка статуса

```bash
docker-compose ps
```

Все контейнеры должны быть в статусе `Up`.

### 3. Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только API
docker-compose logs -f api

# Только фронтенд
docker-compose logs -f vite
```

### 4. Доступ к приложению

- **Фронтенд**: http://localhost:3000
- **API документация**: http://localhost:8000/docs
- **MinIO Console**: http://localhost:9001 (admin / adminadmin)

### 5. Первый вход

Используй тестовый аккаунт:
- Email: `admin@phoenix.dev`
- Пароль: `admin123`

## Управление сервисами

### Остановка

```bash
docker-compose stop
```

### Перезапуск

```bash
# Все сервисы
docker-compose restart

# Только API
docker-compose restart api

# Только фронтенд
docker-compose restart vite
```

### Полная очистка (удаление данных)

```bash
docker-compose down -v
```

Warning **Внимание**: это удалит все данные из базы и MinIO!

## Миграции базы данных

Миграции применяются автоматически при запуске API.

Если нужно применить вручную:

```bash
docker-compose exec api alembic upgrade head
```

## Переменные окружения

Основные настройки в `.env`:

```env
# Database
POSTGRES_USER=phoenix
POSTGRES_PASSWORD=phoenix
POSTGRES_DB=phoenix

# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=adminadmin

# API
DATABASE_URL=postgresql+asyncpg://phoenix:phoenix@postgres:5432/phoenix
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=adminadmin

# Frontend
VITE_API_URL=http://localhost:8000
```

## Деплой в продакшн

### 1. Подготовка сервера

```bash
# Установи Docker и Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Клонируй репозиторий
git clone <repo-url> /opt/phoenix
cd /opt/phoenix
```

### 2. Настройка переменных окружения

```bash
# Скопируй шаблон
cp .env.production.example .env

# Отредактируй .env - ОБЯЗАТЕЛЬНО замени:
# - DOMAIN=твой-домен.ru
# - POSTGRES_PASSWORD=сильный_пароль
# - MINIO_ROOT_PASSWORD=сильный_пароль
# - JWT_SECRET_KEY=$(openssl rand -hex 32)
# - CERTBOT_EMAIL=твой@email.com
# - CORS_ORIGINS=["https://твой-домен.ru"]
# - PUBLIC_BASE_URL=https://твой-домен.ru
```

### 3. Получение SSL сертификатов

```bash
# Первичная настройка SSL (требует sudo)
make init-ssl
```

### 4. Запуск в продакшн

```bash
# Полный деплой (сборка + миграции + запуск)
make prod-deploy

# Или по шагам:
make prod-build      # Собрать образы
make prod-migrate    # Применить миграции
make prod-up         # Запустить сервисы
```

### 5. Проверка

```bash
make prod-ps         # Статус контейнеров
make prod-logs       # Логи
curl https://твой-домен.ru/api/health  # Health check
```

### 6. Бэкапы

```bash
# Бэкап базы данных
make prod-backup

# Бэкап с MinIO (опционально)
./infra/scripts/backup.sh --with-minio

# Восстановление
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U phoenix phoenix < backups/postgres_YYYYMMDD.sql
```

### 7. Обновление

```bash
git pull
make prod-deploy
```

## Решение проблем

### Контейнер не запускается

```bash
# Проверь логи
docker-compose logs <service_name>

# Пересоздай контейнер
docker-compose up -d --force-recreate <service_name>
```

### Порт занят

```bash
# Найди процесс
lsof -i :3000

# Останови его или измени порт в docker-compose.yml
```

### База данных не инициализируется

```bash
# Удали volume и пересоздай
docker-compose down -v
docker-compose up -d
```

## Полезные команды

```bash
# Зайти в контейнер
docker-compose exec api bash
docker-compose exec postgres psql -U phoenix

# Посмотреть использование ресурсов
docker stats

# Очистить неиспользуемые образы
docker system prune -a
```

## Структура проекта

```
web4/
├── apps/
│   ├── api/          # FastAPI бэкенд
│   └── web/          # React фронтенд
├── docker-compose.yml
├── .env
└── DEPLOY.md         # Этот файл
```

## Поддержка

При возникновении проблем проверь:
1. Логи контейнеров: `docker-compose logs`
2. Статус сервисов: `docker-compose ps`
3. Доступность портов: `netstat -tuln | grep -E '3000|8000|5432|9000'`
