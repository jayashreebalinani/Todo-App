"use client";

import { useMemo, useCallback } from "react";
import { useTodoContext } from "@/context/TodoContext";
import { FilterStatus } from "@/types";

const STATUS_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

export function FilterBar() {
  const { filters, setFilters, users, todos } = useTodoContext();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFilters({ search: e.target.value }),
    [setFilters]
  );

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        label: `${u.name}`,
        value: u.id,
        count: todos.filter((t) => t.userId === u.id).length,
      })),
    [users, todos]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"
          />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={handleSearch}
          placeholder="Search tasks…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all"
        />
        {filters.search && (
          <button
            onClick={() => setFilters({ search: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilters({ status: opt.value })}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filters.status === opt.value
                ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* User filter */}
      <select
        value={filters.userId ?? ""}
        onChange={(e) =>
          setFilters({ userId: e.target.value ? Number(e.target.value) : null })
        }
        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all min-w-[160px]"
      >
        <option value="">All users</option>
        {userOptions.map((u) => (
          <option key={u.value} value={u.value}>
            {u.label} ({u.count})
          </option>
        ))}
      </select>
    </div>
  );
}
