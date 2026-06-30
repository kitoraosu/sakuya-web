# sakuya-web

Веб-интерфейс для приватного osu!-сервера на [bancho.py](https://github.com/osuAkatsuki/bancho.py).

Стек: **React 19 + TypeScript + Vite** (фронт) и **Express + mysql2** (бэкенд API).
Аутентификация — как в bancho.py: `md5(пароль)` → сравнение с `pw_bcrypt` через **bcrypt**, сессия на **JWT**.

## Страницы

| Путь            | Описание                                            |
|-----------------|-----------------------------------------------------|
| `/`             | Главная с маскотом (Sakuya Izayoi)                  |
| `/leaderboard`  | Таблица лидеров по pp, переключение режимов          |
| `/u/:id`        | Профиль игрока: статистика по всем режимам, грейды   |
| `/login`        | Вход (реальный аккаунт игрока сервера)               |
| `/dashboard`    | Личный кабинет (защищён JWT)                         |

## Структура

```
src/                  # фронтенд (React + Vite)
  api/client.ts       # fetch-клиент к /api
  context/AuthContext # сессия (JWT в localStorage)
  components/         # Navbar, ProtectedRoute, Avatar, ModeTabs
  lib/modes.ts        # справочник режимов + форматтеры
  pages/             # Home, Login, Dashboard, Leaderboard, Profile
server/               # бэкенд (Express) — НЕ попадает в браузерный бандл
  index.ts            # точка входа, порт 11002
  db.ts               # пул mysql2
  auth.service.ts     # md5 -> bcrypt -> jwt
  stats.service.ts    # leaderboard, профиль (таблицы users/stats)
  routes/             # auth.ts, players.ts
  middleware/auth.ts  # проверка Bearer-токена
public/sakuya.png     # маскот сервера
```

## Запуск (dev)

```bash
npm run dev:all     # фронт (vite :11001) + API (express :11002)
```

Vite проксирует `/api` → `http://localhost:11002`.

## Подключение к БД bancho.py

bancho.py крутится в Docker (`~/bancho.py`). Для веба mysql/redis проброшены
в локалку WSL на нестандартных портах (см. `~/bancho.py/docker-compose.yml`):

- MySQL: **11003** → 3306
- Redis: **11004** → 6379

`.env` веба настроен на эту БД:

```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=11003
MYSQL_USER=kit
MYSQL_DATABASE=sakuya
SERVER_PORT=11002
JWT_SECRET=...
```

> Если `MYSQL_USER`/`MYSQL_DATABASE` пустые — сервер стартует в mock-режиме
> (тестовый вход `Sakuya` / `sakuya`).

## API

| Метод | Путь                          | Описание                              |
|-------|-------------------------------|---------------------------------------|
| GET   | `/api/health`                 | Статус и режим БД                     |
| POST  | `/api/auth/login`             | `{username, password}` → `{token, user}` |
| GET   | `/api/auth/me`                | Текущий пользователь (Bearer)         |
| GET   | `/api/leaderboard?mode=0`     | Топ игроков по pp для режима          |
| GET   | `/api/players/:id`            | Профиль игрока + статистика           |

## Production (домен sakuya.qzz.io)

Фронт развёрнут на корневом домене за Cloudflare:

- **nginx**: `sites-available/sakuya-web.conf` (server_name `sakuya.qzz.io`),
  статика из `/var/www/sakuya-web`, `/api` → проксируется на `:11002`.
  Bancho.py остаётся на поддоменах `c.` / `osu.` / `a.` и т.д.
- **API**: systemd-сервис `sakuya-api` (Express, автозапуск + autorestart).
  - `sudo systemctl status sakuya-api`
  - `sudo journalctl -u sakuya-api -f` — логи
- **SSL**: используется wildcard `*.sakuya.qzz.io`. Корень за Cloudflare (режим Full),
  поэтому отдельный сертификат на голый домен не требуется.

### Обновление после правок

```bash
./scripts/deploy.sh      # build + копирование в /var/www + рестарт API
```

> Для разработки по-прежнему: `npm run dev:all` (vite :11001 + API :11002).
