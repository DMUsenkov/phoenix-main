# Phoenix API

Backend API для платформы Phoenix.

## Быстрый старт

```bash
# Создать виртуальное окружение
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows

# Установить зависимости
pip install -e ".[dev]"

# Скопировать env файл
cp .env.example .env

# Запустить dev сервер
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Команды

```bash
# Запуск dev сервера
uvicorn app.main:app --reload

# Тесты
pytest

# Тесты с coverage
pytest --cov=app --cov-report=html

# Линтинг
ruff check .

# Форматирование
ruff format .

# Type checking
mypy app
```

## API Endpoints

- `GET /health` — Health check
- `GET /docs` — Swagger UI (только в DEBUG режиме)
- `GET /redoc` — ReDoc (только в DEBUG режиме)
- `GET /openapi.json` — OpenAPI schema

## Структура

```
apps/api/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   └── health.py
│   │   └── router.py
│   ├── core/
│   │   ├── config.py
│   │   └── logging.py
│   └── main.py
├── tests/
│   ├── conftest.py
│   └── test_health.py
├── pyproject.toml
└── .env.example
```