# Project Evo: Tech Stack

Project Evo is the "Community Events Board" for the FyerX assignment. An admin posts local events, and visitors browse, filter, favourite categories, get a personal feed, set reminders and design a per-event card.

This document lists what the project uses and why. Anything not listed here is deliberately out of scope.

---

## 1. Stack at a glance

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router), React, TypeScript | Required by the brief. One codebase for pages and API. |
| API | Next.js Route Handlers (`src/app/api/*`) | The brief wants the web pages to call our own JSON API. Mobile can reuse it later. No separate Express server. |
| Styling | Tailwind CSS | Fast, consistent spacing and colours, responsive utilities. |
| Animation | Framer Motion | Smooth live updates on the card designer. |
| Database | PostgreSQL 16 | Relational data, composite keys, good indexing and search options. |
| ORM | Prisma | Typed queries, migrations, simple seeding. |
| Validation | Zod | One schema validates every API input and gives typed results. |
| Auth | JWT (`jose`) and `bcryptjs` | Login returns a token. Passwords are hashed, never stored in plain text. |
| Local infra | Docker Compose (Postgres) | Setup in under 5 minutes. |
| Seed runner | `tsx` | Runs `prisma/seed.ts` without a build step. |

---

## 2. Architecture

```
Browser (Next.js pages)
        |
        |  fetch() with JSON
        v
Next.js Route Handlers  /api/*
        |
        |  Prisma Client
        v
PostgreSQL
```

- Pages are the UI only. All data comes through `/api/*`, the same endpoints a mobile app would call.
- Route handlers share three helpers: `db` (Prisma client), `auth` (hashing, JWT, guards) and `handle` (consistent JSON errors).
- Business rules (3-sticker limit, theme allow-list, active/upcoming filtering) are enforced on the server, not only in the UI.

---

## 3. Authentication and authorisation

- **Passwords:** hashed with bcrypt (cost 12). Only `passwordHash` is stored.
- **Token:** login and signup return a JWT (HS256, 7-day expiry) in the JSON body. The same token is also set as an `httpOnly` cookie for the web app.
- **Token reading:** `getSession()` checks `Authorization: Bearer <token>` first (mobile and API clients), then the cookie (web).
- **Roles:** `USER` and `ADMIN`. The single admin is a seeded user, so there is one login endpoint and one guard.
- **Admin protection has two layers:**
  1. `middleware.ts` and `app/admin/layout.tsx` block `/admin` pages on the server.
  2. Every `/api/admin/*` handler calls `requireAdmin()`. This is the layer that matters, because middleware alone can be bypassed by calling the API directly.
- **Login errors:** the same message for an unknown email and a wrong password, so accounts cannot be enumerated.

---

## 4. Data model

| Model | Purpose | Key |
|---|---|---|
| `User` | Account, `role` (USER or ADMIN), `passwordHash` | `id`, unique `email` |
| `Event` | Title, category, city, `startsAt`, `price`, description, `imageUrl`, `isActive` | `id` |
| `UserCategory` | A user's favourite categories (join table) | `(userId, category)` |
| `Reminder` | A user's reminder on an event | `(userId, eventId)` |
| `EventCard` | A user's card design for an event: `theme`, `stickers[]` | `(userId, eventId)` |

Design choices:
- **Composite primary keys** on the join tables make duplicates impossible, and writes can be idempotent upserts.
- **Price is an integer in whole rupees** (0 means free). It is formatted only at display time.
- **`startsAt` is stored as a UTC timestamp.** It is shown in `Asia/Kolkata`.
- **Events are never deleted.** `isActive` hides them from visitors.
- **Categories are a Prisma enum:** `MUSIC`, `WORKSHOP`, `FOOD`, `SPORTS`, `KIDS`.

---

## 5. Indexing and search

- `Event(isActive, startsAt)` is the main listing index: active, upcoming, nearest first.
- `Event(category, city)` supports the category and city filters.
- Text search uses case-insensitive `contains` on title and description (`ILIKE`). A `pg_trgm` GIN index on `title` is the planned upgrade if search volume grows.
- Filters are combined with AND in a single Prisma `where`, with `skip` and `take` for pagination.

---

## 6. API surface

| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout` | none |
| GET | `/api/events?category&city&q&page&limit` | none |
| GET | `/api/events/:id` | optional (adds `reminded` and `card` when logged in) |
| GET / PUT | `/api/me/categories` | user |
| GET | `/api/feed?page&limit` | user |
| PUT / DELETE | `/api/events/:id/reminder` | user |
| GET / PUT | `/api/events/:id/card` | user |
| GET / POST | `/api/admin/events` | admin |
| PATCH | `/api/admin/events/:id/active` | admin |

All responses are JSON. Errors use `{ "error": "message" }` with the right status code (400, 401, 403, 404, 409, 500).

---

## 7. Frontend conventions

- **States:** every data view has loading, empty and error states.
- **Reminder button:** optimistic update, saved through the API, rolled back with a message if saving fails.
- **Card designer:** 3 gradient themes, 5 emoji stickers, maximum 3, saved per user per event (debounced). A failed save reverts to the last saved design.
- **Formatting:** prices use `Intl.NumberFormat("en-IN")` (for example, ₹1,50,000). Dates look like "Sat, 18 Oct, 6:30 PM".
- **Responsive:** mobile-first Tailwind layout, checked on phone and laptop widths.

---

## 8. Project structure

```
project-evo/
├─ docker-compose.yml
├─ .env.example
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts                 # admin + 15 sample events
└─ src/
   ├─ middleware.ts           # /admin guard (layer 1)
   ├─ lib/
   │  ├─ db.ts                # Prisma client singleton
   │  ├─ auth.ts              # hash, JWT, getSession, requireUser/Admin
   │  ├─ api.ts               # handle(): consistent error responses
   │  ├─ card.ts              # themes, stickers, limits (shared by API and UI)
   │  └─ format.ts            # ₹ and date formatting
   ├─ hooks/
   │  └─ useReminder.ts
   ├─ components/
   │  └─ CardDesigner.tsx
   └─ app/
      ├─ api/                 # all JSON endpoints
      ├─ admin/               # protected pages (layer 2 in layout.tsx)
      └─ (pages)              # events, feed, login, signup, onboarding, event detail
```

---

## 9. Environment variables

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://events:events@localhost:5432/events` | Swap for a hosted Postgres (Neon, Supabase) if needed. |
| `JWT_SECRET` | long random string | Never commit the real one. |

---

## 10. Run locally

```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Admin login: `admin@events.test` / `Admin@123`

---

## 11. Out of scope

Not built on purpose: Express, event edit and delete, payments, email or push reminders, image upload, social login, and admin user management. The brief says extra features earn no extra marks.

Known gaps to list in the README: rate limiting on auth routes, `pg_trgm` index, automated tests.

---

## 12. AI tool usage

To be completed before submission. Record exactly where AI assisted (for example, scaffolding, boilerplate, review) so the README disclosure is accurate. Every line must be understood and explainable.
