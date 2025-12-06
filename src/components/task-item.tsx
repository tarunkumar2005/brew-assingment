"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pencil, Trash2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: Date | string | null;
  createdAt: Date | string;
}

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const statusConfig = {
  TODO: {
    label: "To Do",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  DONE: {
    label: "Done",
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

const priorityConfig = {
  LOW: {
    label: "Low",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  HIGH: {
    label: "High",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  const formatDate = (date?: Date | string | null) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="group p-4 transition-all hover:shadow-md border-border/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-base text-foreground line-clamp-1">
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs font-medium ${
                statusConfig[task.status].className
              }`}
            >
              {statusConfig[task.status].label}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs font-medium ${
                priorityConfig[task.priority].className
              }`}
            >
              {priorityConfig[task.priority].label}
            </Badge>
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
