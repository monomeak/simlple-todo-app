"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  Category,
  FireworkBurst,
  Task,
  User,
  ViewMode,
} from "../../lib/dashboard/dashboard-types";
import {
  getSelectedView,
  getTaskScopeKey,
  isTaskOverdue,
} from "../../lib/dashboard/task-utils";
import { ApiError, dashboardApi } from "../../lib/dashboard/dashboard-api";
import { cn } from "../../lib/utils";
import CategoryModal from "./CategoryModal";
import DashboardError from "./DashboardError";
import DashboardHeader from "./DashboardHeader";
import FireworksLayer from "./FireworksLayer";
import MobileSidebarOverlay from "./MobileSidebarOverlay";
import SettingsModal from "./SettingsModal";
import TaskListSection from "./TaskListSection";
import TaskSidebar from "./TaskSidebar";

export default function DashboardClient({
  initialCategoryId = null,
}: {
  initialCategoryId?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = initialCategoryId;
  const selectedView = getSelectedView(searchParams.get("view"));
  const taskScopeKey = getTaskScopeKey(selectedCategoryId, selectedView);

  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [endDateValue, setEndDateValue] = useState("");
  const [createTaskTitleWarning, setCreateTaskTitleWarning] = useState("");
  const [createTaskDateWarning, setCreateTaskDateWarning] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState<ViewMode>("list");
  const [fireworkBursts, setFireworkBursts] = useState<FireworkBurst[]>([]);
  const [taskOrderByScope, setTaskOrderByScope] = useState<
    Record<string, string[]>
  >({});
  const [categoryFormState, setCategoryFormState] = useState<{
    open: boolean;
    mode: "create" | "edit";
    category: Category | null;
    isSubmitting: boolean;
  }>({
    open: false,
    mode: "create",
    category: null,
    isSubmitting: false,
  });

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const loadDashboard = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    setIsCategoriesLoading(true);

    try {
      const [meResponse, categoriesResponse, tasksResponse] = await Promise.all([
        dashboardApi.getCurrentUser(),
        dashboardApi.listCategories(),
        dashboardApi.listTasks({ categoryId: selectedCategoryId }),
      ]);

      setUser(meResponse.user);
      setCategories(categoriesResponse.data);
      setTasks(tasksResponse.data);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }

      if (loadError instanceof Error) {
        setError(loadError.message);
      } else {
        setError("Failed to load dashboard.");
      }
    } finally {
      setIsLoading(false);
      setIsCategoriesLoading(false);
    }
  }, [router, selectedCategoryId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDashboard();
    });
  }, [loadDashboard]);

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );

  const categoriesById = useMemo(
    () =>
      categories.reduce<Record<string, Category>>((acc, category) => {
        acc[category.id] = category;
        return acc;
      }, {}),
    [categories],
  );

  useEffect(() => {
    if (selectedCategoryId && !isCategoriesLoading && !selectedCategory) {
      router.replace(selectedView === "all" ? "/" : `/?view=${selectedView}`);
    }
  }, [
    selectedCategoryId,
    isCategoriesLoading,
    selectedCategory,
    router,
    selectedView,
  ]);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen, closeSidebar]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = () => {
      if (mediaQuery.matches) {
        closeSidebar();
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [closeSidebar]);

  const filteredTasks = useMemo(() => {
    const scopedItems =
      selectedView === "todo"
        ? tasks.filter((task) => !task.is_completed)
        : selectedView === "overdue"
          ? tasks.filter((task) => isTaskOverdue(task))
          : tasks;

    const defaultSort = (a: Task, b: Task) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
      if (a.order_number !== b.order_number) return a.order_number - b.order_number;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    };

    const orderedIds = taskOrderByScope[taskScopeKey] ?? [];
    if (!orderedIds.length) return [...scopedItems].sort(defaultSort);

    const orderIndexMap = new Map(orderedIds.map((id, index) => [id, index]));
    return [...scopedItems].sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;

      const aIndex = orderIndexMap.get(a.id);
      const bIndex = orderIndexMap.get(b.id);
      if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;
      return defaultSort(a, b);
    });
  }, [tasks, selectedView, taskOrderByScope, taskScopeKey]);

  const todoCount = useMemo(
    () => tasks.filter((task) => !task.is_completed).length,
    [tasks],
  );

  const overdueCount = useMemo(
    () => tasks.filter((task) => isTaskOverdue(task)).length,
    [tasks],
  );

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const refreshTasks = async () => {
    const response = await dashboardApi.listTasks({ categoryId: selectedCategoryId });
    setTasks(response.data);
  };

  const launchFireworks = () => {
    const palette = [18, 42, 168, 205, 330];
    const timestamp = Date.now();
    const bursts = Array.from({ length: 5 }).map((_, index) => ({
      id: `${timestamp}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 35,
      hue: palette[Math.floor(Math.random() * palette.length)],
    }));

    setFireworkBursts((prev) => [...prev, ...bursts]);
    for (const burst of bursts) {
      setTimeout(() => {
        setFireworkBursts((prev) => prev.filter((item) => item.id !== burst.id));
      }, 900);
    }
  };

  const addTask = async () => {
    const text = inputValue.trim();
    if (!text) {
      setCreateTaskTitleWarning("Please enter task title.");
      return;
    }
    setCreateTaskTitleWarning("");

    if (!endDateValue) {
      setCreateTaskDateWarning("Please select due date and time.");
      return;
    }

    const selectedTime = new Date(endDateValue).getTime();
    if (Number.isNaN(selectedTime) || selectedTime <= Date.now()) {
      setCreateTaskDateWarning("Due date-time must be in the future.");
      return;
    }
    setCreateTaskDateWarning("");
    setIsCreatingTask(true);
    setError(null);

    try {
      const created = await dashboardApi.createTask({
        text,
        description: descriptionValue.trim() || null,
        category_id: selectedCategoryId || undefined,
        end_date: new Date(endDateValue).toISOString(),
      });
      setTasks((prev) => [created.data, ...prev]);
      setInputValue("");
      setDescriptionValue("");
      setEndDateValue("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create task.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    setError(null);
    try {
      const updated = await dashboardApi.updateTask(taskId, {
        is_completed: !currentCompleted,
      });
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updated.data : task)),
      );
      if (!currentCompleted) launchFireworks();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update task.");
    }
  };

  const editTask = async (
    taskId: string,
    payload: { text: string; description?: string | null; end_date?: string | null },
  ) => {
    setError(null);
    try {
      const updated = await dashboardApi.updateTask(taskId, payload);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updated.data : task)),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update task.");
    }
  };

  const removeTask = async (taskId: string) => {
    setError(null);
    try {
      await dashboardApi.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete task.");
    }
  };

  const previewReorderTasks = (
    sourceTaskId: string,
    targetTaskId: string,
    position: "before" | "after",
  ) => {
    if (sourceTaskId === targetTaskId) return;

    setTaskOrderByScope((prev) => {
      const visibleIds = filteredTasks.map((task) => task.id);
      const sourceTask = filteredTasks.find((task) => task.id === sourceTaskId);
      const targetTask = filteredTasks.find((task) => task.id === targetTaskId);
      if (!sourceTask || !targetTask || sourceTask.is_completed) return prev;
      if (sourceTask.is_completed !== targetTask.is_completed) return prev;

      const existingOrder =
        prev[taskScopeKey]?.filter((id) => visibleIds.includes(id)) ?? [];
      const baseOrder = [
        ...existingOrder,
        ...visibleIds.filter((id) => !existingOrder.includes(id)),
      ];
      const orderWithoutSource = baseOrder.filter((id) => id !== sourceTaskId);
      const targetIndex = orderWithoutSource.indexOf(targetTaskId);
      if (targetIndex < 0) return prev;

      const nextOrder = [...orderWithoutSource];
      nextOrder.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, sourceTaskId);
      return { ...prev, [taskScopeKey]: nextOrder };
    });
  };

  const commitReorderTasks = () => {
    const orderedIds = taskOrderByScope[taskScopeKey] ?? filteredTasks.map((task) => task.id);
    if (!orderedIds.length) return;

    void dashboardApi.reorderTasks(orderedIds).catch((reorderError) => {
      setError(
        reorderError instanceof Error ? reorderError.message : "Failed to reorder tasks.",
      );
      void refreshTasks();
    });
  };

  const handleCategorySubmit = async (payload: {
    name: string;
    icon?: string;
    description?: string;
  }) => {
    setCategoryFormState((prev) => ({ ...prev, isSubmitting: true }));
    setError(null);

    try {
      if (categoryFormState.mode === "create") {
        const created = await dashboardApi.createCategory(payload);
        setCategories((prev) => [created, ...prev]);
        router.push(
          `/categories/${created.id}${selectedView !== "all" ? `?view=${selectedView}` : ""}`,
        );
      } else if (categoryFormState.category) {
        const updated = await dashboardApi.updateCategory(
          categoryFormState.category.id,
          payload,
        );
        setCategories((prev) =>
          prev.map((category) =>
            category.id === categoryFormState.category?.id ? updated : category,
          ),
        );
      }
      setCategoryFormState((prev) => ({ ...prev, open: false }));
    } catch (categoryError) {
      setError(
        categoryError instanceof Error ? categoryError.message : "Failed to save category.",
      );
    } finally {
      setCategoryFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const deleteCategory = async (category: Category) => {
    const confirmed = window.confirm(
      `Delete category "${category.name}"?\nRelated tasks will remain and category will be removed.`,
    );
    if (!confirmed) return;

    setError(null);
    try {
      await dashboardApi.deleteCategory(category.id);
      setCategories((prev) => prev.filter((item) => item.id !== category.id));
      if (selectedCategoryId === category.id) router.push("/");
    } catch (categoryError) {
      setError(
        categoryError instanceof Error ? categoryError.message : "Failed to delete category.",
      );
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await dashboardApi.logout().catch(() => undefined);
      setUser(null);
      setTasks([]);
      setCategories([]);
      setIsLogoutConfirmOpen(false);
      sessionStorage.setItem("auth_just_logged_out", "true");
      window.location.replace("/login?loggedOut=1");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const updateProfile = async (payload: { name?: string; email?: string }) => {
    const response = await dashboardApi.updateProfile(payload);
    setUser(response.user);
  };

  const updatePassword = async (payload: {
    current_password: string;
    new_password: string;
  }) => {
    await dashboardApi.updatePassword(payload);
  };

  const focusNewTask = () => {
    if (selectedCategoryId || selectedView !== "all") {
      router.push("/");
      setTimeout(() => {
        document.querySelector<HTMLInputElement>('[data-testid="task-input"]')?.focus();
      }, 80);
      return;
    }

    document.querySelector<HTMLInputElement>('[data-testid="task-input"]')?.focus();
  };

  return (
    <div className="min-h-screen bg-[var(--app-shell-bg)] p-0 transition-colors">
      <FireworksLayer bursts={fireworkBursts} />
      <CategoryModal
        open={categoryFormState.open}
        mode={categoryFormState.mode}
        initialValues={{
          name: categoryFormState.category?.name,
          icon: categoryFormState.category?.icon,
          description: categoryFormState.category?.description,
        }}
        isSubmitting={categoryFormState.isSubmitting}
        onClose={() =>
          setCategoryFormState((prev) => ({ ...prev, open: false }))
        }
        onSubmit={handleCategorySubmit}
      />
      <SettingsModal
        open={isSettingsOpen}
        user={user}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateProfile={updateProfile}
        onUpdatePassword={updatePassword}
      />
      <LogoutConfirmDialog
        open={isLogoutConfirmOpen}
        isLoggingOut={isLoggingOut}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={logout}
      />
      <MobileSidebarOverlay
        open={isSidebarOpen}
        onClose={closeSidebar}
      />

      <div className="flex h-dvh min-h-screen w-full flex-col overflow-hidden bg-[var(--app-shell-bg)] transition-colors md:flex-row">
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[min(88vw,360px)] transform p-2 pr-0 transition-transform duration-300 ease-out md:static md:h-full md:w-auto md:max-w-none md:self-stretch md:translate-x-0 md:p-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-hidden={!isSidebarOpen}
        >
          <TaskSidebar
            user={user}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            selectedView={selectedView}
            todoCount={todoCount}
            overdueCount={overdueCount}
            isCategoriesLoading={isCategoriesLoading}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapsed={() => setIsSidebarCollapsed((prev) => !prev)}
            onLogout={() => {
              closeSidebar();
              setIsLogoutConfirmOpen(true);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onNewTask={focusNewTask}
            onNewCategory={() =>
              setCategoryFormState({
                open: true,
                mode: "create",
                category: null,
                isSubmitting: false,
              })
            }
            onRenameCategory={(category) =>
              setCategoryFormState({
                open: true,
                mode: "edit",
                category,
                isSubmitting: false,
              })
            }
            onDeleteCategory={deleteCategory}
            onSelectAllTasks={() => {
              closeSidebar();
              navigateTo("/");
            }}
            onSelectTodoTasks={() => {
              closeSidebar();
              navigateTo("/?view=todo");
            }}
            onSelectOverdueTasks={() => {
              closeSidebar();
              navigateTo("/?view=overdue");
            }}
            onSelectCategory={(id) => {
              closeSidebar();
              navigateTo(`/categories/${id}`);
            }}
            showMobileClose
            onCloseMobile={closeSidebar}
          />
        </div>

        <main className="min-h-0 w-full flex-1 overflow-y-auto px-3 pb-6 pt-3 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-7">
          <DashboardHeader
            selectedCategory={selectedCategory}
            selectedView={selectedView}
            taskCount={filteredTasks.length}
            inputValue={inputValue}
            descriptionValue={descriptionValue}
            endDateValue={endDateValue}
            isCreatingTask={isCreatingTask}
            titleWarning={createTaskTitleWarning}
            dateWarning={createTaskDateWarning}
            viewMode={taskViewMode}
            onOpenMenu={() => setIsSidebarOpen(true)}
            onInputChange={(value) => {
              setInputValue(value);
              if (value.trim()) setCreateTaskTitleWarning("");
            }}
            onDescriptionChange={setDescriptionValue}
            onEndDateChange={(value) => {
              setEndDateValue(value);
              const selectedTime = new Date(value).getTime();
              if (!Number.isNaN(selectedTime) && selectedTime > Date.now()) {
                setCreateTaskDateWarning("");
              }
            }}
            onAddTask={addTask}
            onViewModeChange={setTaskViewMode}
          />

          {error && <DashboardError message={error} />}

          {isLoading ? (
            <div className="py-12 text-center text-[var(--app-text-muted)]">
              Loading tasks...
            </div>
          ) : (
            <section className="max-w-[980px]">
              <TaskListSection
                tasks={filteredTasks}
                selectedCategoryId={selectedCategoryId}
                selectedView={selectedView}
                selectedCategoryName={selectedCategory?.name}
                categoriesById={categoriesById}
                viewMode={taskViewMode}
                onPreviewReorderTasks={previewReorderTasks}
                onCommitReorderTasks={commitReorderTasks}
                onToggleTask={toggleTask}
                onEditTask={editTask}
                onRemoveTask={removeTask}
              />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function LogoutConfirmDialog({
  open,
  isLoggingOut,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  isLoggingOut: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-black/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        className="w-full max-w-sm rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 text-[var(--app-text)] shadow-2xl"
      >
        <h2 id="logout-title" className="text-lg font-semibold">
          Log out?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
          You will need to sign in again before managing your tasks.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoggingOut}
            className="rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-chip-bg)] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isLoggingOut}
            className="inline-flex min-w-24 items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </div>
    </div>
  );
}
