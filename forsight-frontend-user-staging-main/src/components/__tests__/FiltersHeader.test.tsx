import FiltersHeader from "../modules/headers/FiltersHeader";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//LIST
//1. Should update search params when query is entered

const mockFunction = vi.fn();
vi.mock("react-router-dom", () => ({
  useSearchParams: vi.fn(() => [new URLSearchParams(), mockFunction]),
}));

describe("For FiltersHeader Component", () => {
  it("Should update search params when query is entered", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <FiltersHeader />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "test query" } });
    expect(mockFunction).toHaveBeenCalled();
  });
});
