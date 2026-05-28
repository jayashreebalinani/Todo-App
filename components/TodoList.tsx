"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useTodoContext } from "@/context/TodoContext";
import { TodoItem } from "./TodoItem";
import { SkeletonLoader } from "./SkeletonLoader";

const PAGE_SIZE = 15;

export function TodoList() {
  const { filteredTodos, isLoading, error, reorderTodos } = useTodoContext();
  const [page, setPage] = useState(1);

  const paginated = useMemo(
    () => filteredTodos.slice(0, page * PAGE_SIZE),
    [filteredTodos, page]
  );

  const hasMore = paginated.length < filteredTodos.length;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderTodos(result.source.index, result.destination.index);
  };

  if (isLoading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">Something went wrong</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  if (filteredTodos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5 rotate-6">
          <span className="text-4xl">✓</span>
        </div>
        <h3 className="font-bold text-gray-700 dark:text-gray-200 text-xl mb-2">
          No tasks found
        </h3>
        <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">
          Try adjusting your filters or create a new task to get started.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {paginated.map((todo, index) => (
                  <Draggable
                    key={todo.id}
                    draggableId={String(todo.id)}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? "opacity-90 rotate-1 shadow-2xl" : ""}
                      >
                        <TodoItem
                          todo={todo}
                          dragHandleProps={provided.dragHandleProps}
                          index={index}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => setPage((p) => p + 1)}
          className="mt-4 w-full py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
        >
          Load more ({filteredTodos.length - paginated.length} remaining)
        </motion.button>
      )}

      <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-600">
        Showing {paginated.length} of {filteredTodos.length} tasks
      </p>
    </div>
  );
}
