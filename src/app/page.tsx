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

/**
 * Task interface representing a task item in the application.
 * Matches the Prisma Task model structure.
 */
interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: Date | string | null;
  createdAt: Date | string;
}

/**
 * User interface for authenticated user data.
 */
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

  // Debounce search query to prevent excessive filtering on every keystroke
  // This improves performance by waiting 300ms after user stops typing
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ============================================
  // Effects
  // ============================================

  // Check authentication status on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch tasks when user is authenticated
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // ============================================
  // Authentication Handlers
  // ============================================

  /**
   * Checks if user is authenticated by fetching the current session.
   * Sets user state if session exists, otherwise leaves as null.
   */
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

  // ============================================
  // Task CRUD Operations
  // ============================================

  /**
   * Fetches all tasks for the authenticated user from the API.
   * Updates loading and error states accordingly.
   */
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

  /**
   * Handles user logout by clearing session and resetting state.
   */
  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setTasks([]);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /**
   * Opens the task modal for creating a new task.
   */
  const handleNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  /**
   * Opens the task modal for editing an existing task.
   * @param task - The task to edit
   */
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  /**
   * Opens the delete confirmation modal for a task.
   * @param taskId - The ID of the task to delete
   */
  const handleDeleteClick = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteModalOpen(true);
  };

  /**
   * Saves a task (create or update) via API.
   * Refreshes task list on success.
   * @param taskData - Partial task data to save
   */
  const handleSaveTask = async (taskData: Partial<Task>) => {
    setModalLoading(true);
    try {
      if (editingTask) {
        // Update existing task
        await axios.put(`/api/tasks/${editingTask.id}`, taskData);
      } else {
        // Create new task
        await axios.post('/api/tasks', taskData);
      }

      setIsTaskModalOpen(false);
      fetchTasks(); // Refresh task list
    } catch (err) {
      console.error("Save task failed:", err);
    } finally {
      setModalLoading(false);
    }
  };

  /**
   * Confirms and executes task deletion via API.
   * Refreshes task list on success.
   */
  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;

    setModalLoading(true);
    try {
      await axios.delete(`/api/tasks/${deletingTaskId}`);
      setIsDeleteModalOpen(false);
      setDeletingTaskId(null);
      fetchTasks(); // Refresh task list
    } catch (err) {
      console.error("Delete task failed:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // ============================================
  // Memoized Computed Values
  // ============================================

  /**
   * Filters and sorts tasks based on current filter/search/sort state.
   * Uses debounced search query for performance optimization.
   * Memoized to prevent unnecessary recalculations.
   */
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Apply status filter
        if (filterStatus !== "ALL" && task.status !== filterStatus) {
          return false;
        }

        // Apply search filter (using debounced value)
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
        // Apply sorting based on selected sort option
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

  // Get the task being deleted for confirmation modal
  const deletingTask = tasks.find((t) => t.id === deletingTaskId);

  // ============================================
  // Render
  // ============================================

  // Show auth prompt if not authenticated
  if (!isCheckingAuth && !user) {
    return <AuthPromptModal open={true} />;
  }

  // Show loading spinner while checking auth
  if (isCheckingAuth) {
    return (
      <div 
        className="flex h-screen items-center justify-center"
        role="status"
        aria-label="Loading application"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
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
