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

// Response types
type TasksResponse = {
  tasks: Task[];
};

type ErrorResponse = {
  error: string;
  details?: string;
};

export async function GET(
  req: Request
): Promise<NextResponse<TasksResponse | ErrorResponse>> {
  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized", details: "User ID not found in headers" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    if (statusParam && statusParam !== "ALL" && !isValidStatus(statusParam)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Invalid status parameter",
          details: `Status must be one of: ${Object.values(Status).join(
            ", "
          )}, or ALL`,
        },
        { status: 400 }
      );
    }

    const whereClause: {
      userId: string;
      status?: Status;
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      userId,
    };

    if (statusParam && statusParam !== "ALL") {
      whereClause.status = statusParam as Status;
    }

    if (search && search.trim()) {
      whereClause.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json<TasksResponse>({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json<ErrorResponse>(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request
): Promise<NextResponse<{ task: Task } | ErrorResponse>> {
  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized", details: "User ID not found in headers" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Validation error",
          details: "Title is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    if (body.description && typeof body.description !== "string") {
      return NextResponse.json<ErrorResponse>(
        { error: "Validation error", details: "Description must be a string" },
        { status: 400 }
      );
    }

    if (body.priority && !isValidPriority(body.priority)) {
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

    if (body.status && !isValidStatus(body.status)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Validation error",
          details: `Status must be one of: ${Object.values(Status).join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Validation error",
          details: "Due date must be a valid ISO date string",
        },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        priority: body.priority || Priority.LOW,
        status: body.status || Status.TODO,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        userId,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json<ErrorResponse>(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
