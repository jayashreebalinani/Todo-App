# TaskFlow

A production-quality task management app built with Next.js 16, React 19, TypeScript (strict), and Tailwind CSS v4. Data is sourced from the [JSONPlaceholder](https://jsonplaceholder.typicode.com) REST API, proxied through local Next.js route handlers so every device on the network only needs to reach the dev machine.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No additional configuration is required.

> **Troubleshooting:** If you run into errors starting the app, try updating your Node.js and npm versions to match the project requirements, then re-run `npm install` before `npm run dev`.

## Environment Variables

| Variable              | Default | Description                                                  |
| --------------------- | ------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | `/api`  | Base URL for the REST API. Defaults to the local proxy layer |

To point the app at a different backend, create or edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-api.example.com
```

---

## Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start Next.js development server |
| `npm run build`      | Production build                 |
| `npm run start`      | Serve the production build       |
| `npm run lint`       | Run ESLint                       |
| `npm test`           | Run Jest test suite (single run) |
| `npm run test:watch` | Run Jest in watch mode           |

---

## Tech Stack

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Framework   | Next.js 16 — App Router                 |
| Language    | TypeScript 5 — strict mode              |
| UI          | React 19 — functional components, hooks |
| Styling     | Tailwind CSS v4                         |
| Animations  | Framer Motion                           |
| Drag & Drop | @hello-pangea/dnd                       |
| Toasts      | Sonner                                  |
| Testing     | Jest + React Testing Library            |

---

## Project Structure

```
todo/
├── app/
│   ├── api/
│   │   ├── todos/
│   │   │   ├── route.ts          # GET /api/todos, POST /api/todos
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE /api/todos/:id
│   │   └── users/
│   │       └── route.ts          # GET /api/users
│   ├── layout.tsx                # Root layout — mounts <Toaster>
│   ├── page.tsx                  # Entry point — composes all sections inside <TodoProvider>
│   └── globals.css               # Global styles and dark-mode base
│
├── components/
│   ├── FilterBar.tsx             # Search input, status tabs, multi-select user dropdown, date range
│   ├── ScheduleView.tsx          # Schedule view — todos grouped by due date bucket with quick filters
│   ├── TodoList.tsx              # Drag-and-drop list with load-more pagination
│   ├── TodoItem.tsx              # Single row — inline edit, toggle, delete, due date badge
│   ├── TodoForm.tsx              # Collapsible create form with validation
│   ├── StatsBar.tsx              # Animated SVG progress ring and bar
│   ├── BulkActionBar.tsx         # Floating bar for multi-select bulk actions
│   ├── DeleteConfirmModal.tsx    # Accessible confirmation dialog
│   ├── UserHoverCard.tsx         # Per-user stats tooltip triggered on hover
│   ├── SkeletonLoader.tsx        # Animated placeholder during initial fetch
│   └── ThemeToggle.tsx           # Dark / light mode toggle (persists to localStorage)
│
├── context/
│   └── TodoContext.tsx           # Single source of truth — todos, users, filters, derived state, actions
│
├── hooks/                        # Custom hooks (reserved for future extraction)
│
├── types/
│   └── index.ts                  # Shared TypeScript interfaces (Todo, User, Filters, payloads)
│
├── utils/
│   └── api.ts                    # Typed fetch wrapper — all calls go through /api proxy routes
│
└── __tests__/
    ├── utils/api.test.ts
    └── components/
        ├── FilterBar.test.tsx
        └── TodoItem.test.tsx
```

---

## API Integration

### Architecture

All browser network calls go through a single typed wrapper in [`utils/api.ts`](utils/api.ts) using `/api` as the base URL. Each request hits a Next.js Route Handler in `app/api/`, which forwards it to `https://jsonplaceholder.typicode.com` server-to-server.

```
Mobile browser  →  http://192.168.x.x:3000/api/todos  →  https://jsonplaceholder.typicode.com/todos
```

This means any device on the local network can use the app without needing its own internet path to the upstream API. It also means timeouts and errors from the external service surface as proper error responses rather than hanging requests.

The typed wrapper shape:

```ts
async function request<T>(path: string, options?: RequestInit): Promise<T>;
```

### Route Handlers (Proxy Layer)

| File                          | Methods          | Upstream path |
| ----------------------------- | ---------------- | ------------- |
| `app/api/todos/route.ts`      | GET, POST        | `/todos`      |
| `app/api/todos/[id]/route.ts` | GET, PUT, DELETE | `/todos/:id`  |
| `app/api/users/route.ts`      | GET              | `/users`      |

### JSONPlaceholder Behaviour

JSONPlaceholder is a **read-only mock API**. Mutation responses follow these conventions:

- **POST** — returns a synthetic object with `id: 201`. The app replaces this with `Date.now()` locally to avoid ID collisions with the 200 seeded todos.
- **PUT / DELETE** — always returns `200 OK` but does not persist changes. The DELETE response has an empty body; the wrapper short-circuits `res.json()` in this case to avoid a parse error.

### Synthetic Client-Side Dates

JSONPlaceholder carries no timestamps. Two local-only fields are generated deterministically on the client after the initial fetch:

**`createdAt`** — spread across the past 60 days:

```ts
createdAt = today − (todo.id % 60) days
```

**`dueDate`** — spread across past and future buckets using `todo.id % 7`:

```
index 0 → null (no due date)
index 1 → −2 days (overdue)
index 2 → 0 days (today)
index 3 → 0 days (today)
index 4 → +1 day  (tomorrow)
index 5 → +3 days (this week)
index 6 → +10 days (later)
```

Both formulas are deterministic so the same todo always lands on the same date across reloads, giving the filters consistent results without randomness.

---

## Features

### Core

| Feature                                            | Status |
| -------------------------------------------------- | ------ |
| Fetch and display 200 todos                        | ✅     |
| Display ID, title, status, user, and creation date | ✅     |
| Load-more pagination (15 per page)                 | ✅     |
| Skeleton loaders during initial fetch              | ✅     |
| Error state with user-friendly message             | ✅     |
| Create todo with title validation and user picker  | ✅     |
| Toggle completion with optimistic update           | ✅     |
| Inline title editing on double-click               | ✅     |
| Delete with confirmation modal                     | ✅     |
| Search todos by title                              | ✅     |
| Filter by status — All / Pending / Completed       | ✅     |
| Multi-select user filter (checkbox dropdown)       | ✅     |
| Date range filter — from / to                      | ✅     |

### Enhancements

| Feature                                                                         | Status |
| ------------------------------------------------------------------------------- | ------ |
| Dark / light mode (persisted to `localStorage`)                                 | ✅     |
| Framer Motion enter / exit / layout animations                                  | ✅     |
| Drag-and-drop reordering via @hello-pangea/dnd                                  | ✅     |
| Bulk select → mark complete or delete                                           | ✅     |
| User hover cards with per-user completion stats                                 | ✅     |
| SVG progress ring + bar (animated completion percentage)                        | ✅     |
| Toast notifications for all mutations                                           | ✅     |
| Responsive, mobile-first layout                                                 | ✅     |
| API proxy layer — works on any LAN device without internet                      | ✅     |
| Schedule view — todos grouped by Overdue / Today / Tomorrow / This Week / Later | ✅     |
| Due date badges on todo items (colour-coded: overdue / today / future)          | ✅     |
| Inline due date picker — click badge to reassign                                | ✅     |
| List / Schedule view toggle                                                     | ✅     |
| Memoised components (`React.memo`, `useMemo`, `useCallback`)                    | ✅     |
| TypeScript strict mode throughout                                               | ✅     |
| Unit tests — Jest + React Testing Library                                       | ✅     |

---

## Views

### List View (default)

Flat paginated list with drag-and-drop reordering. All filters from `FilterBar` apply. Load-more appends the next 15 items.

### Schedule View

Accessed via the **List / Schedule** toggle above the task list. Groups `filteredTodos` into six collapsible sections ordered by urgency:

| Section   | Condition                     | Accent |
| --------- | ----------------------------- | ------ |
| Overdue   | `dueDate < today`             | Red    |
| Today     | `dueDate === today`           | Violet |
| Tomorrow  | `dueDate === tomorrow`        | Indigo |
| This Week | `today < dueDate ≤ today + 6` | Blue   |
| Later     | `dueDate > today + 6`         | Gray   |
| No Date   | `dueDate` is null             | Gray   |

Quick-filter chips inside the view (All / Today / Tomorrow / This Week) narrow which buckets are shown without leaving the schedule layout. Each section is independently collapsible.

---

## Design Decisions

### Local API proxy instead of direct upstream calls

All API calls are proxied through Next.js Route Handlers rather than hitting `jsonplaceholder.typicode.com` from the browser. This means:

- **LAN access works** — a mobile device on the same network only needs to reach the dev machine; it doesn't need its own internet path to the upstream host.
- **No hanging requests** — server-to-server fetch errors surface as proper HTTP responses; the client never waits on a request that silently hangs.
- **One swap to go to production** — updating `NEXT_PUBLIC_API_URL` in `.env.local` reroutes all calls without touching component code.

### React Context instead of a dedicated state library

The app uses a single `TodoProvider` with `useState`, `useMemo`, and `useCallback` rather than Redux or Zustand. The state surface is small and co-located — one provider feeds every component. Derived values (`filteredTodos`, `stats`) are computed inside `useMemo` so downstream components only re-render when their inputs change. Adding a library would introduce abstraction without reducing complexity at this scale.

### Optimistic UI for mutations

Toggle and delete operations update local state _before_ the API call resolves. If the request fails the state is reverted and a toast surfaces the error. This keeps interactions feeling instant over variable-latency connections and avoids the "spinner on every click" antipattern.

### Multi-select user filter as an ID array

The filter state for users is `userIds: number[]` rather than a nullable scalar. An empty array means "no filter applied" (all users shown), and an array with values means "show only these users". This model composes naturally with the rest of the filter predicates in a single `.filter()` pass and requires no special-casing.

### Date filtering over synthetic dates

JSONPlaceholder carries no timestamps, so both `createdAt` and `dueDate` are generated deterministically from the todo's `id`. A formula rather than randomness ensures the same todo always lands on the same date — the filter produces consistent results across reloads. Date values are ISO `YYYY-MM-DD` strings; plain string comparison is valid for this format, avoiding `Date` object overhead in the filter loop.

### Load-more pagination over virtual scrolling

"Load more" gives users explicit control over how much content is in the DOM and avoids layout instability during scroll. 200 items is well within the threshold where DOM count matters; virtual scrolling would add complexity with no perceptible benefit at this scale.

### @hello-pangea/dnd for drag and drop

`react-beautiful-dnd` is unmaintained. `@hello-pangea/dnd` is its actively maintained community fork with an identical API, making it a drop-in replacement that receives security and compatibility updates.

---

## Testing

Tests live in [`__tests__/`](__tests__/) and use Jest with `jest-environment-jsdom` and React Testing Library.

```bash
# Single run
npm test

# Watch mode
npm run test:watch
```

Global `fetch` is mocked in each test file so no real network calls are made. The mock returns empty arrays by default; individual tests can override it with `jest.fn().mockResolvedValueOnce(...)` to exercise specific scenarios.

---

## Known Limitations

- **No persistence** — JSONPlaceholder is mock-only. Creates, updates, and deletes are simulated; a page refresh resets all changes.
- **Due dates are local-only** — `dueDate` is a client-side field; reassigning a due date via the inline picker does not persist across reloads.
- **No authentication** — users are selected from a dropdown; a real app would derive the current user from a session.
- **No virtual scrolling** — the current list renders up to 200 DOM nodes. For significantly larger datasets, `react-window` or `react-virtual` would be appropriate.
- **No offline support** — a service worker with a cache-first strategy would make the app resilient to network loss.
