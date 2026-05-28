"use client";

export function SkeletonLoader() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-pulse"
        >
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600" />
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600" />
          </div>
        </div>
      ))}
    </div>
  );
}
