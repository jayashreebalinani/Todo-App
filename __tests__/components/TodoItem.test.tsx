import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TodoItem } from "@/components/TodoItem";
import { TodoProvider } from "@/context/TodoContext";
import { Todo } from "@/types";

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => [],
});

const mockTodo: Todo = {
  id: 1,
  userId: 1,
  title: "Test task title",
  completed: false,
};

function renderWithProvider(ui: React.ReactElement) {
  return render(<TodoProvider>{ui}</TodoProvider>);
}

describe("TodoItem", () => {
  it("renders todo title", () => {
    renderWithProvider(<TodoItem todo={mockTodo} index={0} dragHandleProps={null} />);
    expect(screen.getByText("Test task title")).toBeInTheDocument();
  });

  it("renders todo ID", () => {
    renderWithProvider(<TodoItem todo={mockTodo} index={0} dragHandleProps={null} />);
    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("shows 'Pending' badge for incomplete todos", () => {
    renderWithProvider(<TodoItem todo={mockTodo} index={0} dragHandleProps={null} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows 'Done' badge for completed todos", () => {
    const completed = { ...mockTodo, completed: true };
    renderWithProvider(<TodoItem todo={completed} index={0} dragHandleProps={null} />);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("enters edit mode on double-click of title", async () => {
    renderWithProvider(<TodoItem todo={mockTodo} index={0} dragHandleProps={null} />);
    const title = screen.getByText("Test task title");
    fireEvent.doubleClick(title);
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test task title")).toBeInTheDocument();
    });
  });

  it("shows delete confirmation modal when delete button clicked", async () => {
    renderWithProvider(<TodoItem todo={mockTodo} index={0} dragHandleProps={null} />);
    // Hover to reveal action buttons
    const container = screen.getByText("Test task title").closest(".group");
    if (container) fireEvent.mouseOver(container);
    const deleteBtn = screen.getByTitle("Delete task");
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(screen.getByText("Delete task?")).toBeInTheDocument();
    });
  });
});
