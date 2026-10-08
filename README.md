# Laravel + React SaaS Starter Kit

A production-grade starter kit for building SaaS products: a **Laravel 11 API backend** (Sanctum token auth, role-based access, users CRUD, dashboard stats) paired with a **React 18 + Vite + Tailwind CSS frontend** (login/register, protected routes, dashboard layout, admin user management).

Stop rebuilding auth for every project. Clone, install, and start building your product on day one.

---

## Features

**Backend (Laravel 11 API)**
- Token authentication with Laravel Sanctum — register, login, logout, "me" endpoints
- Role-based access control (`admin` / `user`) via a reusable `role` middleware
- Full Users CRUD API (admin only) with pagination, validation, and self-delete protection
- Dashboard stats endpoint with real database-computed metrics
- JSON-first API: clean 401/403/404/422 JSON responses everywhere (no HTML error pages)
- Database seeder with a demo admin + sample users
- Feature tests covering the auth flow (10 passing tests included)

**Frontend (React 18 + Vite + Tailwind)**
- Login / Register pages with per-field validation errors
- Auth context with token persistence and automatic session restore
- Protected routes + admin-only routes
- Dashboard layout: dark sidebar, topbar, 4 stat cards, recent-users table
- Admin Users page: full CRUD with modals, role management, pagination
- Axios client with Bearer token injection and 401 auto-logout

---

## Requirements

| | Version |
|---|---|
| PHP | 8.2+ |
| Composer | 2.x |
| Node.js | 18+ |
| npm | 9+ |
| Database | SQLite (default, zero-config) or MySQL/PostgreSQL |

---

## Quick start

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve --port=8000
```

The API is now live at `http://localhost:8000/api`.

> **Do NOT run `php artisan migrate --seed`.** The kit ships with a pre-seeded `database/database.sqlite`, so the demo works out of the box — re-running the seeder is harmless (it only fills in missing demo data), but it won't reset anything. The only time to run `php artisan migrate:fresh --seed` is when you want a **clean reset** of the database.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL defaults to http://localhost:8000
npm run dev
```

Open `http://localhost:5173` and log in with:

- **Admin:** `admin@demo.io` / `password`
- Or register a brand-new user account (gets the `user` role automatically)

> **Going to production?** Remove the "Demo credentials" hint box from the login page by deleting the `<div className="mt-6 rounded-lg bg-slate-50 px-4 py-3 ...">` block (the one rendering "Demo credentials" / `admin@demo.io`) in `frontend/src/pages/Login.jsx`.

---

## API reference

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register. Body: `name, email, password, password_confirmation` → 201 `{user, token}` |
| POST | `/auth/login` | — | Login. Body: `email, password` → 200 `{user, token}` |
| POST | `/auth/logout` | Bearer | Revokes the current token → 200 |
| GET | `/auth/me` | Bearer | Current user → 200 `{user}` |
| GET | `/dashboard/stats` | Bearer | `{total_users, new_users_this_week, admins_count, active_tokens}` |
| GET | `/users` | Bearer + admin | Paginated users `{data, meta}` |
| POST | `/users` | Bearer + admin | Create user `{name, email, password, role}` → 201 |
| GET | `/users/{id}` | Bearer + admin | Single user |
| PUT | `/users/{id}` | Bearer + admin | Update user → 200 |
| DELETE | `/users/{id}` | Bearer + admin | Delete user → 204 (cannot delete yourself) |

User object: `{id, name, email, role, email_verified_at, created_at, updated_at}`

---

## Folder map

```
saas-starter-kit/
├── README.md                  ← you are here
├── LICENSE                    ← MIT license
├── PRODUCT-BRIEF.md           ← sales-page copy + pricing suggestions
├── backend/                   ← Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   ← AuthController, UserController, DashboardController
│   │   │   ├── Middleware/        ← EnsureUserHasRole
│   │   │   ├── Requests/          ← Register/Login/StoreUser/UpdateUser validation
│   │   │   └── Resources/         ← UserResource (API JSON shape)
│   │   └── Models/User.php
│   ├── bootstrap/app.php          ← middleware alias + JSON exception handling
│   ├── config/cors.php            ← frontend origin allowed
│   ├── database/
│   │   ├── migrations/            ← users table, role column, personal_access_tokens
│   │   ├── factories/             ← UserFactory
│   │   ├── seeders/               ← demo admin + 8 users
│   │   └── database.sqlite        ← pre-seeded demo DB (reset with migrate:fresh --seed)
│   ├── routes/api.php             ← all 10 API routes
│   ├── tests/Feature/AuthTest.php ← 10 passing tests
│   ├── composer.json / composer.lock
│   └── .env.example
└── frontend/                  ← React 18 + Vite + Tailwind
    ├── src/
    │   ├── api/client.js          ← axios instance, token + 401 handling
    │   ├── context/AuthContext.jsx← login/register/logout/session restore
    │   ├── components/            ← ProtectedRoute, Layout, StatCard, UsersTable
    │   └── pages/                 ← Login, Register, Dashboard, Users, NotFound
    ├── index.html
    ├── tailwind.config.js / postcss.config.js / vite.config.js
    ├── package.json
    └── .env.example               ← VITE_API_URL
```

---

## Customizing

- **Add a role:** add the role name to the `role` validation rule in `StoreUserRequest`/`UpdateUserRequest` and use `->middleware('role:admin,manager')` on routes.
- **Add a resource:** create `Model + migration + Resource + FormRequests + Controller`, then register routes in `routes/api.php` following the `UserController` pattern.
- **Change branding:** edit the sidebar logo text in `frontend/src/components/Layout.jsx` and the `<title>` in `frontend/index.html`.
- **Point at production:** set `VITE_API_URL` to your API domain and rebuild (`npm run build`); set `APP_URL`/`FRONTEND_URL` in backend `.env`.

## Running tests

```bash
cd backend
php artisan test
```

## Environment notes

- Never commit `.env` (both apps gitignore it). Copy from `.env.example`.
- The backend ships without `vendor/` — run `composer install` after extracting.
- The frontend ships without `node_modules/` — run `npm install` after extracting.
- CORS is pre-configured for `http://localhost:5173` via `FRONTEND_URL`.

## Demo mode (interactive preview)

Build the frontend with `VITE_DEMO_MODE=true` to run it against an in-memory
mock API (`frontend/src/api/demoMock.js`) — no backend needed. The preview is
fully clickable: sign in with `admin@demo.io` / `password`, browse the
dashboard, and manage the sample users. Used for the public GitHub Pages demo:

```bash
cd frontend
VITE_DEMO_MODE=true npm run build -- --base=/your-sub-path/
```

The shipped product defaults to the real Laravel API (`VITE_DEMO_MODE` unset).

---

## License

MIT — use it in personal and commercial projects. The only thing you may not do is resell this starter kit itself as a standalone product.
