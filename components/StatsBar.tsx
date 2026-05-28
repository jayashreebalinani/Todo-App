"use client";

import { motion } from "framer-motion";
import { useTodoContext } from "@/context/TodoContext";

export function StatsBar() {
  const { stats } = useTodoContext();
  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* Progress ring + bar */}
      <div className="col-span-3 flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800">
        {/* Ring */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
            {/* strokeDasharray = full circumference (2πr); offset shrinks it to the filled arc. */}
            <motion.circle
              cx="28" cy="28" r="22"
              fill="none"
              stroke="url(#prog)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - pct / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="prog" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-violet-700 dark:text-violet-300">
            {pct}%
          </span>
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-0.5">
            Overall Progress
          </p>
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
            />
          </div>
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span><span className="font-bold text-gray-700 dark:text-gray-200">{stats.total}</span> total</span>
            <span className="text-emerald-600 dark:text-emerald-400"><span className="font-bold">{stats.completed}</span> done</span>
            <span className="text-amber-600 dark:text-amber-400"><span className="font-bold">{stats.pending}</span> pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
