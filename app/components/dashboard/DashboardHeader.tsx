"use client";

import { AlertTriangle, Circle, Folder, Menu } from "lucide-react";
import type {
  Category,
  SelectedView,
} from "../../lib/dashboard/dashboard-types";
import { getTaskLabel } from "../../lib/dashboard/task-utils";
import CategoryIcon from "./CategoryIcon";
import TaskCreateForm from "./TaskCreateForm";
import ViewModeToggle from "./ViewModeToggle";
import type { ViewMode } from "../../lib/dashboard/dashboard-types";

interface DashboardHeaderProps {
  selectedCategory: Category | null;
  selectedView: SelectedView;
  taskCount: number;
  inputValue: string;
  descriptionValue: string;
  endDateValue: string;
  isCreatingTask: boolean;
  titleWarning?: string;
  dateWarning?: string;
  viewMode: ViewMode;
  onOpenMenu: () => void;
  onInputChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onAddTask: () => Promise<void>;
  onViewModeChange: (value: ViewMode) => void;
}

export default function DashboardHeader({
  selectedCategory,
  selectedView,
  taskCount,
  inputValue,
  descriptionValue,
  endDateValue,
  isCreatingTask,
  titleWarning,
  dateWarning,
  viewMode,
  onOpenMenu,
  onInputChange,
  onDescriptionChange,
  onEndDateChange,
  onAddTask,
  onViewModeChange,
}: DashboardHeaderProps) {
  const viewTitle =
    selectedView === "todo"
      ? "To Do"
      : selectedView === "overdue"
        ? "Overdue"
        : selectedCategory
          ? selectedCategory.name
          : "All Tasks";
  const HeaderViewIcon =
    selectedView === "todo"
      ? Circle
      : selectedView === "overdue"
        ? AlertTriangle
        : Folder;

  return (
    <div className="sticky top-0 z-20 -mx-3 mb-5 border-b border-[var(--app-border)] bg-[var(--app-shell-bg)]/95 px-3 pb-4 pt-2 backdrop-blur sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      <div className="mb-4 md:hidden">
        <button
          onClick={onOpenMenu}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-semibold text-[var(--app-text)] shadow-sm"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
      </div>

      <header className="mb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--app-accent)] text-white">
            {selectedCategory ? (
              <CategoryIcon
                icon={selectedCategory.icon}
                className="h-5 w-5 text-white"
              />
            ) : (
              <HeaderViewIcon className="h-5 w-5" />
            )}
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="min-w-0 truncate text-2xl font-semibold leading-tight text-[var(--app-text)] sm:text-3xl md:text-4xl">
              {viewTitle}
            </h1>
            <span className="shrink-0 rounded-full bg-[var(--app-surface)] px-3 py-1 text-sm font-medium text-[var(--app-text-muted)] shadow-sm">
              {taskCount} {getTaskLabel(taskCount)}
            </span>
          </div>
        </div>
      </header>

      <TaskCreateForm
        inputValue={inputValue}
        descriptionValue={descriptionValue}
        endDateValue={endDateValue}
        selectedCategoryName={selectedCategory?.name}
        isSubmitting={isCreatingTask}
        titleWarning={titleWarning}
        dateWarning={dateWarning}
        onInputChange={onInputChange}
        onDescriptionChange={onDescriptionChange}
        onEndDateChange={onEndDateChange}
        onSubmit={onAddTask}
      />

      <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
    </div>
  );
}
