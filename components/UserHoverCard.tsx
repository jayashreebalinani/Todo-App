"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { User, Todo } from "@/types";

interface Props {
  user: User;
  todos: Todo[];
  children: React.ReactNode;
}

export function UserHoverCard({ user, todos, children }: Props) {
  const [open, setOpen] = useState(false);
  const userTodos = todos.filter((t) => t.userId === user.id);
  const done = userTodos.filter((t) => t.completed).length;
  const pct = userTodos.length ? Math.round((done / userTodos.length) * 100) : 0;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-left pointer-events-none"
          >
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {user.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              @{user.username} · {user.email}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
              {done}/{userTodos.length} tasks completed
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full">
              <div className="w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-600 rotate-45 -mt-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
