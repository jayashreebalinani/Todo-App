# TaskFlow – Modern Todo Manager

A feature-rich, production-quality task management application built with Next.js 16, TypeScript (strict mode), React 19, and Tailwind CSS v4. Consumes the JSONPlaceholder REST API.

---

## Tech Stack

| Layer       | Technology                             |
| ----------- | -------------------------------------- |
| Framework   | Next.js 16 (App Router)                |
| Language    | TypeScript 5 (strict mode)             |
| UI          | React 19 functional components + hooks |
| Styling     | Tailwind CSS v4                        |
| Animations  | Framer Motion                          |
| Drag & Drop | @hello-pangea/dnd                      |
| Toasts      | Sonner                                 |
| Testing     | Jest + React Testing Library           |
| API         | JSONPlaceholder                        |

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm 9+

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd todo

# 2. Install dependencies
npm install

# 3. Configure environment (already done)
# .env.local contains: NEXT_PUBLIC_API_URL=https://jsonplaceholder.typicode.com

# 4. Start development server
npm run dev
# Visit http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run start
```

### Run Tests

```bash
npm test
# Watch mode
npm run test:watch
```

---

## Feature List

### Core CRUD

| Feature                                         | Status |
| ----------------------------------------------- | ------ |
| Fetch & display 200 todos from API              | ✅     |
| Show ID, title, completion status, user info    | ✅     |
| Pagination (load more, 15 per page)             | ✅     |
| Skeleton loading states                         | ✅     |
| Error states with friendly messages             | ✅     |
| Create todo (form with title + user assignment) | ✅     |
| Form validation (min length, required)          | ✅     |
| Toggle completion status (optimistic UI)        | ✅     |
| Inline title editing (double-click)             | ✅     |
| Delete with confirmation modal                  | ✅     |
| Search by title                                 | ✅     |
| Filter by status (all / pending / completed)    | ✅     |
| Filter by user                                  | ✅     |

### Bonus Features

| Feature                                                | Status |
| ------------------------------------------------------ | ------ |
| Dark / Light mode toggle (persisted to localStorage)   | ✅     |
| Framer Motion animations (list, enter, exit, layout)   | ✅     |
| Drag & drop reordering                                 | ✅     |
| Bulk select → complete or delete                       | ✅     |
| User hover cards with stats                            | ✅     |
| Progress ring + bar (completion %)                     | ✅     |
| Toast notifications (success & error)                  | ✅     |
| Responsive, mobile-first design                        | ✅     |
| Memoised components (React.memo, useMemo, useCallback) | ✅     |
| React Context state management (no Redux)              | ✅     |
| Unit tests (Jest + React Testing Library)              | ✅     |
| TypeScript strict mode                                 | ✅     |

---

## Project Structure

```
todo/
├── app/
│   ├── layout.tsx          # Root layout + Toaster
│   ├── page.tsx            # Main page (assembles all sections)
│   └── globals.css         # Global styles + dark mode
├── components/
│   ├── TodoList.tsx         # DnD-enabled list with pagination
│   ├── TodoItem.tsx         # Single todo row (edit, toggle, delete)
│   ├── TodoForm.tsx         # Collapsible create form with validation
│   ├── FilterBar.tsx        # Search + status tabs + user dropdown
│   ├── StatsBar.tsx         # Progress ring & bar visualisation
│   ├── BulkActionBar.tsx    # Floating bar for bulk operations
│   ├── DeleteConfirmModal.tsx # Accessible confirmation dialog
│   ├── UserHoverCard.tsx    # Tooltip with user stats on hover
│   ├── SkeletonLoader.tsx   # Animated skeleton placeholders
│   └── ThemeToggle.tsx      # Dark/light mode toggle
├── context/
│   └── TodoContext.tsx      # Global state (todos, users, filters, actions)
├── types/
│   └── index.ts             # Shared TypeScript interfaces
├── utils/
│   └── api.ts               # Typed fetch wrapper for JSONPlaceholder
└── __tests__/
    ├── utils/api.test.ts
    └── components/
        ├── FilterBar.test.tsx
        └── TodoItem.test.tsx
```

---

## Design Decisions

### State Management with React Context

Chose React Context + `useState` + `useCallback` over Redux or Zustand to keep the dependency footprint small and demonstrate idiomatic React patterns. All derived state (`filteredTodos`, `stats`) is computed with `useMemo` so re-renders are minimal.

### Optimistic UI

Toggle and delete operations update local state _before_ the API call completes, then revert on failure. This makes the app feel instant even over slow connections.

### Pagination over Infinite Scroll

"Load more" pagination gives users explicit control and avoids layout instability.

### Drag & Drop

`@hello-pangea/dnd` (the actively maintained fork of `react-beautiful-dnd`) provides accessible drag-and-drop reordering. Order is stored locally since JSONPlaceholder doesn't persist ordering.

### JSONPlaceholder Limitations

JSONPlaceholder is a mock API — creates, updates, and deletes are simulated. New todo IDs are replaced with `Date.now()` to avoid collisions with the 200 pre-existing items.

---

## Known Limitations & Future Improvements

- **No server-side persistence** — JSONPlaceholder is mock-only; a real backend would enable true persistence.
- **No virtual scrolling** — for >1000 simultaneously visible items, `react-window` would improve render performance.
- **No offline support** — a service worker / cache-first strategy would add resilience.
- **No auth** — users are assigned by dropdown; a real app would use authentication.
