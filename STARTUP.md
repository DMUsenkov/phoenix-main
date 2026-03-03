#  Phoenix Startup Guide

## Автоматический запуск всех сервисов

Для запуска всех сервисов Phoenix используй:

```bash
docker-compose up -d
```

Это запустит:
- **PostgreSQL** — база данных
- **MinIO** — S3-совместимое хранилище
- **API** — FastAPI бэкенд
- **Vite** — dev-сервер фронтенда
- **Web** — nginx reverse proxy

## Ручной запуск

### 1. Запуск Docker Desktop

```bash
open -a Docker
```

Подожди 10-15 секунд, пока Docker запустится.

### 2. Запуск контейнеров

```bash
docker-compose up -d
```

### 3. Проверка статуса

```bash
docker-compose ps
```

Все контейнеры должны быть в статусе `healthy` или `Up`.

## Фронтенд теперь в Docker!

Фронтенд автоматически запускается в Docker. Не нужно запускать `npm run dev` вручную.

Фронтенд доступен на `http://localhost:3000`

## Полезные команды

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только API
docker logs -f phoenix-api

# Только PostgreSQL
docker logs -f phoenix-postgres
```

### Остановка сервисов

```bash
# Остановить контейнеры (данные сохранятся)
docker-compose down

# Остановить и удалить данные
docker-compose down -v
```

### Перезапуск сервисов

```bash
# Перезапустить все контейнеры
docker-compose restart

# Перезапустить только API
docker restart phoenix-api
```

## Автоматический перезапуск

Все контейнеры настроены с `restart: always`, что означает:
- Контейнеры автоматически перезапустятся при падении
- Контейнеры автоматически запустятся при запуске Docker Desktop
- Контейнеры автоматически запустятся после перезагрузки системы

## Доступ к сервисам

- **API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **PostgreSQL**: localhost:5433
- **MinIO API**: http://localhost:9000
- **MinIO Console**: http://localhost:9001
- **Frontend**: http://localhost:3000

## Учётные данные

### API (для входа в систему)
- Email: `admin@phoenix.dev`
- Пароль: `admin123`

### PostgreSQL
- Host: `localhost`
- Port: `5433`
- Database: `phoenix`
- User: `phoenix`
- Password: `phoenix_secret`

### MinIO
- Access Key: `phoenix`
- Secret Key: `phoenix_secret`

## Troubleshooting

### Docker не запускается

```bash
# Проверить, запущен ли Docker
docker info

# Если не запущен, запустить вручную
open -a Docker
```

### Контейнеры не запускаются

```bash
# Проверить логи
docker-compose logs

# Пересоздать контейнеры
docker-compose down
docker-compose up -d --build
```

### Фронтенд зависает

```bash
# Перезапустить контейнеры фронтенда
docker-compose restart vite web
```

### База данных недоступна

```bash
# Проверить статус PostgreSQL
docker logs phoenix-postgres

# Перезапустить PostgreSQL
docker restart phoenix-postgres
```
