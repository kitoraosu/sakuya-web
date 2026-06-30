# sakuya-web

Web interface for a private osu! server built on [bancho.py](https://github.com/osuAkatsuki/bancho.py).

**Stack:** React 19 + TypeScript + Vite (frontend) and Express + mysql2 (backend API).
**Authentication:** Following bancho.py approach: `md5(password)` → comparison with `pw_bcrypt` using **bcrypt**, session via **JWT**.

## Pages

| Path            | Description                                         |
|-----------------|-----------------------------------------------------|
| `/`             | Home page with Sakuya Izayoi mascot                 |
| `/leaderboard`  | Leaderboard by pp with mode switching                |
| `/u/:id`        | Player profile: stats across all modes, grades       |
| `/login`        | Login (real server player account)                   |
| `/dashboard`    | Personal dashboard (JWT protected)                   |

## Project Structure

```
src/                  # Frontend (React + Vite)
  api/client.ts       # fetch client to /api
  context/AuthContext # session management (JWT in localStorage)
  components/         # Navbar, ProtectedRoute, Avatar, ModeTabs
  lib/modes.ts        # mode reference + formatters
  pages/             # Home, Login, Dashboard, Leaderboard, Profile
server/               # Backend (Express) — excluded from browser bundle
  index.ts            # entry point, port 11002
  db.ts               # mysql2 connection pool
  auth.service.ts     # md5 -> bcrypt -> jwt
  stats.service.ts    # leaderboard, profiles (users/stats tables)
  routes/             # auth.ts, players.ts
  middleware/auth.ts  # Bearer token validation
public/sakuya.png     # server mascot
```

## Development Setup

```bash
npm run dev:all     # Frontend (vite :11001) + API (express :11002)
```

Vite proxies `/api` → `http://localhost:11002`.

```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=
MYSQL_USER=
MYSQL_DATABASE=
SERVER_PORT=
JWT_SECRET=...
```

## API

| Method | Path                          | Description                           |
|--------|-------------------------------|---------------------------------------|
| GET    | `/api/health`                 | DB status and mode                    |
| POST   | `/api/auth/login`             | `{username, password}` → `{token, user}` |
| GET    | `/api/auth/me`                | Current user (Bearer token)           |
| GET    | `/api/leaderboard?mode=0`     | Top players by pp for mode            |
| GET    | `/api/players/:id`            | Player profile + statistics           |

`npm run dev:all` (vite :11001 + API :11002).
