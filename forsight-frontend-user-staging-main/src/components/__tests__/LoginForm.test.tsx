import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useLoginUser } from "../../api/useLoginUser";
import { LoginForm } from "../modules/login/LoginForm";

// TESTS LIST
// - Test when both email and password are empty
// - Test when email is empty
// - Test when email is invalid
// - Test when password is empty
// - Test when some/all conditions are not fullfilled - then it should not send API call
// - Test if all conditions are fullfilled - then it should send data to Backend

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("../../api/useLoginUser", () => ({
  useLoginUser: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

describe("Login Form Validation", () => {
  // Test when both email and password are empty

  it("Should show toast message when both email and password are empty", async () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <LoginForm />
        </QueryClientProvider>
      </MemoryRouter>
    );

    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please enter credentials to continue"
      );
    });
  });

  // Test when email is empty
  it("Should show toast if email is empty", async () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <LoginForm />
        </QueryClientProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please enter Email to continue"
      );
    });
  });

  //Test when email is invalid
  it("Should show toast if email is invalid", async () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <LoginForm />
        </QueryClientProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "invalidFormat" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid email format");
    });
  });

  // Test when password is empty
  it("Should show toast if password is empty", async () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <LoginForm />
        </QueryClientProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });

    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please enter password to continue"
      );
    });
  });

  //Test when some/all conditions are not fullfilled
  it("Should not call API if the conditions do not meet", async () => {
    const mockMutate = useLoginUser().mutate;
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <LoginForm />
        </QueryClientProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "incorrectEmail" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "" },
    });

    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid email format");
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  //Test if all conditions are fullfilled
  it("Should send the data to Backend if all the conditions meet", async () => {
    const mockFunction = vi.fn();
    (useLoginUser as jest.Mock).mockReturnValue({
      mutate: mockFunction,
    });

    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <LoginForm />
        </QueryClientProvider>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "valid@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });
    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(mockFunction).toHaveBeenCalledWith(
        {
          email: "valid@example.com",
          password: "password123",
        },
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onSuccess: expect.any(Function),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onError: expect.any(Function),
        })
      );
    });
  });
});
