# TaskFlow

A production-quality task management app built with Next.js 16, React 19, TypeScript (strict), and Tailwind CSS v4. Data is sourced from the [JSONPlaceholder](https://jsonplaceholder.typicode.com) REST API.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No additional configuration is required — the default API URL is bundled in `.env.local`.

---

## Environment Variables

| Variable               | Default                                    | Description                          |
| ---------------------- | ------------------------------------------ | ------------------------------------ |
| `NEXT_PUBLIC_API_URL`  | `https://jsonplaceholder.typicode.com`     | Base URL for the REST API            |

To point the app at a different backend, create or edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-api.example.com
```

---

## Scripts

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start Next.js development server         |
| `npm run build`      | Production build                         |
| `npm run start`      | Serve the production build               |
| `npm run lint`       | Run ESLint                               |
| `npm test`           | Run Jest test suite (single run)         |
| `npm run test:watch` | Run Jest in watch mode                   |

---

## Tech Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| Framework    | Next.js 16 — App Router                 |
| Language     | TypeScript 5 — strict mode              |
| UI           | React 19 — functional components, hooks |
| Styling      | Tailwind CSS v4                         |
| Animations   | Framer Motion                           |
| Drag & Drop  | @hello-pangea/dnd                       |
| Toasts       | Sonner                                  |
| Testing      | Jest + React Testing Library            |

---

## Project Structure

```
todo/
├── app/
│   ├── layout.tsx               # Root layout — mounts <Toaster>
│   ├── page.tsx                 # Entry point — composes all sections inside <TodoProvider>
│   └── globals.css              # Global styles and dark-mode base
│
├── components/
│   ├── FilterBar.tsx            # Search input, status tabs, multi-select user dropdown, date range
│   ├── TodoList.tsx             # Drag-and-drop list with load-more pagination
│   ├── TodoItem.tsx             # Single row — inline edit, toggle, delete
│   ├── TodoForm.tsx             # Collapsible create form with validation
│   ├── StatsBar.tsx             # Animated SVG progress ring and bar
│   ├── BulkActionBar.tsx        # Floating bar for multi-select bulk actions
│   ├── DeleteConfirmModal.tsx   # Accessible confirmation dialog
│   ├── UserHoverCard.tsx        # Per-user stats tooltip triggered on hover
│   ├── SkeletonLoader.tsx       # Animated placeholder during initial fetch
│   └── ThemeToggle.tsx          # Dark / light mode toggle (persists to localStorage)
│
├── context/
│   └── TodoContext.tsx          # Single source of truth — todos, users, filters, derived state, actions
│
├── types/
│   └── index.ts                 # Shared TypeScript interfaces (Todo, User, Filters, payloads)
│
├── utils/
│   └── api.ts                   # Typed fetch wrapper — all JSONPlaceholder calls live here
│
└── __tests__/
    ├── utils/api.test.ts
    └── components/
        ├── FilterBar.test.tsx
        └── TodoItem.test.tsx
```

---

## API Integration

### Overview

All network calls go through a single typed wrapper in [`utils/api.ts`](utils/api.ts). The wrapper accepts a generic `<T>` and throws on non-2xx responses, so callers never deal with raw `Response` objects.

```ts
async function request<T>(path: string, options?: RequestInit): Promise<T>
```

### Endpoints Used

| Method   | Path            | Purpose                         |
| -------- | --------------- | ------------------------------- |
| `GET`    | `/todos`        | Fetch all 200 todos on mount    |
| `GET`    | `/users`        | Fetch all 10 users on mount     |
| `POST`   | `/todos`        | Create a new todo               |
| `PUT`    | `/todos/:id`    | Update title or completion      |
| `DELETE` | `/todos/:id`    | Delete a todo                   |

### JSONPlaceholder Behaviour

JSONPlaceholder is a **read-only mock API**. Mutation responses follow these conventions:

- **POST** — returns a synthetic object with `id: 201`. The app replaces this with `Date.now()` locally to avoid ID collisions with the 200 seeded todos.
- **PUT / DELETE** — always returns `200 OK` but does not persist changes. The DELETE response has an empty body; the wrapper short-circuits `res.json()` in this case to avoid a parse error.

### Synthetic `createdAt` Dates

JSONPlaceholder does not provide creation timestamps. On load, the app assigns a deterministic `createdAt` date to each todo:

```ts
createdAt = today − (todo.id % 60) days
```

This spreads the 200 todos across a 60-day window, giving meaningful data to the date-range filter without random values that would shift on every reload. Newly created todos receive `today` as their `createdAt`.

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

| Feature                                                  | Status |
| -------------------------------------------------------- | ------ |
| Dark / light mode (persisted to `localStorage`)          | ✅     |
| Framer Motion enter / exit / layout animations           | ✅     |
| Drag-and-drop reordering via @hello-pangea/dnd           | ✅     |
| Bulk select → mark complete or delete                    | ✅     |
| User hover cards with per-user completion stats          | ✅     |
| SVG progress ring + bar (animated completion percentage) | ✅     |
| Toast notifications for all mutations                    | ✅     |
| Responsive, mobile-first layout                         | ✅     |
| Memoised components (`React.memo`, `useMemo`, `useCallback`) | ✅ |
| TypeScript strict mode throughout                        | ✅     |
| Unit tests — Jest + React Testing Library                | ✅     |

---

## Design Decisions

### React Context instead of a dedicated state library

The app uses a single `TodoProvider` with `useState`, `useMemo`, and `useCallback` rather than Redux or Zustand. The state surface is small and co-located — one provider feeds every component. Derived values (`filteredTodos`, `stats`) are computed inside `useMemo` so downstream components only re-render when their inputs change. Adding a library would introduce abstraction without reducing complexity at this scale.

### Optimistic UI for mutations

Toggle and delete operations update local state _before_ the API call resolves. If the request fails the state is reverted and a toast surfaces the error. This keeps interactions feeling instant over variable-latency connections and avoids the "spinner on every click" antipattern.

### Multi-select user filter as an ID array

The filter state for users is `userIds: number[]` rather than a nullable scalar. An empty array means "no filter applied" (all users shown), and an array with values means "show only these users". This model composes naturally with the rest of the filter predicates in a single `.filter()` pass and requires no special-casing.

### Date filtering over synthetic dates

JSONPlaceholder carries no timestamps, so dates are generated deterministically from `id % 60`. A formula rather than randomness ensures the same todo always lands on the same date — the filter produces consistent results across reloads. The `dateFrom` / `dateTo` values are ISO `YYYY-MM-DD` strings; plain string comparison is valid for this format, avoiding `Date` object overhead in the filter loop.

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
- **No authentication** — users are selected from a dropdown; a real app would derive the current user from a session.
- **No virtual scrolling** — the current list renders up to 200 DOM nodes. For significantly larger datasets, `react-window` or `react-virtual` would be appropriate.
- **No offline support** — a service worker with a cache-first strategy would make the app resilient to network loss.
