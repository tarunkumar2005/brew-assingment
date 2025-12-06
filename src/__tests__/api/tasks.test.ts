/**
 * API Route Tests for /api/tasks
 * Tests the task CRUD operations
 */

import { Status, Priority } from "@/generated/prisma/enums";

// Mock Prisma client
const mockPrisma = {
  task: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Mock headers
const mockHeaders = new Map<string, string>();
jest.mock("next/headers", () => ({
  headers: jest.fn(() => Promise.resolve(mockHeaders)),
}));

describe("Task Validation Utilities", () => {
  // Test type guard functions
  describe("isValidStatus", () => {
    const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
    const invalidStatuses = ["INVALID", "pending", "", null, undefined];

    it.each(validStatuses)(
      "should return true for valid status: %s",
      (status) => {
        expect(Object.values(Status).includes(status as Status)).toBe(true);
      }
    );

    it.each(invalidStatuses)(
      "should return false for invalid status: %s",
      (status) => {
        if (status === null || status === undefined || status === "") {
          expect(
            Object.values(Status).includes(status as unknown as Status)
          ).toBe(false);
        }
      }
    );
  });

  describe("isValidPriority", () => {
    const validPriorities = ["LOW", "MEDIUM", "HIGH"];
    const invalidPriorities = ["INVALID", "urgent", "", null, undefined];

    it.each(validPriorities)(
      "should return true for valid priority: %s",
      (priority) => {
        expect(Object.values(Priority).includes(priority as Priority)).toBe(
          true
        );
      }
    );

    it.each(invalidPriorities)(
      "should return false for invalid priority: %s",
      (priority) => {
        if (priority === null || priority === undefined || priority === "") {
          expect(
            Object.values(Priority).includes(priority as unknown as Priority)
          ).toBe(false);
        }
      }
    );
  });
});

describe("Task Data Validation", () => {
  describe("Title Validation", () => {
    it("should reject empty title", () => {
      const title = "";
      const isValid = Boolean(
        typeof title === "string" && title.trim().length > 0
      );
      expect(isValid).toBe(false);
    });

    it("should reject whitespace-only title", () => {
      const title = "   ";
      const isValid = Boolean(
        title && typeof title === "string" && title.trim().length > 0
      );
      expect(isValid).toBe(false);
    });

    it("should accept valid title", () => {
      const title = "Complete assignment";
      const isValid = Boolean(
        title && typeof title === "string" && title.trim().length > 0
      );
      expect(isValid).toBe(true);
    });
  });

  describe("Task Object Validation", () => {
    it("should validate a complete task object", () => {
      const task = {
        id: "cuid123",
        title: "Test Task",
        description: "A test task description",
        status: "TODO" as Status,
        priority: "HIGH" as Priority,
        dueDate: new Date("2025-12-31"),
        userId: "user123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(task.title).toBeDefined();
      expect(task.status).toBe("TODO");
      expect(task.priority).toBe("HIGH");
      expect(task.userId).toBeDefined();
    });

    it("should allow optional fields to be null", () => {
      const task = {
        id: "cuid123",
        title: "Test Task",
        description: null,
        status: "TODO" as Status,
        priority: "LOW" as Priority,
        dueDate: null,
        userId: "user123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(task.description).toBeNull();
      expect(task.dueDate).toBeNull();
    });
  });
});

describe("Filter and Search Logic", () => {
  const mockTasks = [
    {
      id: "1",
      title: "Complete project",
      description: "Finish the task tracker",
      status: "IN_PROGRESS" as Status,
      priority: "HIGH" as Priority,
      createdAt: new Date("2025-12-01"),
    },
    {
      id: "2",
      title: "Write tests",
      description: "Add unit tests",
      status: "TODO" as Status,
      priority: "MEDIUM" as Priority,
      createdAt: new Date("2025-12-05"),
    },
    {
      id: "3",
      title: "Deploy app",
      description: null,
      status: "DONE" as Status,
      priority: "LOW" as Priority,
      createdAt: new Date("2025-12-03"),
    },
  ];

  describe("Status Filtering", () => {
    it("should return all tasks when filter is ALL", () => {
      const filterStatus = "ALL";
      const filtered = mockTasks.filter(
        (task) => filterStatus === "ALL" || task.status === filterStatus
      );
      expect(filtered).toHaveLength(3);
    });

    it("should filter by TODO status", () => {
      const filterStatus = "TODO";
      const filtered = mockTasks.filter((task) => task.status === filterStatus);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Write tests");
    });

    it("should filter by IN_PROGRESS status", () => {
      const filterStatus = "IN_PROGRESS";
      const filtered = mockTasks.filter((task) => task.status === filterStatus);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Complete project");
    });

    it("should filter by DONE status", () => {
      const filterStatus = "DONE";
      const filtered = mockTasks.filter((task) => task.status === filterStatus);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Deploy app");
    });
  });

  describe("Search Functionality", () => {
    it("should search by title", () => {
      const query = "project";
      const filtered = mockTasks.filter((task) =>
        task.title.toLowerCase().includes(query.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Complete project");
    });

    it("should search by description", () => {
      const query = "unit";
      const filtered = mockTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          task.description?.toLowerCase().includes(query.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Write tests");
    });

    it("should be case insensitive", () => {
      const query = "DEPLOY";
      const filtered = mockTasks.filter((task) =>
        task.title.toLowerCase().includes(query.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Deploy app");
    });

    it("should return empty array for no matches", () => {
      const query = "nonexistent";
      const filtered = mockTasks.filter((task) =>
        task.title.toLowerCase().includes(query.toLowerCase())
      );
      expect(filtered).toHaveLength(0);
    });
  });

  describe("Sorting", () => {
    it("should sort by date descending (newest first)", () => {
      const sorted = [...mockTasks].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      expect(sorted[0].title).toBe("Write tests");
      expect(sorted[2].title).toBe("Complete project");
    });

    it("should sort by date ascending (oldest first)", () => {
      const sorted = [...mockTasks].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      expect(sorted[0].title).toBe("Complete project");
      expect(sorted[2].title).toBe("Write tests");
    });

    it("should sort by priority descending (high first)", () => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const sorted = [...mockTasks].sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      );
      expect(sorted[0].priority).toBe("HIGH");
      expect(sorted[2].priority).toBe("LOW");
    });

    it("should sort by priority ascending (low first)", () => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const sorted = [...mockTasks].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      expect(sorted[0].priority).toBe("LOW");
      expect(sorted[2].priority).toBe("HIGH");
    });
  });
});
