# Project Evo: Implementation Plan

This is the build plan: the order of work, what to commit at each step, how to check each step, and how to finish with a clean submission. It follows `prd.md`, `techstack.md`, `app-flow.md` and `backend-schema.md`.

---

## 1. Timeline and budget

| Item | Value |
|---|---|
| Email received | 10 Oct 2026, about 12:59 PM (as shown in the email) |
| Deadline | 5 days from receiving, so around 15 Oct 2026 |
| Recommended submit date | **14 Oct**, leaving one buffer day |
| Estimated effort | About 5 to 6 hours (the brief says 4 to 5, and the recording and README take time) |
| Rule | Honest, good-quality work beats a rushed full list. No extras. |

### Suggested schedule

| Day | Date | Work | Hours |
|---|---|---|---|
| 1 | Sat 10 Oct | Phases 0 to 2 (setup, schema, seed, auth) | 1.5 |
| 2 | Sun 11 Oct | Phases 3 to 4 (admin, events and filters) | 1.5 |
| 3 | Mon 12 Oct | Phases 5 to 6 (feed, event page, Remind me) | 1.25 |
| 4 | Tue 13 Oct | Phases 7 to 8 (card designer, polish) | 1.5 |
| 5 | Wed 14 Oct | Phase 9 (README, test on a clean clone, recording, submit) | 1 |
| Buffer | Thu 15 Oct | Only for fixes. Do not start new work. | 0 |

Adjust the dates if you work faster. Commit at the end of every phase.

---

## 2. Rules for the whole build

1. **Follow the docs.** If you want to change behaviour, change the doc first.
2. **No extras.** Anything outside `prd.md` section 10 is not built.
3. **Server enforces everything.** Admin role, sticker limit, theme list, past-event reminder rule.
4. **One commit per step** with a clear message (see section 3). Never a single dump at the end.
5. **Understand every line.** After each phase, re-read the files you added. Shortlisted candidates make a live change in their own code.
6. **Keep a log of AI use.** Add a line to a notes file whenever AI helps (what and where). You need it for the README.

---

## 3. Git workflow

- Repo name suggestion: `project-evo`. Public or shared with the reviewer, as the email requests.
- Work on `main` or a short `dev` branch, whichever you prefer. Keep it simple.
- Commit messages use a short prefix:

| Prefix | Use |
|---|---|
| `chore:` | Setup, config, dependencies |
| `feat:` | A user-visible feature |
| `fix:` | A bug fix |
| `docs:` | README and planning docs |
| `style:` | UI polish with no logic change |

- Add a `.gitignore` before the first commit (`node_modules`, `.next`, `.env`). **Never commit `.env`.** Commit `.env.example` only.
- Put the five planning docs in a `docs/` folder and keep `README.md` at the root.

---

## 4. Phases

Each phase lists tasks, files, the commit message, and **how to verify** before moving on.

### Phase 0: Scaffold (about 20 min)

Tasks
- Create the app: `npx create-next-app@latest project-evo` (TypeScript, Tailwind, App Router, `src/` directory, ESLint).
- Install: `npm i @prisma/client zod jose bcryptjs framer-motion` and `npm i -D prisma tsx @types/bcryptjs`.
- Add `docker-compose.yml`, `.env.example`, `.env` (local, ignored).
- Create the folders from `techstack.md` section 8.
- Move planning docs to `docs/`.

Commit: `chore: scaffold Next.js app with Tailwind, Prisma deps and docker compose`

Verify
- `npm run dev` shows the default page.
- `docker compose up -d` starts Postgres with no errors.

### Phase 1: Database and seed (about 30 min)

Tasks
- Add `prisma/schema.prisma` from `backend-schema.md` section 7.
- Run `npx prisma migrate dev --name init`.
- Add `src/lib/db.ts`.
- Write `prisma/seed.ts` (admin and 15 events) and add the seed script to `package.json`.
- Fix the leftover `150000 / 100` price in the City Run seed entry. Use `1500`.

Commit: `feat: add database schema, migration and seed data`

Verify
- `npx prisma db seed` prints the success line.
- `npx prisma studio` shows 15 events (9 active upcoming, 3 inactive, 3 past) and the admin user.
- Running the seed twice does not duplicate the admin.

### Phase 2: Auth (about 40 min)

Files
- `src/lib/auth.ts`, `src/lib/api.ts`
- `src/app/api/auth/signup/route.ts`, `login/route.ts`, `logout/route.ts`
- Pages: `/login`, `/signup`
- Header component with Login, Sign up and Log out (reads the session)

Commit: `feat: add signup, login, logout with JWT and bcrypt`

Verify (curl)
```bash
# signup
curl -i -X POST localhost:3000/api/auth/signup -H "Content-Type: application/json" \
  -d '{"email":"test@x.com","password":"password123"}'

# duplicate signup, expect 409
curl -i -X POST localhost:3000/api/auth/signup -H "Content-Type: application/json" \
  -d '{"email":"test@x.com","password":"password123"}'

# wrong password, expect 401
curl -i -X POST localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"test@x.com","password":"wrong"}'
```
- Confirm the password column in Prisma Studio is a bcrypt hash (starts with `$2`).
- In the browser, log in, refresh, and confirm you stay logged in. Log out clears it.

### Phase 3: Admin (about 45 min)

Files
- `src/middleware.ts`, `src/app/admin/layout.tsx`
- `src/app/api/admin/events/route.ts` (GET, POST)
- `src/app/api/admin/events/[id]/active/route.ts` (PATCH)
- Pages: `/admin` (table and toggle), `/admin/events/new` (form)

Commit: `feat: add admin guards, event creation and active toggle`

Verify (this is a great thing to show in the recording)
```bash
# no token, expect 401
curl -i localhost:3000/api/admin/events

# user token, expect 403
curl -i localhost:3000/api/admin/events -H "Authorization: Bearer <USER_TOKEN>"

# admin token, expect 200
curl -i localhost:3000/api/admin/events -H "Authorization: Bearer <ADMIN_TOKEN>"
```
- Visit `/admin` while logged out and as a normal user. Both redirect to `/login`.
- Add an event in the form, then toggle it Inactive and Active. No delete button exists.

### Phase 4: Public events and filters (about 50 min)

Files
- `src/app/api/events/route.ts`, `src/app/api/cities/route.ts`
- `src/lib/format.ts` (₹ and date helpers)
- Components: `EventCard`, `EventFilters`, `Pagination`, skeletons, empty and error states
- Page: `/events` (and `/` redirect)

Commit: `feat: add events list with combined filters, search and pagination`

Verify
- Test every combination: category only, city only, search only, all three together (for example Music + Coimbatore + "night").
- Inactive and past events never appear. Order is nearest date first.
- Change a filter while on page 2 and confirm it jumps to page 1.
- Refresh and confirm filters and page come back from the URL.
- Check price formatting (₹1,50,000 style, "Free" for 0) and the date format ("Sat, 18 Oct, 6:30 PM").
- Test the empty state (a search with no matches) and the error state (stop the database and reload).
- Run `format.ts` on a few sample values, since `en-IN` may format the date slightly differently from the brief. Adjust until it matches.

### Phase 5: Favourites, onboarding and My Feed (about 30 min)

Files
- `src/app/api/me/categories/route.ts`, `src/app/api/feed/route.ts`
- Pages: `/onboarding`, `/feed`
- Post-login redirect logic (admin to `/admin`, no categories to `/onboarding`, else `/feed`)

Commit: `feat: add favourite categories, onboarding and My Feed`

Verify
- A new user lands on `/onboarding`, picks Music and Food, and `/feed` shows only those categories.
- A user with no favourites sees the "pick categories" prompt. A user whose categories have no events sees the friendly empty message.
- Changing favourites updates the feed. A logged-out visit to `/feed` redirects to `/login`.

### Phase 6: Event page and Remind me (about 30 min)

Files
- `src/app/api/events/[id]/route.ts`, `src/app/api/events/[id]/reminder/route.ts`
- `src/hooks/useReminder.ts`
- Page: `/events/[id]`
- Add `GET /api/cities` if not yet done, and the past-event 409 check (`backend-schema.md` section 15)

Commit: `feat: add event page and optimistic Remind me with rollback`

Verify
- Tap Remind me: it flips instantly, and stays after refresh.
- **Failure test:** open DevTools, set the network to Offline (or block the request), tap the button. It must flip back and show the error message.
- Inactive event id gives the "Event not found" page. Past events show no Remind me button, and the API returns 409 for them.
- Logged-out users see "Log in to set a reminder".

### Phase 7: Card designer (about 40 min)

Files
- `src/lib/card.ts`, `src/app/api/events/[id]/card/route.ts`
- `src/components/CardDesigner.tsx`, used on the event page

Commit: `feat: add event card designer with themes, stickers and saved design`

Verify
- Switching theme animates smoothly. Stickers pop in and out.
- You can add 3 stickers and no more (buttons disable). Removing one re-enables them.
- Refresh: the saved design returns. Log in as another user: they see their own design (or the default).
- Send a request with 4 stickers by curl and confirm a 400 from the server.
- Failure test: offline mode, make a change, and confirm it reverts with a message.

### Phase 8: Polish (about 40 min)

Tasks
- One colour palette, one font (for example Inter through `next/font`), consistent spacing scale.
- Check at 375 px and 1280 px wide: header, filters, card grid, admin table (scroll horizontally on mobile), event page.
- Loading, empty and error states on every data view (`app-flow.md` section 9).
- Accessibility basics: labels on inputs, alt text, visible focus, 44 px tap targets.
- Remove console logs and unused code. Run `npm run lint` and `npx tsc --noEmit`.
- Configure image domains in `next.config` if you use `next/image` (or use plain `img` tags).

Commit: `style: polish layout, responsive design and UI states`

Verify
- Walk through the full acceptance checklist in `prd.md` section 13.

### Phase 9: Submission (about 60 min)

1. **Clean clone test.** Clone the repo into a fresh folder, follow only the README steps, and time it. It must run in under 5 minutes.
2. **README** (outline in section 6).
3. **Screen recording** (script in section 7).
4. Final commit: `docs: add README, setup steps and AI usage note`.
5. Send the repo link, recording and README answers by reply to the HR email. Check that the repo is accessible to the reviewer.

---

## 5. Definition of done

- [ ] Everything in `prd.md` section 13 is ticked
- [ ] `npm run lint` and `npx tsc --noEmit` pass
- [ ] Clean clone runs in under 5 minutes
- [ ] The commit history shows regular commits across several days
- [ ] `.env` is not in the repo, and `.env.example` is
- [ ] README is complete, including the three answers and the AI note
- [ ] Recording is 3 to 4 minutes, covers phone and laptop, and explains 2 or 3 choices
- [ ] You can explain every file without looking at it

---

## 6. README outline

1. **Project Evo**: one paragraph on what it is.
2. **Tech stack**: a short list.
3. **Setup (under 5 minutes)**:
```bash
git clone <repo-url> && cd project-evo
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```
4. **Admin login**: `admin@events.test` / `Admin@123`.
5. **API list**: the short table from `backend-schema.md` section 12.
6. **Three answers** (3 to 4 lines each, in your own words):
   - **Database structure and why.** Cover the five tables, composite keys on the join tables, integer rupees, UTC time, and `isActive` instead of delete.
   - **Filter query and index.** Explain one `where` with AND for active, upcoming, category, city and search, plus pagination with `skip` and `take`. Index: `(isActive, startsAt)`, and a `pg_trgm` index on title for search.
   - **Passwords and admin protection.** bcrypt hashes with cost 12 and never plain text. JWT with a role. Middleware and layout guard the pages, and `requireAdmin()` guards every admin API on the server.
7. **Where AI tools were used**: be specific and honest, based on your log.
8. **What is left**: rate limiting, `pg_trgm` index, automated tests, event editing (out of scope by design).

Write the three answers yourself from your own understanding. They will be compared with your recording and the live call.

---

## 7. Screen recording script (3 to 4 minutes)

| Time | What to show |
|---|---|
| 0:00 to 0:20 | Intro: what Project Evo is, and the tech used |
| 0:20 to 1:00 | **Laptop:** admin login, add an event, toggle Inactive, confirm it disappears from `/events` |
| 1:00 to 1:50 | **Phone size** (DevTools device mode): filters together (Music + city + search), pagination, signup, pick categories, My Feed |
| 1:50 to 2:30 | Remind me (instant, refresh keeps it, offline failure reverts) and the card designer (themes, 3-sticker limit, refresh keeps it) |
| 2:30 to 3:30 | **Explain 2 or 3 code choices** in your own words |
| 3:30 to 3:50 | Wrap-up and what is left |

Good choices to explain:
1. Admin protection in two layers, with `requireAdmin()` on every admin API.
2. The single combined `where` for filters and the index behind it.
3. Optimistic Remind me with rollback.

Tips: close other tabs, record at 1080p, do one practice run first, and keep the terminal and Prisma Studio ready.

---

## 8. Risks and fallbacks

| Risk | Fallback |
|---|---|
| Docker is not available on a reviewer's machine | Note in the README that any Postgres works by changing `DATABASE_URL` (Neon or Supabase free tier) |
| Running behind schedule | Cut polish, not features. Never cut loading, empty and error states, or the server-side guards. |
| `en-IN` date format differs from the brief | Build the string from parts in `format.ts` and test it |
| External image URLs fail | Keep a fallback background in the event card, and use `picsum.photos` URLs in the seed |
| Prisma and Next.js version issues | Check `await params` usage and the Prisma client generation step (`npx prisma generate` in a postinstall script if needed) |
| Forgetting to commit regularly | Commit at the end of each phase, at least |

---

## 9. After submission

- Keep the project running locally and be ready for the live call.
- Practise three small changes: add a fourth theme, change the sticker limit from 3 to 4, change the page size from 9 to 12. All are one-line edits (`src/lib/card.ts`, the `limit` default in the events and feed handlers).
- Reread the three README answers until you can say them without looking.
