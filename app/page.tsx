"use client";

import { TodoProvider } from "@/context/TodoContext";
import { TodoList } from "@/components/TodoList";
import { TodoForm } from "@/components/TodoForm";
import { FilterBar } from "@/components/FilterBar";
import { StatsBar } from "@/components/StatsBar";
import { BulkActionBar } from "@/components/BulkActionBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTodoContext } from "@/context/TodoContext";

function AppHeader() {
  const { filteredTodos, stats } = useTodoContext();
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
              TaskFlow
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight hidden sm:block">
              {filteredTodos.length} of {stats.total} tasks
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

function AppBody() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <StatsBar />
      <TodoForm />
      <FilterBar />
      <TodoList />
    </main>
  );
}

export default function Home() {
  return (
    <TodoProvider>
      <div className="min-h-screen">
        <AppHeader />
        <AppBody />
        <BulkActionBar />
      </div>
    </TodoProvider>
  );
}
