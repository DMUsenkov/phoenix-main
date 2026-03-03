# Phoenix Web

Frontend для платформы Phoenix.

## Быстрый старт

```bash
# Установить зависимости
npm install

# Скопировать env файл
cp .env.example .env

# Запустить dev сервер
npm run dev
```

## Команды

```bash
# Dev сервер
npm run dev

# Сборка
npm run build

# Preview production build
npm run preview

# Линтинг
npm run lint
npm run lint:fix

# Форматирование
npm run format
npm run format:check

# Type checking
npm run typecheck

# Тесты
npm run test
npm run test:coverage
```

## Структура

```
apps/web/
├── public/
│   └── phoenix.svg
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Layout.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── AppPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .env.example
```

## Роутинг

- `/` — Landing page
- `/auth` — Страница авторизации (заглушка)
- `/app` — Личный кабинет (заглушка)
- `*` — 404 страница
