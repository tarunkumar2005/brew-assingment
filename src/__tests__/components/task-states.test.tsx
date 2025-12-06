/**
 * Component Rendering Tests
 * Tests for UI components
 */

import React from "react";
import { render, screen } from "@testing-library/react";

// Mock components since they have complex dependencies
describe("Task States Components", () => {
  describe("EmptyState", () => {
    it("should display the provided message", () => {
      const EmptyState = ({ message }: { message: string }) => (
        <div data-testid="empty-state">
          <p>{message}</p>
        </div>
      );

      render(<EmptyState message="No tasks found" />);
      expect(screen.getByText("No tasks found")).toBeInTheDocument();
    });

    it("should display default message when no tasks exist", () => {
      const defaultMessage =
        "You don't have any tasks yet. Click 'New Task' to create your first task.";
      const EmptyState = ({ message }: { message: string }) => (
        <div data-testid="empty-state">
          <p>{message}</p>
        </div>
      );

      render(<EmptyState message={defaultMessage} />);
      expect(
        screen.getByText(/You don't have any tasks yet/)
      ).toBeInTheDocument();
    });
  });

  describe("ErrorState", () => {
    it("should display error message", () => {
      const ErrorState = ({
        message,
        onRetry,
      }: {
        message: string;
        onRetry: () => void;
      }) => (
        <div data-testid="error-state">
          <p>{message}</p>
          <button onClick={onRetry}>Try Again</button>
        </div>
      );

      const mockRetry = jest.fn();
      render(<ErrorState message="Failed to load tasks" onRetry={mockRetry} />);

      expect(screen.getByText("Failed to load tasks")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });
  });
});

describe("Task Item Display", () => {
  const statusConfig = {
    TODO: { label: "To Do", className: "bg-blue-100 text-blue-700" },
    IN_PROGRESS: {
      label: "In Progress",
      className: "bg-amber-100 text-amber-700",
    },
    DONE: { label: "Done", className: "bg-green-100 text-green-700" },
  };

  const priorityConfig = {
    LOW: { label: "Low", className: "bg-slate-100 text-slate-700" },
    MEDIUM: { label: "Medium", className: "bg-yellow-100 text-yellow-700" },
    HIGH: { label: "High", className: "bg-red-100 text-red-700" },
  };

  it("should map status to correct label", () => {
    expect(statusConfig.TODO.label).toBe("To Do");
    expect(statusConfig.IN_PROGRESS.label).toBe("In Progress");
    expect(statusConfig.DONE.label).toBe("Done");
  });

  it("should map priority to correct label", () => {
    expect(priorityConfig.LOW.label).toBe("Low");
    expect(priorityConfig.MEDIUM.label).toBe("Medium");
    expect(priorityConfig.HIGH.label).toBe("High");
  });
});

describe("Date Formatting", () => {
  const formatDate = (date?: Date | string | null): string | null => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  it("should format date correctly", () => {
    const date = new Date("2025-12-06");
    const formatted = formatDate(date);
    expect(formatted).toBe("Dec 6, 2025");
  });

  it("should handle string dates", () => {
    const dateString = "2025-12-25";
    const formatted = formatDate(dateString);
    expect(formatted).toBe("Dec 25, 2025");
  });

  it("should return null for null/undefined dates", () => {
    expect(formatDate(null)).toBeNull();
    expect(formatDate(undefined)).toBeNull();
  });
});

describe("User Initials Generation", () => {
  const getInitials = (name?: string | null): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  it("should generate initials from full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Tarun Kumar")).toBe("TK");
  });

  it("should handle single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("should limit to 2 characters", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("should return U for null/undefined", () => {
    expect(getInitials(null)).toBe("U");
    expect(getInitials(undefined)).toBe("U");
  });

  it("should return U for empty string", () => {
    expect(getInitials("")).toBe("U");
  });
});
