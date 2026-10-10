# Project Evo: App Flow

This document describes how people move through the app, what each page does, and how data moves between the browser, the API and the database. It follows `prd.md` (what to build) and `techstack.md` (what it is built with).

Diagrams use Mermaid and render in GitHub and most Markdown previews.

---

## 1. Route map

```mermaid
flowchart TD
    Root["/"] --> Events["/events"]
    Events --> Detail["/events/[id]"]
    Events --> Login["/login"]
    Events --> Signup["/signup"]
    Signup --> Onboarding["/onboarding"]
    Login --> Feed["/feed"]
    Login --> Onboarding
    Login --> Admin["/admin"]
    Onboarding --> Feed
    Feed --> Detail
    Feed --> Onboarding
    Admin --> NewEvent["/admin/events/new"]
    NewEvent --> Admin
```

| Route | Access | Notes |
|---|---|---|
| `/` | Everyone | Redirects to `/events` |
| `/events` | Everyone | Filters and pagination, state kept in the URL |
| `/events/[id]` | Everyone | Remind me and card designer need login |
| `/signup`, `/login` | Logged-out | Logged-in users are redirected away |
| `/onboarding` | User | Pick favourite categories |
| `/feed` | User | My Feed |
| `/admin` | Admin | All events with Active toggle |
| `/admin/events/new` | Admin | Add event form |

---

## 2. Access control flow

Every request is checked on the server. The UI hides links too, but that is only for convenience.

```mermaid
flowchart TD
    Req["Request"] --> Kind{"Page or API?"}
    Kind -->|"Public page or API"| Open["Allow"]
    Kind -->|"/admin page"| MW["middleware.ts: valid cookie and role ADMIN?"]
    MW -->|No| ToLogin["Redirect to /login?next=/admin"]
    MW -->|Yes| Layout["admin/layout.tsx re-checks session"]
    Layout -->|No| ToLogin
    Layout -->|Yes| Allow1["Render page"]
    Kind -->|"User API"| ReqUser["requireUser()"]
    ReqUser -->|"No token"| E401["401 Please log in"]
    ReqUser -->|Valid| Allow2["Run handler"]
    Kind -->|"Admin API"| ReqAdmin["requireAdmin()"]
    ReqAdmin -->|"No token"| E401b["401"]
    ReqAdmin -->|"Role is USER"| E403["403 Admins only"]
    ReqAdmin -->|"Role is ADMIN"| Allow3["Run handler"]
```

| Who | Public pages | `/feed`, `/onboarding` | `/admin/*` | `/api/admin/*` |
|---|---|---|---|---|
| Visitor | Allowed | Redirect to `/login` | Redirect to `/login` | 401 |
| User | Allowed | Allowed | Redirect to `/login` | 403 |
| Admin | Allowed | Allowed | Allowed | Allowed |

The token is read from `Authorization: Bearer <token>` first (mobile and API clients), then from the `httpOnly` cookie (web).

---

## 3. Authentication flows

### 3.1 Signup

```mermaid
sequenceDiagram
    actor U as Visitor
    participant P as /signup page
    participant A as POST /api/auth/signup
    participant D as Database
    U->>P: Enter email and password
    P->>P: Check email format and 8+ characters
    P->>A: JSON email, password
    A->>A: Validate with Zod
    A->>D: Email already used?
    alt Email exists
        A-->>P: 409 Email already registered
        P-->>U: Show message on the form
    else New email
        A->>A: Hash password with bcrypt
        A->>D: Create user with role USER
        A-->>P: 201 token and user, set httpOnly cookie
        P-->>U: Redirect to /onboarding
    end
```

### 3.2 Login (users and admin)

```mermaid
sequenceDiagram
    actor U as Visitor or Admin
    participant P as /login page
    participant A as POST /api/auth/login
    participant D as Database
    U->>P: Enter email and password
    P->>A: JSON email, password
    A->>D: Find user by email
    A->>A: Compare password with stored hash
    alt Unknown email or wrong password
        A-->>P: 401 Invalid email or password
        P-->>U: Show same message for both cases
    else Valid
        A-->>P: 200 token and user, set httpOnly cookie
        alt Role is ADMIN
            P-->>U: Redirect to /admin
        else User has no favourite categories
            P-->>U: Redirect to /onboarding
        else
            P-->>U: Redirect to /feed
        end
    end
```

If the user arrived from a protected page, `?next=` sends them back there after login.

### 3.3 Session and logout
- A refresh keeps the user logged in because the cookie is sent with each request.
- **Log out** calls `POST /api/auth/logout`, which clears the cookie, then sends the user to `/events`.
- An expired or invalid token is treated as logged out. Protected pages redirect to `/login`.

---

## 4. Visitor and user journeys

### 4.1 Overall journey

```mermaid
flowchart TD
    Start(["Open app"]) --> Browse["Browse /events"]
    Browse --> Filter["Use filters and search"]
    Filter --> View["Open an event"]
    View --> WantMore{"Want to remind or design a card?"}
    WantMore -->|"Not logged in"| Auth["Sign up or log in"]
    Auth --> Pick["Pick favourite categories"]
    Pick --> MyFeed["My Feed"]
    WantMore -->|"Logged in"| Act["Remind me and Design your card"]
    MyFeed --> View
    Act --> Back["Back to events or feed"]
```

### 4.2 Events page (`/events`)

```mermaid
flowchart TD
    Load["Page loads, read filters from URL"] --> Fetch["GET /api/events with filters"]
    Fetch --> State{"Result"}
    State -->|"Waiting"| Loading["Show skeleton cards"]
    State -->|"Error"| Err["Show error and Try again button"]
    State -->|"0 items"| Empty["Show No events match and Clear filters"]
    State -->|"Items"| List["Show up to 9 cards, nearest date first"]
    List --> Change{"User changes something"}
    Change -->|"Category or city"| Reset["Update URL, go to page 1"]
    Change -->|"Types in search"| Debounce["Wait 300 ms, update URL, page 1"]
    Change -->|"Page button"| Page["Update URL page number"]
    Change -->|"Clears filters"| Clear["Remove all params, page 1"]
    Reset --> Fetch
    Debounce --> Fetch
    Page --> Fetch
    Clear --> Fetch
    List --> Open["Click a card"] --> Detail["/events/[id]"]
```

Rules:
- The server returns only events that are active and in the future, sorted by `startsAt` ascending.
- Category, city and search combine with AND.
- Filter state lives in the URL, so refresh, back button and sharing keep the same view.
- The city dropdown is filled from `GET /api/cities`.
- Prices show as ₹ with Indian grouping and 0 shows as "Free". Dates look like "Sat, 18 Oct, 6:30 PM".

### 4.3 Onboarding (`/onboarding`)

```mermaid
flowchart TD
    Enter["Land on /onboarding"] --> Auth{"Logged in?"}
    Auth -->|No| ToLogin["Redirect to /login"]
    Auth -->|Yes| Load["GET /api/me/categories, pre-select saved ones"]
    Load --> Choose["User toggles the 5 categories"]
    Choose --> Save["PUT /api/me/categories"]
    Save --> Result{"Saved?"}
    Result -->|Yes| ToFeed["Go to /feed"]
    Result -->|No| Err["Show error, keep selection, allow retry"]
```

Saving replaces the previous selection. Saving with none selected is allowed.

### 4.4 My Feed (`/feed`)

```mermaid
flowchart TD
    Enter["Land on /feed"] --> Auth{"Logged in?"}
    Auth -->|No| ToLogin["Redirect to /login"]
    Auth -->|Yes| Fetch["GET /api/feed"]
    Fetch --> State{"Result"}
    State -->|Waiting| Loading["Skeleton cards"]
    State -->|Error| Err["Error and Try again"]
    State -->|"needsCategories is true"| Pick["Pick your favourite categories, button to /onboarding"]
    State -->|"No matching events"| Empty["No upcoming events in your categories yet"]
    State -->|Items| List["Cards, nearest first, paginated"]
    List --> Edit["Edit categories link"] --> Onboarding["/onboarding"]
```

Only active, upcoming events from the user's favourite categories appear.

### 4.5 Event page (`/events/[id]`)

```mermaid
flowchart TD
    Load["Open event"] --> Fetch["GET /api/events/id"]
    Fetch --> State{"Result"}
    State -->|Waiting| Loading["Skeleton"]
    State -->|"404"| NF["Event not found, link back to /events"]
    State -->|"Error"| Err["Error and Try again"]
    State -->|"200"| Show["Show details, remind state and saved card"]
    Show --> Who{"Logged in?"}
    Who -->|No| Prompt["Log in to set a reminder and Log in to design your card"]
    Who -->|Yes| Upcoming{"Event is upcoming?"}
    Upcoming -->|Yes| Remind["Remind me button"]
    Upcoming -->|No| NoRemind["No remind button"]
    Who -->|Yes| Designer["Design your card section"]
```

Inactive or unknown events return 404, so the page shows "Event not found".

---

## 5. Remind me flow (optimistic update)

```mermaid
stateDiagram-v2
    [*] --> NotReminded
    NotReminded --> SavingOn: tap, button flips immediately
    SavingOn --> Reminded: PUT succeeds
    SavingOn --> NotReminded: PUT fails, revert and show error
    Reminded --> SavingOff: tap, button flips immediately
    SavingOff --> NotReminded: DELETE succeeds
    SavingOff --> Reminded: DELETE fails, revert and show error
```

Details:
1. The initial state comes from `reminded` in the event response, so a refresh keeps it.
2. A tap changes the button immediately, then calls `PUT /api/events/:id/reminder` (or `DELETE` to remove).
3. While a request is in flight, extra taps are ignored.
4. On failure the button goes back to the previous state and shows "Couldn't save your reminder. Please try again."
5. The server uses an upsert, so repeated requests are safe.

---

## 6. Card designer flow

```mermaid
stateDiagram-v2
    [*] --> Idle: load saved design or default
    Idle --> Editing: pick theme, add sticker, remove sticker
    Editing --> Editing: more changes (save timer restarts)
    Editing --> Saving: 400 ms with no changes
    Saving --> Saved: PUT succeeds
    Saving --> Reverted: PUT fails
    Saved --> Editing: more changes
    Reverted --> Editing: more changes
```

| Action | What happens |
|---|---|
| Pick a theme (Sunset, Ocean, Forest) | Card background animates to the new theme |
| Tap a sticker button | Sticker pops onto the card, counter updates (for example "2/3") |
| Tap at 3 stickers | Sticker buttons are disabled, and the server also rejects a fourth |
| Tap a sticker on the card | Sticker animates out and is removed |
| Stop changing for 400 ms | One `PUT /api/events/:id/card` saves theme and stickers together |
| Save fails | Card goes back to the last saved design and shows an error |
| Refresh | The saved design loads from the API |

The design is stored per user per event. Default design: Sunset theme, no stickers.

---

## 7. Admin flows

### 7.1 Admin home (`/admin`)

```mermaid
flowchart TD
    Enter["Open /admin"] --> Guard{"Admin?"}
    Guard -->|No| ToLogin["Redirect to /login"]
    Guard -->|Yes| Fetch["GET /api/admin/events"]
    Fetch --> State{"Result"}
    State -->|Waiting| Loading["Loading rows"]
    State -->|Error| Err["Error and Try again"]
    State -->|"0 events"| Empty["No events yet, Add event button"]
    State -->|Items| Table["All events: title, category, city, date, price, status, toggle"]
    Table --> Toggle["Toggle Active or Inactive"]
    Toggle --> Patch["PATCH /api/admin/events/id/active"]
    Patch --> Res{"Saved?"}
    Res -->|Yes| Update["Row status updates"]
    Res -->|No| Revert["Toggle reverts and error message shows"]
    Table --> Add["Add event button"] --> New["/admin/events/new"]
```

The admin list shows every event, including inactive and past ones. There is no delete.

### 7.2 Add event (`/admin/events/new`)

```mermaid
flowchart TD
    Form["Fill the form: title, category, city, date and time, price, description, image URL"] --> Client["Client validation"]
    Client -->|Invalid| Inline["Show message next to the field"]
    Client -->|Valid| Post["POST /api/admin/events"]
    Post --> Server{"Server result"}
    Server -->|"400"| Fields["Show field errors from the response"]
    Server -->|"401 or 403"| ToLogin["Redirect to /login"]
    Server -->|"201"| Done["Go to /admin, new event shown as Active"]
    Server -->|"500 or network"| Err["Show error, keep the form filled"]
```

The server validates the same rules, so the form can never be bypassed.

---

## 8. Data flow for filtering

```mermaid
sequenceDiagram
    actor U as User
    participant P as /events page
    participant A as GET /api/events
    participant D as PostgreSQL
    U->>P: Pick Music, Coimbatore, type "night"
    P->>P: Put filters in the URL
    P->>A: category=MUSIC and city=Coimbatore and q=night and page=1
    A->>A: Validate query with Zod
    A->>D: findMany and count in one transaction
    Note over A,D: where isActive is true AND startsAt is in the future AND category AND city AND title or description contains q
    D-->>A: items and total
    A-->>P: items, page, limit, total, totalPages
    P-->>U: Matching cards and page controls
```

The main index is `Event(isActive, startsAt)`, which matches the base filter and sort. A `Event(category, city)` index supports the category and city filters.

---

## 9. Error and empty state map

| Place | Loading | Empty | Error |
|---|---|---|---|
| `/events` | Skeleton cards | "No events match your filters" and Clear filters | Message and Try again |
| `/feed` | Skeleton cards | Pick categories prompt, or "No upcoming events in your categories yet" | Message and Try again |
| `/events/[id]` | Skeleton | "Event not found" page | Message and Try again |
| Remind me | Button flips instantly | Not applicable | Button reverts and shows a message |
| Card designer | "Saving..." | Default design (Sunset, no stickers) | Reverts to last saved and shows a message |
| `/admin` | Loading rows | "No events yet" and Add event | Message and Try again |
| Forms | Disabled submit with spinner | Not applicable | Field messages from the server |

---

## 10. API status codes by flow

| Situation | Status | Body |
|---|---|---|
| Invalid input (bad email, 4th sticker, short title) | 400 | `{ "error": "Invalid input", "details": { ... } }` |
| No token on a protected route | 401 | `{ "error": "Please log in" }` |
| Wrong email or password | 401 | `{ "error": "Invalid email or password" }` |
| User calls an admin route | 403 | `{ "error": "Admins only" }` |
| Event not found, inactive, or unknown id | 404 | `{ "error": "Event not found" }` |
| Email already registered | 409 | `{ "error": "Email already registered" }` |
| Reminder on a past event | 409 | `{ "error": "Event has already started" }` |
| Unexpected server error | 500 | `{ "error": "Something went wrong" }` |

---

## 11. Screen-by-screen checklist

| Screen | Must show |
|---|---|
| Header | Product name, Events, My Feed (logged in), Admin (admin only), Login and Sign up or Log out |
| Event card | Image, title, category, city, friendly date, Indian-format price |
| Filters bar | Category select, city select, search box, Clear filters |
| Pagination | Previous, next, "Page X of Y" |
| Event page | Full details, Remind me, Design your card |
| Admin table | Title, category, city, date, price, status, toggle |

---

## 12. Known gap to fix in code

`prd.md` says reminders are only allowed on upcoming events, and the flows above use a 409 for that case. The reminder `PUT` handler written earlier does not check this yet. Add a check that returns 409 when `startsAt` is in the past, and add `GET /api/cities` for the city filter.
