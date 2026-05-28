"use client";

import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { useTodoContext } from "@/context/TodoContext";
import { FilterStatus } from "@/types";

const STATUS_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

export function FilterBar() {
  const { filters, setFilters, users, todos } = useTodoContext();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFilters({ search: e.target.value }),
    [setFilters]
  );

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        label: `${u.name}`,
        sub: `@${u.username}`,
        value: u.id,
        count: todos.filter((t) => t.userId === u.id).length,
      })),
    [users, todos]
  );

  const toggleUser = useCallback(
    (id: number) => {
      const next = filters.userIds.includes(id)
        ? filters.userIds.filter((x) => x !== id)
        : [...filters.userIds, id];
      setFilters({ userIds: next });
    },
    [filters.userIds, setFilters]
  );

  const clearUsers = useCallback(
    () => setFilters({ userIds: [] }),
    [setFilters]
  );

  const userLabel =
    filters.userIds.length === 0
      ? "All users"
      : filters.userIds.length === 1
      ? userOptions.find((u) => u.value === filters.userIds[0])?.label ?? "1 user"
      : `${filters.userIds.length} users`;

  // mousedown (not click) fires before the button's own onClick, so the dropdown
  // closes before a re-open would trigger — preventing a flicker on the toggle button itself.
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const hasDateFilter = filters.dateFrom || filters.dateTo;

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: search + status + user multi-select */}
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

        {/* User multi-select */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setUserDropdownOpen((o) => !o)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all min-w-[160px] ${
              filters.userIds.length > 0
                ? "border-violet-400 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-violet-400/30`}
          >
            <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="flex-1 text-left truncate">{userLabel}</span>
            {filters.userIds.length > 0 && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); clearUsers(); }}
                className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-700 text-violet-700 dark:text-violet-200 flex items-center justify-center flex-shrink-0 hover:bg-violet-300 transition-colors"
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            )}
            <svg
              className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {userDropdownOpen && (
            <div className="absolute z-20 mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg min-w-[220px] max-h-64 overflow-y-auto py-1">
              {userOptions.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No users available</p>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Filter by user
                    </span>
                    {filters.userIds.length > 0 && (
                      <button
                        onClick={clearUsers}
                        className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {userOptions.map((u) => {
                    const checked = filters.userIds.includes(u.value);
                    return (
                      <label
                        key={u.value}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            checked
                              ? "bg-violet-600 border-violet-600"
                              : "border-gray-300 dark:border-gray-500"
                          }`}
                        >
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => toggleUser(u.value)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{u.label}</p>
                          <p className="text-xs text-gray-400 truncate">{u.sub}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{u.count}</span>
                      </label>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: date range */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex-shrink-0">
          Created
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="date"
            value={filters.dateFrom ?? ""}
            max={filters.dateTo ?? undefined}
            onChange={(e) => setFilters({ dateFrom: e.target.value || null })}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all"
          />
          <span className="text-xs text-gray-400 flex-shrink-0">to</span>
          <input
            type="date"
            value={filters.dateTo ?? ""}
            min={filters.dateFrom ?? undefined}
            onChange={(e) => setFilters({ dateTo: e.target.value || null })}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all"
          />
        </div>
        {hasDateFilter && (
          <button
            onClick={() => setFilters({ dateFrom: null, dateTo: null })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all flex-shrink-0"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}
