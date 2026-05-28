export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
  // local-only fields
  _isNew?: boolean;
  _optimisticId?: number;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
  };
  address: {
    city: string;
    street: string;
  };
}

export type FilterStatus = "all" | "completed" | "pending";

export interface Filters {
  search: string;
  status: FilterStatus;
  userId: number | null;
}

export interface CreateTodoPayload {
  title: string;
  userId: number;
  completed: boolean;
}

export interface UpdateTodoPayload {
  id: number;
  title: string;
  userId: number;
  completed: boolean;
}
