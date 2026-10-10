# Project Evo: Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | Project Evo, "Community Events Board" |
| **Purpose** | FyerX hiring assignment (take-home) |
| **Author** | Vedansh Danot (Kalki) |
| **Status** | Draft v1, ready to build |
| **Time budget** | About 4 to 5 hours of work, 5-day deadline from receiving the email (received 10 Oct 2026) |
| **Companion doc** | `techstack.md` (technology choices and architecture) |

---

## 1. Summary

Project Evo is a small web app where an **admin** posts local events (a music night, a workshop, a food fair) and **visitors** browse them. Visitors can filter and search events, pick favourite categories, see a personal feed, set reminders, and design a small shareable card for each event.

The app exposes its own **JSON API**. The web pages use only that API, so a mobile app can use the same endpoints later.

---

## 2. Goals and non-goals

### 2.1 Goals
1. Deliver every required feature in the brief (sections 5 to 7), correctly and with clean code.
2. Enforce all rules **on the server**: admin protection, filters, and card limits.
3. Look polished and consistent on phone and laptop.
4. Handle loading, empty and error states everywhere.
5. Be runnable by a reviewer in under 5 minutes.
6. Be fully explainable line by line, because shortlisted candidates make a live code change.

### 2.2 Non-goals
Anything not listed in this document. See section 10 for the explicit list. The brief states that extra features earn no extra marks.

---

## 3. Users

| User | Description | Can do |
|---|---|---|
| **Visitor** (not logged in) | Anyone with the link | Browse events, filter, search, view an event. Sign up or log in. |
| **User** (logged in) | Registered visitor, role `USER` | Everything a visitor can, plus favourite categories, My Feed, reminders, card designer. |
| **Admin** | One seeded account, role `ADMIN` | Log in, view all events, add an event, activate or deactivate an event. |

---

## 4. Scope of the experience

### 4.1 Pages

| Route | Who | Purpose |
|---|---|---|
| `/` | Everyone | Redirects to `/events` |
| `/events` | Everyone | Browse, filter, search, paginate |
| `/events/[id]` | Everyone (some parts need login) | Event details, Remind me, Design your card |
| `/signup` | Visitor | Create an account |
| `/login` | Visitor, user, admin | Log in (admins go to `/admin`) |
| `/onboarding` | User | Pick favourite categories |
| `/feed` | User | My Feed |
| `/admin` | Admin | List all events, toggle Active or Inactive |
| `/admin/events/new` | Admin | Add an event |

The shared header has the product name, links (Events, My Feed, Admin where allowed), and Login/Sign up or Log out.

### 4.2 Core categories
`Music`, `Workshop`, `Food`, `Sports`, `Kids` (fixed list of five).

---

## 5. Functional requirements: Admin

### A1. Admin login
- One hard-coded admin account is created by the seed script.
- Admin logs in on the same `/login` page as users. The server returns a JWT with `role = ADMIN`.
- **Acceptance:** a correct admin login lands on `/admin`. A wrong password shows "Invalid email or password".

### A2. Server-side protection
- `/admin/*` pages are blocked on the server for anyone who is not an admin (redirect to `/login`).
- `/api/admin/*` endpoints return **401** with no token and **403** for a non-admin user.
- Hiding buttons in the UI is not protection and does not count.
- **Acceptance:** calling an admin API with no token gives 401, with a normal user's token gives 403, with the admin token gives 200.

### A3. Add an event
Fields (all required):

| Field | Rule |
|---|---|
| Title | 3 to 120 characters |
| Category | One of Music, Workshop, Food, Sports, Kids |
| City | 2 to 60 characters |
| Date and time | Valid date and time (entered in IST) |
| Price | Whole rupees, 0 or more. 0 means "Free" |
| Description | 10 to 2000 characters |
| Image URL | Valid URL |

- New events are **Active** by default.
- Invalid input shows a message next to the field. The server validates too.
- **Acceptance:** after saving, the event appears in the admin list, and in `/events` if it is active and upcoming.

### A4. Active or Inactive
- The admin list shows every event (active, inactive, past) with its status and a toggle.
- Toggling updates the event through the API. **Events are never deleted.**
- Inactive events are hidden from all visitor views and from the visitor event API.
- **Acceptance:** setting an event Inactive removes it from `/events` and `/feed` immediately on the next load. Setting it Active brings it back (if upcoming).

---

## 6. Functional requirements: Visitors and users

### V1. Events page
- Shows only events that are **Active** and **upcoming** (start time in the future).
- Sorted by **nearest date first**.
- Each card shows image, title, category, city, date, and price.
- **Acceptance:** inactive and past events never appear.

### V2. Filters, search and pagination
- Filters: **category**, **city**, and **text search** (matches title and description, case-insensitive).
- All three work **together** (AND). Example: Music + Coimbatore + "night" shows only events matching all three.
- City options come from the cities that have active, upcoming events.
- Pagination: 9 events per page, with previous, next and page info ("Page 2 of 4").
- Filter state lives in the URL (for example `/events?category=MUSIC&city=Coimbatore&q=night&page=1`), so refresh and sharing keep the same view.
- Changing any filter resets to page 1. Search input waits about 300 ms before querying.
- A "Clear filters" action resets everything.
- **Acceptance:** each filter on its own works, any combination works, and pages never overlap or skip events.

### V3. Signup and login
- Email and password. Password must be at least 8 characters.
- Email is unique (case-insensitive). A duplicate shows "Email already registered".
- Login returns a **JWT** in the JSON response. The web app also receives it as an `httpOnly` cookie.
- Passwords are stored only as bcrypt hashes.
- After signup, the user goes to `/onboarding`. After login, the user goes to `/feed`, or to `/onboarding` if no categories are chosen yet.
- **Acceptance:** after login, refreshing the page keeps the user logged in. Log out ends the session.

### V4. Favourite categories
- After login the user picks one or more favourite categories (for example, Music and Food).
- The user can change them later from the My Feed page.
- The choice is saved through the API and persists after refresh.
- **Acceptance:** saving replaces the previous selection. Saving with none selected is allowed, and My Feed then shows a prompt to pick categories.

### V5. My Feed
- Shows only **active, upcoming** events from the user's favourite categories, nearest date first, paginated.
- Empty states:
  - No categories chosen: "Pick your favourite categories to see events here" with a button to `/onboarding`.
  - Categories chosen but no matching events: a friendly "No upcoming events in your categories yet" message.
- Requires login. Visitors are redirected to `/login`.

### V6. "Remind me"
- Each event page (and optionally each card) has a **Remind me** button, for logged-in users, on upcoming events.
- Behaviour:
  1. Tapping updates the button **immediately** (optimistic).
  2. The reminder is saved through the API and **stays after refresh**.
  3. If saving fails, the button **reverts** and an error message appears.
  4. Tapping again removes the reminder.
- Logged-out visitors see "Log in to set a reminder".
- A reminder is a saved flag. This version does not send notifications (see section 10).
- **Acceptance:** with the network blocked or the API failing, the button flips back and shows "Couldn't save your reminder. Please try again."

### V7. Event page
- Shows the full event details: image, title, category, city, date, price, description.
- Inactive or unknown events show a friendly "Event not found" page.
- Contains the Remind me button and the Event Card Designer.

---

## 7. Functional requirements: Event Card Designer

Located in a **"Design your card"** section on the event page.

| Requirement | Detail |
|---|---|
| Themes | 3 background themes (Sunset, Ocean, Forest). One is always selected. Default: Sunset. |
| Stickers | 5 stickers (emoji): 🎵 🍕 🎉 ⭐ 🔥 |
| Add | Tapping a sticker adds it to the card. |
| Limit | Maximum **3** stickers. At 3, the sticker buttons are disabled and the counter shows "3/3". The server also rejects more than 3. |
| Remove | Tapping a sticker on the card removes it. |
| Live preview | The card updates instantly with a **smooth animation** (theme change and sticker add/remove). |
| Persistence | The design is saved **per user, per event**, and is still there after refresh. |
| Save feedback | Shows Saving, Saved, or an error. On failure the card reverts to the last saved design. |
| Access | Logged-in users only. Visitors see "Log in to design your card". |

---

## 8. Cross-cutting requirements

### 8.1 Own JSON API
- Pages call only our own endpoints for login, events, feed, favourites, reminders and card design.
- Responses are JSON. Errors use `{ "error": "message" }` with proper status codes (400, 401, 403, 404, 409, 500).
- Endpoint list is in section 11.

### 8.2 UI states
Every data-driven view has:
- **Loading:** skeleton or spinner.
- **Empty:** a friendly message with a next action, never a blank page.
- **Error:** a clear message with a "Try again" action.

### 8.3 Formatting
- **Prices** use Indian grouping with the rupee sign: ₹1,50,000. Price 0 shows "Free".
- **Dates** are friendly and in IST: "Sat, 18 Oct, 6:30 PM".

### 8.4 Design
- Polished on phone and laptop (mobile-first, tested at roughly 375 px and 1280 px wide).
- One colour scheme, one font family, consistent spacing.
- Tap targets are at least 44 px on mobile. Images have alt text. Buttons and inputs have labels and visible focus.
- Free libraries, fonts and icons only.

### 8.5 Security
- Passwords hashed with bcrypt. JWT signed with a secret from the environment.
- All inputs validated on the server.
- Same error for wrong email and wrong password.
- Admin checks on every admin API, not just the UI.

### 8.6 Performance
- Event queries are paginated and use database indexes (see `techstack.md`, section 5).
- Count and page query run together in one transaction.

---

## 9. Data requirements

### 9.1 Entities
`User`, `Event`, `UserCategory` (favourite categories), `Reminder`, `EventCard`. Full schema and keys are in `techstack.md`, section 4.

### 9.2 Seed data
The seed script creates:
- **1 admin:** `admin@events.test` / `Admin@123`
- **15 sample events:**

| Group | Count | Notes |
|---|---|---|
| Active and upcoming | 9 | Spread across all 5 categories and at least 4 cities |
| Inactive | 3 | Upcoming dates, but hidden from visitors |
| Past | 3 | Active, but dates are in the past, so hidden from lists |

- Cities used: Coimbatore, Bengaluru, Chennai, Mumbai.
- Prices include a free event and at least one above ₹1,000.
- Dates are generated relative to "now" so the upcoming and past split stays correct whenever the reviewer runs it.
- Re-running the seed resets events cleanly and does not duplicate the admin.

---

## 10. Out of scope

These are **not** being built, on purpose:

| Not building | Note |
|---|---|
| Express or any separate backend server | Next.js Route Handlers are the API. |
| Editing or deleting events | Brief says Active or Inactive only. |
| Sending reminders (email, SMS, push) | "Remind me" is a saved flag only. |
| Image upload | Admin pastes an image URL. |
| Password reset, email verification, social login | Not requested. |
| Admin user management, multiple admins, roles UI | One hard-coded admin. |
| Payments, ticketing, RSVPs, booking | Not requested. |
| Event detail comments, ratings, sharing, maps | Not requested. |
| Sharing or downloading the designed card | Only saving it per user per event. |
| Custom stickers, custom colours, more than 3 themes or 5 stickers | Fixed set. |
| Notifications, search suggestions, sorting options | Fixed sort, nearest date first. |
| Dark mode, translations | One theme, English. |
| Automated test suite | Manual testing and curl checks for the guards. Listed in "what is left". |
| Rate limiting, CAPTCHA, refresh tokens | Listed in "what is left". |
| Mobile app | Only the API is mobile-ready. |

Supporting items that **are** included because the features cannot work without them: a log out button, a cities lookup for the city filter, and the onboarding page.

---

## 11. API requirements

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | none | Create user, return JWT |
| POST | `/api/auth/login` | none | Return JWT |
| POST | `/api/auth/logout` | none | Clear cookie |
| GET | `/api/events?category&city&q&page&limit` | none | Active, upcoming, filtered, paginated |
| GET | `/api/cities` | none | Cities with active, upcoming events (for the city filter) |
| GET | `/api/events/:id` | optional | Event plus `reminded` and `card` if logged in |
| GET / PUT | `/api/me/categories` | user | Read or replace favourite categories |
| GET | `/api/feed?page&limit` | user | Feed from favourite categories |
| PUT / DELETE | `/api/events/:id/reminder` | user | Set or clear reminder |
| GET / PUT | `/api/events/:id/card` | user | Read or save card design |
| GET / POST | `/api/admin/events` | admin | List all, create |
| PATCH | `/api/admin/events/:id/active` | admin | Set Active or Inactive |

---

## 12. Deliverables (all four required)

1. **GitHub repository** with regular commits throughout the work, not one commit at the end.
2. **README** with:
   - Setup steps (runs in under 5 minutes)
   - Admin login details
   - Short API list
   - A note on what is left
   - Three short answers (3 to 4 lines each):
     1. Database structure and why it was designed this way
     2. How the filter query works and which index to add
     3. How passwords are stored and how admin pages and APIs are protected
   - A note on **where AI tools were used**
3. **Screen recording**, 3 to 4 minutes: the app on a phone-size screen and a laptop screen, then 2 or 3 code choices explained in the author's own words.
4. The three README answers above (counted as a separate required item by the brief).

---

## 13. Acceptance checklist

**Admin**
- [ ] Admin can log in and reach `/admin`
- [ ] Admin pages and APIs blocked on the server (401 and 403 verified)
- [ ] Admin can add an event with all 7 fields
- [ ] Admin can toggle Active or Inactive, and no delete exists

**Visitors**
- [ ] `/events` shows only active, upcoming events, nearest first
- [ ] Category, city and search filters work alone and together
- [ ] Pagination works and filter state survives refresh
- [ ] Signup and login work, login returns a JWT
- [ ] User can pick and change favourite categories
- [ ] My Feed shows only upcoming events from those categories
- [ ] Remind me is instant, persists, and reverts with a message on failure

**Card designer**
- [ ] 3 themes switch with animation
- [ ] 5 stickers, max 3, removable, enforced on the server
- [ ] Design persists per user per event after refresh

**Quality**
- [ ] Loading, empty and error states on every data view
- [ ] Prices in ₹ Indian format, dates like "Sat, 18 Oct, 6:30 PM"
- [ ] Polished on phone and laptop, consistent colours, spacing and fonts
- [ ] 15 sample events present (active, inactive, past, mixed categories and cities)
- [ ] Setup works in under 5 minutes from a clean clone

---

## 14. Assumptions and decisions

These are choices made where the brief is silent. Change any of them before building if they are wrong.

| # | Decision |
|---|---|
| 1 | Reminders are saved flags only. No notification is sent. |
| 2 | Reminders are only allowed on **upcoming** events. The Remind me button is hidden for past events, and the server rejects it. |
| 3 | Event times are entered and shown in IST (Asia/Kolkata) and stored in UTC. |
| 4 | Page size is 9 events. |
| 5 | City filter is a dropdown of cities that currently have active, upcoming events. |
| 6 | The card designer and Remind me require login. |
| 7 | Event pages are viewable for active events only. Inactive events show "Event not found". |
| 8 | Sticker set and theme names are fixed in one shared file used by both the UI and the API. |
| 9 | PostgreSQL runs through Docker Compose. A hosted Postgres works by changing `DATABASE_URL`. |

---

## 15. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Running out of time on polish | Weak visual quality | Build in order (API, events, feed, designer), polish last, keep scope tight |
| Reviewer cannot run the project quickly | Fails the 5-minute test | Docker Compose, `.env.example`, one-block setup in the README, test on a clean clone |
| Not able to explain AI-assisted code | Fails the live call | Read every file, practise small changes (add a theme, change the sticker limit) |
| Admin guard only in the UI or middleware | Security fail | Check the role in every admin API handler |
| Seed dates go stale | Empty events page | Generate dates relative to the current time |
| Optimistic UI bugs (stuck state) | Fails Remind me requirement | Single hook, rollback on failure, test with the network off |

---

## 16. Build order

1. Scaffold, Prisma schema, Docker Compose, seed
2. Auth library and login/signup APIs
3. Admin APIs and pages
4. Public events API, filters, `/events` page
5. Favourite categories, feed, onboarding
6. Event page, Remind me
7. Card designer
8. Polish, README, recording

Commit after each step.
