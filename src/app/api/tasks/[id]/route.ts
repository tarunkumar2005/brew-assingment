import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { Status, Priority } from "@/generated/prisma/enums";
import { Task } from "@/generated/prisma/client";

function isValidStatus(value: string | null): value is Status {
  if (!value) return false;
  return Object.values(Status).includes(value as Status);
}

function isValidPriority(value: string | null): value is Priority {
  if (!value) return false;
  return Object.values(Priority).includes(value as Priority);
}

type TaskResponse = {
  task: Task;
};

type ErrorResponse = {
  error: string;
  details?: string;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<TaskResponse | ErrorResponse>> {
  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized", details: "User ID not found in headers" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json<ErrorResponse>(
        { error: "Validation error", details: "Invalid task ID" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!task) {
      return NextResponse.json<ErrorResponse>(
        { error: "Not found", details: "Task not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json<TaskResponse>({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json<ErrorResponse>(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<TaskResponse | ErrorResponse>> {
  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized", details: "User ID not found in headers" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json<ErrorResponse>(
        { error: "Validation error", details: "Invalid task ID" },
        { status: 400 }
      );
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTask) {
      return NextResponse.json<ErrorResponse>(
        { error: "Not found", details: "Task not found or access denied" },
        { status: 404 }
      );
    }

    const body = await req.json();

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json<ErrorResponse>(
          {
            error: "Validation error",
            details: "Title must be a non-empty string",
          },
          { status: 400 }
        );
      }
    }

    if (body.description !== undefined && body.description !== null) {
      if (typeof body.description !== "string") {
        return NextResponse.json<ErrorResponse>(
          {
            error: "Validation error",
            details: "Description must be a string",
          },
          { status: 400 }
        );
      }
    }

    if (body.priority !== undefined && !isValidPriority(body.priority)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Validation error",
          details: `Priority must be one of: ${Object.values(Priority).join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    if (body.status !== undefined && !isValidStatus(body.status)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Validation error",
          details: `Status must be one of: ${Object.values(Status).join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (body.dueDate !== undefined && body.dueDate !== null) {
      if (isNaN(Date.parse(body.dueDate))) {
        return NextResponse.json<ErrorResponse>(
          {
            error: "Validation error",
            details: "Due date must be a valid ISO date string",
          },
          { status: 400 }
        );
      }
    }

    const updateData: {
      title?: string;
      description?: string | null;
      priority?: Priority;
      status?: Status;
      dueDate?: Date | null;
    } = {};

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }
    if (body.priority !== undefined) {
      updateData.priority = body.priority;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json<TaskResponse>({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json<ErrorResponse>(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ message: string } | ErrorResponse>> {
  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized", details: "User ID not found in headers" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json<ErrorResponse>(
        { error: "Validation error", details: "Invalid task ID" },
        { status: 400 }
      );
    }
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTask) {
      return NextResponse.json<ErrorResponse>(
        { error: "Not found", details: "Task not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json<ErrorResponse>(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
