"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTodoContext } from "@/context/TodoContext";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { toast } from "sonner";

export function BulkActionBar() {
  const { selectedIds, clearSelection, bulkDelete, bulkComplete, filteredTodos, selectAll } =
    useTodoContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const count = selectedIds.size;

  const handleBulkComplete = async () => {
    await bulkComplete();
    toast.success(`${count} tasks marked as complete`);
  };

  const handleBulkDelete = async () => {
    setShowDeleteConfirm(false);
    await bulkDelete();
    toast.success(`${count} tasks deleted`);
  };

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-900 dark:bg-gray-700 text-white shadow-2xl shadow-black/30"
          >
            <span className="text-sm font-semibold">
              {count} selected
            </span>
            <div className="w-px h-4 bg-gray-600" />
            <button
              onClick={() => selectAll()}
              className="text-xs text-gray-300 hover:text-white transition-colors"
            >
              Select all ({filteredTodos.length})
            </button>
            <button
              onClick={handleBulkComplete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button
              onClick={clearSelection}
              className="ml-1 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Clear selection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        open={showDeleteConfirm}
        count={count}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
