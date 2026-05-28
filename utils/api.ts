import { Todo, User, CreateTodoPayload, UpdateTodoPayload } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://jsonplaceholder.typicode.com";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  // DELETE returns empty body
  if (res.status === 200 && options?.method === "DELETE") return {} as T;
  return res.json();
}

export const api = {
  getTodos: () => request<Todo[]>("/todos"),
  getTodo: (id: number) => request<Todo>(`/todos/${id}`),
  createTodo: (payload: CreateTodoPayload) =>
    request<Todo>("/todos", { method: "POST", body: JSON.stringify(payload) }),
  updateTodo: (payload: UpdateTodoPayload) =>
    request<Todo>(`/todos/${payload.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteTodo: (id: number) =>
    request<{}>(`/todos/${id}`, { method: "DELETE" }),
  getUsers: () => request<User[]>("/users"),
  getUser: (id: number) => request<User>(`/users/${id}`),
};
