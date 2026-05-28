"use client";

import { useState, useRef, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { useTodoContext } from "@/context/TodoContext";

import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Todo } from "@/types";
import { toast } from "sonner";

interface Props {
  todo: Todo;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  index: number;
}

export const TodoItem = memo(function TodoItem({ todo, dragHandleProps, index }: Props) {
  const { users, toggleTodo, updateTitle, deleteTodo, toggleSelect, selectedIds } =
    useTodoContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [isToggling, setIsToggling] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  const user = users.find((u) => u.id === todo.userId);
  const isSelected = selectedIds.has(todo.id);

  const handleToggle = useCallback(async () => {
    setIsToggling(true);
    try {
      await toggleTodo(todo.id);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsToggling(false);
    }
  }, [todo.id, toggleTodo]);

  const startEdit = useCallback(() => {
    setEditValue(todo.title);
    setIsEditing(true);
    setTimeout(() => editRef.current?.select(), 50);
  }, [todo.title]);

  const commitEdit = useCallback(async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === todo.title) {
      setIsEditing(false);
      return;
    }
    try {
      await updateTitle(todo.id, trimmed);
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    }
    setIsEditing(false);
  }, [editValue, todo.id, todo.title, updateTitle]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setIsEditing(false);
  };

  const handleDelete = useCallback(async () => {
    setShowDelete(false);
    try {
      await deleteTodo(todo.id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  }, [todo.id, deleteTodo]);

  return (
    <>
      <motion.div
        initial={todo._isNew ? { opacity: 0, y: -16, scale: 0.97 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.97 }}
        transition={{ duration: 0.2, delay: todo._isNew ? 0 : index * 0.02 }}
        className={`group flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
          isSelected
            ? "bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-600"
            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm"
        }`}
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="mt-0.5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 5a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zM9 11a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zM9 17a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </div>

        {/* Select checkbox */}
        <button
          onClick={() => toggleSelect(todo.id)}
          className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 transition-all ${
            isSelected
              ? "bg-violet-600 border-violet-600"
              : "border-gray-300 dark:border-gray-500 hover:border-violet-400 opacity-0 group-hover:opacity-100"
          }`}
          aria-label={isSelected ? "Deselect task" : "Select task"}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Completion checkbox */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
            todo.completed
              ? "bg-emerald-500 border-emerald-500"
              : "border-gray-300 dark:border-gray-500 hover:border-emerald-400"
          } ${isToggling ? "opacity-50 scale-90" : "hover:scale-110"}`}
          aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
        >
          {todo.completed && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={editRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="w-full text-sm font-medium bg-transparent border-b-2 border-violet-400 text-gray-900 dark:text-white focus:outline-none pb-0.5"
              autoFocus
            />
          ) : (
            <p
              onDoubleClick={startEdit}
              title="Double-click to edit"
              className={`text-sm font-medium leading-relaxed cursor-text ${
                todo.completed
                  ? "line-through text-gray-400 dark:text-gray-500"
                  : "text-gray-800 dark:text-gray-100"
              }`}
            >
              {todo.title}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 dark:text-gray-500">#{todo.id}</span>
            {user && (
              <span className="text-xs text-violet-500 dark:text-violet-400 font-medium">
                {user.name} @({user.username})
              </span>
            )}
            {todo.createdAt && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(todo.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                todo.completed
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
              }`}
            >
              {todo.completed ? "Done" : "Pending"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={startEdit}
            title="Edit title"
            className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDelete(true)}
            title="Delete task"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </motion.div>

      <DeleteConfirmModal
        open={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
});
