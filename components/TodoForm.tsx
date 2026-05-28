"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodoContext } from "@/context/TodoContext";
import { toast } from "sonner";

export function TodoForm() {
  const { users, createTodo, isCreating } = useTodoContext();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [userId, setUserId] = useState<number>(1);
  const [titleError, setTitleError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    if (!title.trim()) {
      setTitleError("Title cannot be empty");
      inputRef.current?.focus();
      return false;
    }
    if (title.trim().length < 3) {
      setTitleError("Title must be at least 3 characters");
      return false;
    }
    setTitleError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createTodo({ title: title.trim(), userId, completed: false });
      toast.success("Task created successfully!");
      setTitle("");
      setOpen(false);
    } catch {
      toast.error("Failed to create task");
    }
  };

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setOpen(!open);
          // Defer focus until after Framer Motion's enter animation starts; focusing
          // before the element is visible produces no visible caret in some browsers.
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow text-sm"
      >
        <span className="text-lg leading-none">+</span>
        New Task
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl"
          >
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-sm uppercase tracking-wider">
              Create New Task
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Task Title
                </label>
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (titleError) setTitleError("");
                  }}
                  placeholder="What needs to be done?"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    titleError
                      ? "border-red-400 focus:ring-red-400/30"
                      : "border-gray-200 dark:border-gray-600 focus:ring-violet-400/30 focus:border-violet-400"
                  }`}
                />
                <AnimatePresence>
                  {titleError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 text-xs text-red-500"
                    >
                      {titleError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Assign To
                </label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm disabled:opacity-60 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-shadow"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating…
                    </span>
                  ) : (
                    "Create Task"
                  )}
                </motion.button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
