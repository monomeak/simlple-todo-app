"use client";

import {
  AlertTriangle,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Circle,
  Folder,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  UserCircle2,
  X,
} from "lucide-react";
import type {
  Category,
  SelectedView,
  User,
} from "../../lib/dashboard/dashboard-types";
import { cn } from "../../lib/utils";
import CategoryIcon from "./CategoryIcon";

interface TaskSidebarProps {
  user: User | null;
  categories: Category[];
  selectedCategoryId: string | null;
  selectedView: SelectedView;
  todoCount: number;
  overdueCount: number;
  isCategoriesLoading: boolean;
  isCollapsed: boolean;
  showMobileClose?: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile?: () => void;
  onLogout: () => void | Promise<void>;
  onOpenSettings: () => void;
  onNewTask: () => void;
  onNewCategory: () => void;
  onRenameCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onSelectAllTasks: () => void;
  onSelectTodoTasks: () => void;
  onSelectOverdueTasks: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export default function TaskSidebar({
  user,
  categories,
  selectedCategoryId,
  selectedView,
  todoCount,
  overdueCount,
  isCategoriesLoading,
  isCollapsed,
  showMobileClose = false,
  onToggleCollapsed,
  onCloseMobile,
  onLogout,
  onOpenSettings,
  onNewTask,
  onNewCategory,
  onRenameCategory,
  onDeleteCategory,
  onSelectAllTasks,
  onSelectTodoTasks,
  onSelectOverdueTasks,
  onSelectCategory,
}: TaskSidebarProps) {
  const runThenClose = (action: () => void | Promise<void>) => async () => {
    await action();
    onCloseMobile?.();
  };

  return (
    <aside
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden border-b border-[var(--app-sidebar-border)] bg-[var(--app-sidebar-bg)] px-4 py-5 text-[var(--app-sidebar-text)] transition-[width,padding] duration-300 md:border-b-0 md:border-r",
        isCollapsed ? "md:w-[118px] md:px-3" : "md:w-[300px] md:px-5",
      )}
    >
      <button
        onClick={onToggleCollapsed}
        className="absolute right-2 top-3 z-10 hidden rounded-lg p-2 text-[var(--app-sidebar-text-soft)] transition hover:bg-[var(--app-sidebar-hover)] md:inline-flex"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {showMobileClose && (
        <div className="mb-3 flex justify-end md:hidden">
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-[var(--app-sidebar-text-soft)] transition hover:bg-[var(--app-sidebar-hover)]"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center gap-2">
        <div
          className={cn("flex items-center gap-2", isCollapsed && "md:mx-auto")}
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--app-sidebar-active)]">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "text-lg font-bold tracking-tight",
              isCollapsed && "md:hidden",
            )}
          >
            MyTodo
          </span>
        </div>
      </div>

      <button
        onClick={runThenClose(onNewTask)}
        className={cn(
          "mb-2 flex items-center gap-3 rounded-2xl bg-[var(--app-accent)] py-3 text-left text-base font-semibold text-white transition hover:bg-[var(--app-accent-hover)]",
          isCollapsed
            ? "justify-center px-3 md:mx-auto md:h-10 md:w-10 md:px-0 md:py-0"
            : "px-4",
        )}
      >
        <Plus className="h-[18px] w-[18px]" />
        <span className={cn(isCollapsed && "md:hidden")}>New Task</span>
      </button>

      <div
        className={cn(
          "mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[var(--app-sidebar-muted)]",
          isCollapsed && "md:hidden",
        )}
      >
        Menu
      </div>

      <NavButton
        icon={<Folder className="h-[18px] w-[18px]" />}
        label="All Tasks"
        active={selectedCategoryId === null && selectedView === "all"}
        isCollapsed={isCollapsed}
        onClick={runThenClose(onSelectAllTasks)}
      />
      <NavButton
        icon={<Circle className="h-[18px] w-[18px]" />}
        label="To Do"
        count={todoCount}
        active={selectedView === "todo"}
        isCollapsed={isCollapsed}
        onClick={runThenClose(onSelectTodoTasks)}
      />
      <NavButton
        icon={<AlertTriangle className="h-[18px] w-[18px]" />}
        label="Overdue"
        count={overdueCount}
        active={selectedView === "overdue"}
        isCollapsed={isCollapsed}
        onClick={runThenClose(onSelectOverdueTasks)}
      />

      <div className="mt-5 flex min-h-0 flex-1 flex-col">
        {isCollapsed ? (
          <div className="min-h-0 flex-1" />
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--app-sidebar-muted)]">
                Categories
              </div>
              <button
                onClick={runThenClose(onNewCategory)}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--app-accent)] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--app-accent-hover)]"
              >
                <Plus className="h-3.5 w-3.5" />
                New
              </button>
            </div>

            <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {isCategoriesLoading ? (
                <p className="px-3 py-2 text-sm text-[var(--app-sidebar-muted)]">
                  Loading categories...
                </p>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-2 py-1 transition",
                      selectedCategoryId === category.id
                        ? "bg-[var(--app-sidebar-active)]"
                        : "hover:bg-[var(--app-sidebar-hover)]",
                    )}
                  >
                    <button
                      onClick={runThenClose(() =>
                        onSelectCategory(category.id),
                      )}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left text-base font-medium text-[var(--app-sidebar-text-soft)]"
                    >
                      <CategoryIcon icon={category.icon} className="h-4 w-4" />
                      <span className="min-w-0 flex-1 truncate">
                        {category.name}
                      </span>
                    </button>
                    <button
                      onClick={() => onRenameCategory(category)}
                      className="rounded p-1.5 text-[var(--app-sidebar-muted)] opacity-0 transition hover:bg-[var(--app-sidebar-hover)] group-hover:opacity-100"
                      aria-label={`Rename ${category.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(category)}
                      className="rounded p-1.5 text-[var(--app-sidebar-muted)] opacity-0 transition hover:bg-[var(--app-sidebar-danger-hover)] hover:text-red-200 group-hover:opacity-100"
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-[var(--app-sidebar-muted)]">
                  No categories yet
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 border-t border-[var(--app-sidebar-border)] pt-6">
        <button
          onClick={runThenClose(onOpenSettings)}
          className={cn(
            "flex w-full items-center rounded-xl px-2 py-2 text-left transition hover:bg-[var(--app-sidebar-hover)]",
            isCollapsed
              ? "justify-center md:mx-auto md:h-10 md:w-10 md:px-0"
              : "gap-3",
          )}
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--app-sidebar-active)]">
            <UserCircle2 className="h-6 w-6" />
          </div>
          <div className={cn("min-w-0 flex-1", isCollapsed && "md:hidden")}>
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-[var(--app-sidebar-muted)]">
              {user?.email}
            </p>
          </div>
        </button>
        <button
          onClick={runThenClose(onLogout)}
          className={cn(
            "mt-5 flex items-center rounded-lg px-2 py-2 text-sm font-semibold text-[var(--app-sidebar-text-soft)] transition hover:bg-[var(--app-sidebar-hover)]",
            isCollapsed
              ? "justify-center md:mx-auto md:h-10 md:w-10 md:px-0"
              : "gap-2",
          )}
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span className={cn(isCollapsed && "md:hidden")}>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function NavButton({
  icon,
  label,
  count,
  active,
  isCollapsed,
  dangerActive = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  isCollapsed: boolean;
  dangerActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "mt-2 flex w-full items-center rounded-xl py-3 text-left text-base font-semibold transition",
        isCollapsed
          ? "justify-center px-2 md:mx-auto md:h-10 md:w-10 md:px-0 md:py-0"
          : count === undefined
            ? "gap-3 px-3"
            : "justify-between px-3",
        active
          ? dangerActive
            ? "bg-[#3b1f31] text-red-200"
            : "bg-[var(--app-sidebar-active)]"
          : "hover:bg-[var(--app-sidebar-hover)]",
      )}
    >
      <span className={cn("flex items-center", isCollapsed ? "" : "gap-3")}>
        {icon}
        <span className={cn(isCollapsed && "md:hidden")}>{label}</span>
      </span>
      {count !== undefined && (
        <span
          className={cn(
            "text-sm",
            active && dangerActive
              ? "text-red-200"
              : "text-[var(--app-sidebar-muted)]",
            isCollapsed && "md:hidden",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
