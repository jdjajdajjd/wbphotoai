# WBPhotoAI

AI-прокачка карточек товара для маркетплейсов (WB, Ozon, Avito). Telegram Mini App.

## Что это

Telegram Mini App, в котором продавцы загружают фото товаров и получают:
- Удаление фона
- Upscale / улучшение качества
- Квадратные/вертикальные форматы для маркетплейсов
- Обложки карточек
- AI-заголовок и описание

## Стек

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS 4
- Zustand (client state)
- Prisma 5 + SQLite (local DB)
- Sonner (toasts)
- React Dropzone
- Telegram WebApp SDK

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Скопировать env
cp .env.example .env

# 3. Создать БД и залить демо-данные
npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# 4. Запустить dev сервер
npm run dev
```

Открыть: http://localhost:3000

## Команды

```bash
npm run dev          # Dev сервер
npm run build        # Production build
npm run db:push      # Sync Prisma schema → SQLite
npm run db:seed      # Залить демо-данные
npm run db:studio    # Prisma Studio (GUI для БД)
npm run setup        # db:push + db:seed вместе
```

## Env переменные

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | SQLite path, default: `file:./dev.db` |
| `KIE_API_KEY` | Ключ KIE.ai. Если пустой — работает mock |
| `KIE_BASE_URL` | URL KIE.ai API |
| `DEMO_MODE` | `"true"` — включить demo mode |
| `ADMIN_TELEGRAM_ID` | Telegram ID для авто-назначения admin роли |
| `NEXT_PUBLIC_DEMO_MODE` | Demo mode в браузере |

## Demo mode

По умолчанию всё работает в demo mode:
- Mock пользователь с 12 кредитами
- 3 демо-проекта с разными статусами
- История платежей
- Кнопка "Тестовая оплата" на главной и экране оплаты — мгновенно зачисляет кредиты

Demo user: `demo_user` (TG ID: 123456789)
Admin demo: `admin_demo` (TG ID: 999999999)

## Admin mode

Для входа в адмику:
1. Через профиль → "Admin-панель" (если `role === 'admin'`)
2. Прямо перейти на `/admin`

В адмике:
- Список заявок на ручную оплату
- Кнопки "Подтвердить" / "Отклонить"
- При подтверждении статус меняется на `paid`, кредиты начисляются

Чтобы сделать тестового пользователя admin — в `prisma/seed.ts` у `adminUser` уже стоит `role: 'admin'`.

## Подключение Telegram Bot / Mini App

1. Создай бота через @BotFather
2. Включи Mini Apps: `/newapp` → укажи URL твоего деплоя
3. Telegram WebApp SDK уже подключен в `app/layout.tsx`
4. Хук `useTelegram()` автоматически получает данные пользователя из `initDataUnsafe`
5. В браузере (вне Telegram) используется mock пользователь — падения нет

Вебхук для платежей можно добавить в `app/api/payments/webhook/route.ts`.

## Подключение KIE.ai

1. Получи API key на kie.ai
2. Вставь в `.env`:
   ```
   KIE_API_KEY=your_key_here
   KIE_BASE_URL=https://api.kie.ai/v1
   ```
3. В файле `services/kie.ts` замени mock-реализации на реальные вызовы (помечены TODO)

Без ключа вся система работает с mock-ответами и demo изображениями.

## Замена mock-платежей на реальные

### Ручная оплата (СБП)
1. Замени реквизиты в `lib/constants.ts` → `MANUAL_PAYMENT_DETAILS`
2. Настрой вебхук или polling для мониторинга входящих переводов
3. При подтверждении вызывай `POST /api/admin/payments` с `action: 'approve'`

### Telegram Stars (production)
1. Настрой Invoice через Telegram Bot API: `sendInvoice`
2. Обработай `pre_checkout_query` вебхук
3. При успешной оплате (`successful_payment`) — начисляй кредиты
4. В `features/payments/PaymentsScreen.tsx` замени mock `handleStarsMock()` на реальный `webApp.openInvoice()`

## Деплой на Cloudflare Pages

```bash
# Вариант 1: Static export (без API routes, только frontend)
# В next.config.ts раскомментировать: output: 'export'
# npm run build → деплоить папку out/

# Вариант 2: Full SSR через @cloudflare/next-on-pages
npm install -D @cloudflare/next-on-pages
npx @cloudflare/next-on-pages
# Деплоить .vercel/output/
```

Для API routes на CF Pages нужен вариант 2 или отдельный backend (Worker/Railway/Fly.io).

## Структура проекта

```
app/                    Next.js App Router
  (pages)/              Страницы приложения
  api/                  API routes (mock backend)
components/
  ui/                   Атомарные компоненты (GlassCard, GradientButton, ...)
  layout/               Shell, BottomNav, SplashScreen
features/
  dashboard/            Главный экран
  projects/             Проекты (список, создание, детали)
  payments/             Оплата и история
  pricing/              Тарифы
  admin/                Админ-панель
  profile/              Профиль
hooks/
  useTelegram.ts        Telegram WebApp SDK integration
  useStore.ts           Zustand global state
lib/
  constants.ts          Константы (операции, пакеты, реквизиты)
  mock-data.ts          Demo data
  utils.ts              Форматирование, хелперы
  db.ts                 Prisma client
services/
  kie.ts                KIE.ai integration (с mock fallback)
types/
  index.ts              TypeScript типы
prisma/
  schema.prisma         Схема БД
  seed.ts               Демо-данные
```
