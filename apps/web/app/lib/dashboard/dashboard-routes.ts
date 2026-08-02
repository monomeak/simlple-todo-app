import { SelectedView } from "./dashboard-types";

export function getDashboardPath(view: SelectedView = "all") {
  return view === "all" ? "/" : `/?view=${view}`;
}

export function getCategoryPath(
  categoryId: string,
  view: SelectedView = "all",
) {
  return view === "all"
    ? `/categories/${categoryId}`
    : `/categories/${categoryId}?view=${view}`;
}
