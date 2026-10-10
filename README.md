# Project Evo — Community Events Board

Project Evo is a modern Community Events Board web application built for the FyerX assignment. An admin posts and manages local events across categories and cities, while community members browse upcoming active events, search and filter by category or city, save personalized favourite categories to receive a custom feed, set optimistic reminders, and customize interactive digital event souvenir cards with themes and stickers.

---

## 1. Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, custom token system adhering to the Black Velvet with Violet Neon aesthetic
- **Animation:** Framer Motion (smooth theme gradient transitions & spring-animated sticker additions)
- **Database:** PostgreSQL 16 (relational schema with composite primary keys)
- **ORM:** Prisma 6 (typed queries, migrations, seed data runner)
- **Validation:** Zod (typed runtime validation for every API endpoint)
- **Authentication:** JWT (`jose`, HS256, 7-day expiry) with `bcryptjs` (cost 12 hashing) & dual authentication reading (Bearer header + httpOnly cookie)
- **Local Infrastructure:** Docker Compose (PostgreSQL 16 alpine)

---

## 2. Quick Setup (< 5 Minutes)

### Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- Docker Desktop or an external PostgreSQL instance

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/py-kalki/Project-Evo.git
   cd Project-Evo/project-evo
   ```

2. **Start PostgreSQL via Docker Compose:**
   ```bash
   docker compose up -d
   ```
   *(Note: If you are using a cloud database such as Neon or Supabase, simply update `DATABASE_URL` in `.env`)*

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
   Default `.env` contains:
   ```env
   DATABASE_URL="postgresql://events:events@localhost:5432/events"
   JWT_SECRET="dev-secret-change-in-production-32chars-min"
   ```

4. **Install Dependencies:**
   ```bash
   npm install
   ```

5. **Run Prisma Migration & Seed:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   The seed script creates the demo admin user and 15 curated events (9 active upcoming, 3 inactive, 3 past) with dates relative to `now()` so they never go stale.

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@events.test` | `Admin@123` | Full access to `/admin`, event publishing, active toggling |
| **Member** | `test@x.com` | `password123` | Browsing, personalized feed, reminders, card design |

*(A handy "Fill Credentials" shortcut is also provided directly on the `/login` page for fast reviewer access).*

---

## 4. API Endpoints Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new user, returns JWT and sets httpOnly cookie |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, returns JWT and sets cookie |
| `POST` | `/api/auth/logout` | Public | Clears session cookie |
| `GET` | `/api/cities` | Public | Returns distinct cities with active upcoming events |
| `GET` | `/api/events` | Public | Paginated list of active upcoming events (category, city, q filters) |
| `GET` | `/api/events/:id` | Optional | Event details, plus user's reminder and card state if logged in |
| `GET` | `/api/me/categories` | User | Get current user's favourite categories |
| `PUT` | `/api/me/categories` | User | Replace user's favourite categories |
| `GET` | `/api/feed` | User | Personalized feed of upcoming events matching user favourites |
| `PUT` | `/api/events/:id/reminder` | User | Set reminder (server rejects past events with 409) |
| `DELETE` | `/api/events/:id/reminder` | User | Clear reminder |
| `GET` | `/api/events/:id/card` | User | Get user's customized event card design |
| `PUT` | `/api/events/:id/card` | User | Save card design (theme allowlist, max 3 stickers) |
| `GET` | `/api/admin/events` | Admin | List all events (newest first, including inactive and past) |
| `POST` | `/api/admin/events` | Admin | Create and publish a new event |
| `PATCH` | `/api/admin/events/:id/active` | Admin | Toggle event active status (never deleted) |

---

## 5. Key Architecture & Technical Questions

### 1. Database Structure and Why
The database consists of 5 models: `User`, `Event`, `UserCategory`, `Reminder`, and `EventCard`.
- **Composite Primary Keys:** `(userId, category)`, `(userId, eventId)`, and `(userId, eventId)` are used on join tables to guarantee zero duplicate records at the database engine level, turning card saves and reminder actions into safe, idempotent upserts.
- **Integer Currency:** `price` is stored as an integer representing whole Indian Rupees (`₹`), avoiding floating-point rounding errors and precision issues.
- **UTC Timestamps:** All dates are stored in UTC (`DateTime`) with timezone-independent queries (`startsAt >= now()`), formatted to IST (`Asia/Kolkata`) only at the presentation layer.
- **Soft Deletion / Visibility:** The brief strictly enforces that events are never deleted. An `isActive` boolean flag allows admins to hide or restore events while preserving all associated user reminders and card designs via `onDelete: Cascade`.

### 2. Filter Queries, Indexing and Pagination
All public event queries apply a base condition `{ isActive: true, startsAt: { gte: new Date() } }` combined using `AND` with optional filters: `category` (enum match), `city` (case-insensitive equality), and `q` (`title` or `description` contains `q`).
- **Database Indexes:** Composite index `@@index([isActive, startsAt])` enables index range scans for upcoming active events sorted by date (`orderBy: { startsAt: 'asc' }`). An additional index `@@index([category, city])` accelerates multi-attribute filtering.
- **Atomic Pagination:** Data fetching and total counts are executed within a single `db.$transaction([findMany, count])` to guarantee pagination consistency.

### 3. Passwords and Defense-in-Depth Admin Protection
- **Password Security:** Passwords are hashed with `bcryptjs` using a cost factor of 12 before being written to the database. Error messages for invalid emails and incorrect passwords use identical wording (`"Invalid email or password"`) to prevent timing and account enumeration vulnerabilities.
- **Three-Tier Admin Protection:**
  1. *Layer 1 (Edge Middleware):* `src/middleware.ts` intercepts `/admin/*` requests and redirects unauthenticated or non-admin visitors to `/login?next=...`.
  2. *Layer 2 (Server Layout):* `src/app/admin/layout.tsx` re-verifies the JWT session in the server runtime and enforces role checks.
  3. *Layer 3 (Server API Guard):* Every `/api/admin/*` endpoint executes `requireAdmin(req)`. Because clients could bypass page middleware by issuing direct curl or fetch API requests, the API guard is the decisive barrier that returns `401 Unauthorized` or `403 Forbidden`.

---

## 6. Design System

The application strictly implements the visual language specified in `DESIGN.md`:
- **Canvas:** Void Black (`#000000`) and dark elevation cards (`#050505`).
- **Separation:** 1px Graphite Hairline borders (`#292d30`).
- **Accent:** Iris Violet (`#9281f7`, `#baa7ff`) on focus states, badges, and brand marks.
- **Typography:** Inter with high-contrast Bone White (`#f0f0f0`) body text and pure White (`#ffffff`) headers.
- **Micro-interactions:** Restrained 150ms ease-out hover lifts, responsive mobile navigation drawer, and animated Framer Motion transitions.

---

## 7. AI Usage Log

In accordance with project guidelines, AI assistance was utilized transparently for:
- Initial project scaffolding and dependency resolution.
- Drafting Prisma schema migration files and comprehensive seed datasets.
- Structuring repetitive Zod validation schemas and TypeScript route handler templates.
- Verifying edge cases across the REST API using automated curl test suites.

---

## 8. Out of Scope / Future Work

By explicit specification in `prd.md` section 10, the following items are intentionally omitted:
- User password reset flows / OAuth providers.
- Physical payment gateway integration (prices are mock/display).
- Hard deletion of events by admins (strictly inactive toggle only).
- Notification email/SMS delivery infrastructure.
