import { SelectedView } from "./dashboard-types";

export function isTaskOverdue(task: {
  is_completed: boolean;
  end_date: string | null;
}) {
  if (task.is_completed || !task.end_date) return false;

  return new Date(task.end_date).getTime() < Date.now();
}

export function getSelectedView(value: string | null): SelectedView {
  if (value === "todo" || value === "overdue") return value;
  return "all";
}

export function getTaskScopeKey(
  categoryId: string | null,
  selectedView: SelectedView,
) {
  return `${categoryId ?? "all"}::${selectedView}`;
}

export function getTaskLabel(count: number) {
  return count === 1 ? "task" : "tasks";
}
