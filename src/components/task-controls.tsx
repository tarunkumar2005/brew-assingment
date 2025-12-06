"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, ArrowUpDown, Plus } from "lucide-react";

interface TaskControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (status: string) => void;
  onSortChange: (sort: string) => void;
  onNewTask: () => void;
}

export function TaskControls({
  search,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onNewTask,
}: TaskControlsProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => onFilterChange("ALL")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("TODO")}>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("IN_PROGRESS")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("DONE")}>
                Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => onSortChange("date-desc")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("date-asc")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("priority-desc")}>
                High Priority First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("priority-asc")}>
                Low Priority First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Button onClick={onNewTask} className="h-10 font-medium">
        <Plus className="mr-2 h-4 w-4" />
        New Task
      </Button>
    </div>
  );
}
