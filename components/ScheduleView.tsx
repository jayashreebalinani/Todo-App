"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodoContext } from "@/context/TodoContext";
import { TodoItem } from "./TodoItem";
import { Todo } from "@/types";

type Bucket = "overdue" | "today" | "tomorrow" | "thisWeek" | "later" | "noDate";
type QuickFilter = "all" | "today" | "tomorrow" | "this_week";

const BUCKETS: {
  key: Bucket;
  label: string;
  emptyLabel: string;
  accent: string;
}[] = [
  { key: "overdue",  label: "Overdue",    emptyLabel: "No overdue tasks",           accent: "red"    },
  { key: "today",    label: "Today",      emptyLabel: "Nothing due today",          accent: "violet" },
  { key: "tomorrow", label: "Tomorrow",   emptyLabel: "Nothing due tomorrow",       accent: "indigo" },
  { key: "thisWeek", label: "This Week",  emptyLabel: "Nothing else due this week", accent: "blue"   },
  { key: "later",    label: "Later",      emptyLabel: "Nothing scheduled later",    accent: "gray"   },
  { key: "noDate",   label: "No Date",    emptyLabel: "All tasks have due dates",   accent: "gray"   },
];

const QUICK_FILTERS: { key: QuickFilter; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "today",     label: "Today"     },
  { key: "tomorrow",  label: "Tomorrow"  },
  { key: "this_week", label: "This Week" },
];

const ACCENT_CLASSES: Record<string, string> = {
  red:    "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  violet: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700",
  indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700",
  blue:   "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
  gray:   "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
};

function getDateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function getBucket(
  dueDate: string | null | undefined,
  today: string,
  tomorrow: string,
  weekEnd: string
): Bucket {
  if (!dueDate) return "noDate";
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  if (dueDate === tomorrow) return "tomorrow";
  if (dueDate <= weekEnd) return "thisWeek";
  return "later";
}

function ScheduleBucket({
  bucket,
  todos,
}: {
  bucket: (typeof BUCKETS)[0];
  todos: Todo[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            ACCENT_CLASSES[bucket.accent]
          }`}
        >
          {bucket.label}
          <span className="tabular-nums">{todos.length}</span>
        </div>
        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            collapsed ? "-rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {todos.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-3 px-1 italic">
                {bucket.emptyLabel}
              </p>
            ) : (
              <div className="space-y-2 pb-2">
                {todos.map((todo, index) => (
                  <TodoItem key={todo.id} todo={todo} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ScheduleView() {
  const { filteredTodos } = useTodoContext();
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  const today    = getDateStr(0);
  const tomorrow = getDateStr(1);
  const weekEnd  = getDateStr(6);

  const grouped = useMemo(() => {
    const map: Record<Bucket, Todo[]> = {
      overdue: [], today: [], tomorrow: [], thisWeek: [], later: [], noDate: [],
    };

    let source = filteredTodos;
    if (quickFilter === "today")
      source = filteredTodos.filter((t) => t.dueDate === today);
    else if (quickFilter === "tomorrow")
      source = filteredTodos.filter((t) => t.dueDate === tomorrow);
    else if (quickFilter === "this_week")
      source = filteredTodos.filter(
        (t) => t.dueDate && t.dueDate >= today && t.dueDate <= weekEnd
      );

    source.forEach((todo) => {
      map[getBucket(todo.dueDate, today, tomorrow, weekEnd)].push(todo);
    });
    return map;
  }, [filteredTodos, quickFilter, today, tomorrow, weekEnd]);

  const bucketsToShow =
    quickFilter === "all"
      ? BUCKETS
      : BUCKETS.filter((b) => {
          if (quickFilter === "today")     return b.key === "today";
          if (quickFilter === "tomorrow")  return b.key === "tomorrow";
          if (quickFilter === "this_week") return ["today", "tomorrow", "thisWeek"].includes(b.key);
          return true;
        });

  const totalShown = Object.values(grouped).flat().length;

  return (
    <div className="space-y-6">
      {/* Quick filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {QUICK_FILTERS.map((qf) => (
          <button
            key={qf.key}
            onClick={() => setQuickFilter(qf.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              quickFilter === qf.key
                ? "bg-violet-600 text-white shadow-sm shadow-violet-500/25"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {qf.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">
          {totalShown} task{totalShown !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grouped buckets */}
      {bucketsToShow.map((bucket) => (
        <ScheduleBucket
          key={bucket.key}
          bucket={bucket}
          todos={grouped[bucket.key]}
        />
      ))}

      {totalShown === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5 rotate-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-700 dark:text-gray-200 text-xl mb-2">
            No tasks found
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">
            Try adjusting your filters or create a new task to get started.
          </p>
        </motion.div>
      )}
    </div>
  );
}
