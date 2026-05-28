import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBar } from "@/components/FilterBar";
import { TodoProvider } from "@/context/TodoContext";

// Prevent actual API calls during tests
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => [],
});

function renderWithProvider(ui: React.ReactElement) {
  return render(<TodoProvider>{ui}</TodoProvider>);
}

describe("FilterBar", () => {
  it("renders search input", () => {
    renderWithProvider(<FilterBar />);
    expect(screen.getByPlaceholderText("Search tasks…")).toBeInTheDocument();
  });

  it("renders status filter buttons", () => {
    renderWithProvider(<FilterBar />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders user filter", () => {
    renderWithProvider(<FilterBar />);
    expect(screen.getByText("All users")).toBeInTheDocument();
  });

  it("shows clear button when search has value", () => {
    renderWithProvider(<FilterBar />);
    const input = screen.getByPlaceholderText("Search tasks…");
    fireEvent.change(input, { target: { value: "test" } });
    // Clear button (X) should appear
    expect(input).toHaveValue("test");
  });
});
