"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Todo, User, Filters, CreateTodoPayload } from "@/types";
import { api } from "@/utils/api";

interface TodoContextType {
  todos: Todo[];
  users: User[];
  filters: Filters;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  selectedIds: Set<number>;
  setFilters: (filters: Partial<Filters>) => void;
  createTodo: (payload: CreateTodoPayload) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  updateTitle: (id: number, title: string) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  bulkDelete: () => Promise<void>;
  bulkComplete: () => Promise<void>;
  toggleSelect: (id: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  reorderTodos: (fromId: number, toId: number) => void;
  setDueDate: (id: number, dueDate: string | null) => void;
  filteredTodos: Todo[];
  stats: { total: number; completed: number; pending: number };
}

const TodoContext = createContext<TodoContextType | null>(null);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFiltersState] = useState<Filters>({
    search: "",
    status: "all",
    userIds: [],
    dateFrom: null,
    dateTo: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([api.getTodos(), api.getUsers()])
      .then(([todosData, usersData]) => {
        const now = Date.now();
        const MS_PER_DAY = 86_400_000;
        // Deterministic formula: same todo always lands on the same date across reloads,
        // so the date-range filter produces consistent results without randomness.
        // Due date offsets (in days from today): null=no date, -2=overdue, 0=today, 1=tomorrow, 3=this week, 10=later
        const DUE_OFFSETS: (number | null)[] = [null, -2, 0, 0, 1, 3, 10];
        const withDates = todosData.map((todo) => {
          const offset = DUE_OFFSETS[todo.id % 7];
          const dueDate =
            offset !== null
              ? new Date(now + offset * MS_PER_DAY).toISOString().slice(0, 10)
              : null;
          return {
            ...todo,
            createdAt: new Date(now - (todo.id % 60) * MS_PER_DAY)
              .toISOString()
              .slice(0, 10),
            dueDate,
          };
        });
        setTodos(withDates);
        setUsers(usersData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const setFilters = useCallback((partial: Partial<Filters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      if (
        filters.search &&
        !t.title.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.status === "completed" && !t.completed) return false;
      if (filters.status === "pending" && t.completed) return false;
      if (filters.userIds.length > 0 && !filters.userIds.includes(t.userId))
        return false;
      if (filters.dateFrom && t.createdAt && t.createdAt < filters.dateFrom)
        return false;
      if (filters.dateTo && t.createdAt && t.createdAt > filters.dateTo)
        return false;
      return true;
    });
  }, [todos, filters]);

  const stats = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length;
    return { total: todos.length, completed, pending: todos.length - completed };
  }, [todos]);

  const createTodo = useCallback(async (payload: CreateTodoPayload) => {
    setIsCreating(true);
    try {
      const created = await api.createTodo(payload);
      setTodos((prev) => [
        { ...created, _isNew: true, createdAt: new Date().toISOString().slice(0, 10) },
        ...prev,
      ]);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const toggleTodo = useCallback(async (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    try {
      const todo = todos.find((t) => t.id === id)!;
      await api.updateTodo({ ...todo, completed: !todo.completed });
    } catch {
      // Optimistic update: flip back to original state before surfacing the error.
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
      throw new Error("Failed to update todo");
    }
  }, [todos]);

  const updateTitle = useCallback(async (id: number, title: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t))
    );
    try {
      const todo = todos.find((t) => t.id === id)!;
      await api.updateTodo({ ...todo, title });
    } catch {
      throw new Error("Failed to update title");
    }
  }, [todos]);

  const deleteTodo = useCallback(async (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    try {
      await api.deleteTodo(id);
    } catch {
      throw new Error("Failed to delete todo");
    }
  }, []);

  const bulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    setTodos((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
    await Promise.allSettled(ids.map((id) => api.deleteTodo(id)));
  }, [selectedIds]);

  const bulkComplete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    setTodos((prev) =>
      prev.map((t) => (selectedIds.has(t.id) ? { ...t, completed: true } : t))
    );
    setSelectedIds(new Set());
    await Promise.allSettled(
      ids.map((id) => {
        const t = todos.find((x) => x.id === id)!;
        return api.updateTodo({ ...t, completed: true });
      })
    );
  }, [selectedIds, todos]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredTodos.map((t) => t.id)));
  }, [filteredTodos]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const setDueDate = useCallback((id: number, dueDate: string | null) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dueDate } : t))
    );
  }, []);

  const reorderTodos = useCallback((fromId: number, toId: number) => {
    setTodos((prev) => {
      const fromIndex = prev.findIndex((t) => t.id === fromId);
      const toIndex = prev.findIndex((t) => t.id === toId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  return (
    <TodoContext.Provider
      value={{
        todos,
        users,
        filters,
        isLoading,
        isCreating,
        error,
        selectedIds,
        setFilters,
        createTodo,
        toggleTodo,
        updateTitle,
        deleteTodo,
        bulkDelete,
        bulkComplete,
        toggleSelect,
        selectAll,
        clearSelection,
        reorderTodos,
        setDueDate,
        filteredTodos,
        stats,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodoContext must be used inside TodoProvider ");
  return ctx;
}
