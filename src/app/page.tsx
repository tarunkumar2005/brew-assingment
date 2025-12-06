"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { TaskControls } from "@/components/task-controls";
import { TaskItem } from "@/components/task-item";
import { TaskModal } from "@/components/task-modal";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";
import { AuthPromptModal } from "@/components/auth-prompt-modal";
import {
  TaskListSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/task-states";
import { getSession, signOut } from "@/lib/auth-actions";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: Date | string | null;
  createdAt: Date | string;
}

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * HomePage Component
 *
 * Main task management page that displays:
 * - User header with logout functionality
 * - Task search, filter, and sort controls
 * - List of user's tasks with CRUD operations
 *
 * Features:
 * - Authentication check on mount
 * - Debounced search for performance optimization
 * - Client-side filtering and sorting for instant feedback
 * - Modal-based task creation/editing
 */
export default function HomePage() {
  // ============================================
  // State Management
  // ============================================

  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Task data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter, search, and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("date-desc");

  // Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        setUser(session.user as User);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/tasks");
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setTasks([]);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteClick = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    setModalLoading(true);
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.id}`, taskData);
      } else {
        await axios.post("/api/tasks", taskData);
      }

      setIsTaskModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error("Save task failed:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;

    setModalLoading(true);
    try {
      await axios.delete(`/api/tasks/${deletingTaskId}`);
      setIsDeleteModalOpen(false);
      setDeletingTaskId(null);
      fetchTasks();
    } catch (err) {
      console.error("Delete task failed:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filterStatus !== "ALL" && task.status !== filterStatus) {
          return false;
        }

        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          return (
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date-desc":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "date-asc":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "priority-desc": {
            const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          case "priority-asc": {
            const priorityOrderAsc = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return priorityOrderAsc[a.priority] - priorityOrderAsc[b.priority];
          }
          default:
            return 0;
        }
      });
  }, [tasks, filterStatus, debouncedSearchQuery, sortBy]);

  const deletingTask = tasks.find((t) => t.id === deletingTaskId);

  if (!isCheckingAuth && !user) {
    return <AuthPromptModal open={true} />;
  }

  if (isCheckingAuth) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        role="status"
        aria-label="Loading application"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />

      <main
        className="container mx-auto px-4 py-8 max-w-6xl"
        role="main"
        aria-label="Task management"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Tasks</h2>
            <p className="text-muted-foreground">
              Manage your tasks and stay organized
            </p>
          </div>

          <TaskControls
            search={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterChange={setFilterStatus}
            onSortChange={setSortBy}
            onNewTask={handleNewTask}
          />

          <section
            className="min-h-[400px]"
            aria-label="Task list"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <TaskListSkeleton />
            ) : error ? (
              <ErrorState message={error} onRetry={fetchTasks} />
            ) : filteredAndSortedTasks.length === 0 ? (
              <EmptyState
                message={
                  searchQuery || filterStatus !== "ALL"
                    ? "No tasks match your current filters. Try adjusting your search or filters."
                    : "You don&apos;t have any tasks yet. Click &apos;New Task&apos; to create your first task."
                }
              />
            ) : (
              <ul className="space-y-3" role="list" aria-label="Tasks">
                {filteredAndSortedTasks.map((task) => (
                  <li key={task.id}>
                    <TaskItem
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteClick}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <TaskModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        isLoading={modalLoading}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={modalLoading}
        taskTitle={deletingTask?.title}
      />
    </div>
  );
}
