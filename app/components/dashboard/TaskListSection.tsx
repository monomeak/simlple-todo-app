"use client";

import { CalendarDays, Check, GripVertical, Trash2, X } from "lucide-react";
import { useState } from "react";
import type {
  Category,
  SelectedView,
  Task,
  ViewMode,
} from "../../lib/dashboard/dashboard-types";
import { isTaskOverdue } from "../../lib/dashboard/task-utils";
import { cn } from "../../lib/utils";
import CategoryIcon from "./CategoryIcon";

interface TaskListSectionProps {
  tasks: Task[];
  selectedCategoryId: string | null;
  selectedView: SelectedView;
  viewMode: ViewMode;
  selectedCategoryName?: string;
  categoriesById: Record<string, Category>;
  onPreviewReorderTasks: (
    sourceTaskId: string,
    targetTaskId: string,
    position: "before" | "after",
  ) => void;
  onCommitReorderTasks: () => void;
  onToggleTask: (taskId: string, isCompleted: boolean) => Promise<void>;
  onEditTask: (
    taskId: string,
    payload: { text: string; description?: string | null; end_date?: string | null },
  ) => Promise<void>;
  onRemoveTask: (taskId: string) => Promise<void>;
}

export default function TaskListSection({
  tasks,
  selectedCategoryId,
  selectedView,
  viewMode,
  selectedCategoryName,
  categoriesById,
  onPreviewReorderTasks,
  onCommitReorderTasks,
  onToggleTask,
  onEditTask,
  onRemoveTask,
}: TaskListSectionProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingDescriptionValue, setEditingDescriptionValue] = useState("");
  const [editingEndDateValue, setEditingEndDateValue] = useState("");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<"before" | "after">(
    "before",
  );

  const startEdit = (task: Task) => {
    if (task.is_completed) return;
    setEditingTaskId(task.id);
    setEditingValue(task.text);
    setEditingDescriptionValue(task.description || "");
    setEditingEndDateValue(
      task.end_date ? new Date(task.end_date).toISOString().slice(0, 16) : "",
    );
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingValue("");
    setEditingDescriptionValue("");
    setEditingEndDateValue("");
  };

  const submitEdit = async (task: Task) => {
    const nextText = editingValue.trim();
    if (!nextText) {
      cancelEdit();
      return;
    }

    const nextEndDateIso = editingEndDateValue
      ? new Date(editingEndDateValue).toISOString()
      : null;
    const currentEndDateIso = task.end_date
      ? new Date(task.end_date).toISOString()
      : null;
    const nextDescription = editingDescriptionValue.trim() || null;
    const currentDescription = task.description || null;
    const payload: {
      text: string;
      description?: string | null;
      end_date?: string | null;
    } = {
      text: nextText,
    };

    if (nextDescription !== currentDescription) {
      payload.description = nextDescription;
    }

    if (nextEndDateIso !== currentEndDateIso) {
      payload.end_date = nextEndDateIso;
    }

    await onEditTask(task.id, payload);
    cancelEdit();
  };

  if (tasks.length === 0) {
    const emptyTitle =
      selectedView === "overdue"
        ? "No overdue tasks"
        : selectedView === "todo"
          ? "No to-do tasks"
          : "No tasks yet";

    return (
      <div className="max-w-[980px] rounded-xl border border-[var(--app-task-card-border)] bg-[var(--app-task-card-bg)] px-4 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--app-empty-bg)] text-[var(--app-empty-icon)]">
            <X className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--app-text)]">
              {emptyTitle}
            </h3>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">
              {selectedCategoryName
                ? `Create your first task in ${selectedCategoryName}.`
                : "Create your first task to get started."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
          : "space-y-3",
      )}
    >
      {tasks.map((task) => {
        const taskCategory = task.category_id
          ? categoriesById[task.category_id]
          : null;
        const overdue = isTaskOverdue(task);
        const isEditing = editingTaskId === task.id;
        const canDrag = !task.is_completed;

        return (
          <div
            key={task.id}
            className="relative transition-all duration-150"
            onDragOver={(event) => {
              event.preventDefault();
              if (!draggingTaskId || draggingTaskId === task.id) return;

              const rect = event.currentTarget.getBoundingClientRect();
              const position =
                event.clientY - rect.top >= rect.height / 2 ? "after" : "before";
              setDragOverTaskId(task.id);
              setDragOverPosition(position);
              onPreviewReorderTasks(draggingTaskId, task.id, position);
            }}
            onDrop={(event) => {
              event.preventDefault();
              onCommitReorderTasks();
              setDraggingTaskId(null);
              setDragOverTaskId(null);
            }}
            onDragEnd={() => {
              setDraggingTaskId(null);
              setDragOverTaskId(null);
            }}
          >
            {dragOverTaskId === task.id && dragOverPosition === "before" && (
              <span className="pointer-events-none absolute -top-1 left-3 right-3 h-0.5 rounded-full bg-[var(--app-accent)]" />
            )}
            {dragOverTaskId === task.id && dragOverPosition === "after" && (
              <span className="pointer-events-none absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-[var(--app-accent)]" />
            )}

            <div
              className={cn(
                "group rounded-xl border border-[var(--app-task-card-border)] bg-[var(--app-task-card-bg)] px-4 py-4 shadow-sm",
                viewMode === "grid"
                  ? "relative flex h-full min-h-[150px] flex-col"
                  : "flex items-center gap-3",
                draggingTaskId === task.id && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "inline-flex cursor-grab text-[var(--app-task-meta)]",
                  viewMode === "grid"
                    ? "absolute right-3 top-3 z-10 rounded-md bg-[var(--app-task-card-bg)]/90 p-1"
                    : "mt-0.5",
                  !canDrag && "cursor-not-allowed opacity-40",
                )}
                draggable={canDrag}
                onDragStart={(event) => {
                  if (!canDrag) {
                    event.preventDefault();
                    return;
                  }
                  event.dataTransfer.effectAllowed = "move";
                  setDraggingTaskId(task.id);
                }}
              >
                <GripVertical className="h-4 w-4" />
              </span>

              <div
                className={cn(
                  "flex flex-1 items-start gap-3",
                  viewMode === "grid" && "mb-2 w-full pr-8",
                )}
              >
                <button
                  onClick={() => onToggleTask(task.id, task.is_completed)}
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
                    task.is_completed
                      ? "border-[#47b67a] bg-[#47b67a] text-white"
                      : "border-[var(--app-border)] text-transparent hover:border-[var(--app-accent)]",
                  )}
                  aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>

                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={editingValue}
                        onChange={(event) => setEditingValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") void submitEdit(task);
                          if (event.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="h-9 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
                      />
                      <textarea
                        value={editingDescriptionValue}
                        onChange={(event) =>
                          setEditingDescriptionValue(event.target.value)
                        }
                        rows={2}
                        maxLength={240}
                        placeholder="Description (optional)"
                        className="w-full resize-none rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
                      />
                      <input
                        type="datetime-local"
                        value={editingEndDateValue}
                        onChange={(event) =>
                          setEditingEndDateValue(event.target.value)
                        }
                        className="h-9 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
                      />
                      <button
                        onClick={() => void submitEdit(task)}
                        className="rounded-md p-1.5 text-green-600 transition hover:bg-green-100"
                        aria-label="Save edit"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-md p-1.5 text-red-500 transition hover:bg-red-100"
                        aria-label="Cancel edit"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEdit(task)}
                      className={cn(
                        "rounded px-1 -mx-1",
                        !task.is_completed &&
                          "cursor-text transition hover:bg-[var(--app-chip-bg)]",
                      )}
                    >
                      <p
                        className={cn(
                          "text-base font-medium",
                          task.is_completed
                            ? "text-[var(--app-task-text-done)] line-through"
                            : "text-[var(--app-task-text)]",
                        )}
                      >
                        {task.text}
                      </p>
                      {task.description && (
                        <p
                          className={cn(
                            "mt-1 whitespace-pre-line text-sm leading-6",
                            task.is_completed
                              ? "text-[var(--app-task-text-done)]"
                              : "text-[var(--app-text-muted)]",
                          )}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--app-task-meta)]">
                    {selectedCategoryId === null && taskCategory && (
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[var(--app-chip-bg)] px-2 py-0.5 text-[var(--app-chip-text)]">
                        <CategoryIcon icon={taskCategory.icon} className="h-3 w-3" />
                        <span className="truncate">{taskCategory.name}</span>
                      </span>
                    )}
                    {task.end_date && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
                          overdue
                            ? "bg-[var(--app-badge-overdue-bg)] text-[var(--app-badge-overdue-text)]"
                            : "bg-[var(--app-badge-due-bg)] text-[var(--app-badge-due-text)]",
                        )}
                      >
                        <CalendarDays className="h-3 w-3" />
                        {overdue ? "Overdue: " : ""}
                        {new Date(task.end_date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "flex items-center gap-1",
                  viewMode === "grid" && "mt-auto justify-end",
                )}
              >
                <button
                  onClick={() => onRemoveTask(task.id)}
                  className="rounded-lg p-2 text-[var(--app-task-meta)] opacity-0 transition hover:bg-[var(--app-danger-hover-soft)] hover:text-red-500 group-hover:opacity-100"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
