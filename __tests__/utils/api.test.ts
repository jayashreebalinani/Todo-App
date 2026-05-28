import { api } from "@/utils/api";

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("api.getTodos", () => {
  it("returns todos array on success", async () => {
    const todos = [{ id: 1, title: "Test", userId: 1, completed: false }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => todos,
    });

    const result = await api.getTodos();
    expect(result).toEqual(todos);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/todos"),
      expect.any(Object)
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(api.getTodos()).rejects.toThrow("API error 500");
  });
});

describe("api.createTodo", () => {
  it("sends POST with correct payload", async () => {
    const payload = { title: "New task", userId: 1, completed: false };
    const response = { id: 201, ...payload };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => response,
    });

    const result = await api.createTodo(payload);
    expect(result).toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/todos"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      })
    );
  });
});

describe("api.deleteTodo", () => {
  it("sends DELETE request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    await api.deleteTodo(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/todos/1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });
});
