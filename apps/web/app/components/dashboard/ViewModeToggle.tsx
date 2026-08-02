"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ViewMode } from "../../lib/dashboard/dashboard-types";

export default function ViewModeToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-1">
      <button
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition",
          value === "list"
            ? "bg-[var(--app-accent)] text-white"
            : "text-[var(--app-text-muted)] hover:bg-[var(--app-chip-bg)]",
        )}
      >
        <List className="h-3.5 w-3.5" />
        List
      </button>
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition",
          value === "grid"
            ? "bg-[var(--app-accent)] text-white"
            : "text-[var(--app-text-muted)] hover:bg-[var(--app-chip-bg)]",
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Grid
      </button>
    </div>
  );
}
