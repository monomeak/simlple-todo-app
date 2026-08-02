"use client";

import { useMemo, useState } from "react";
import { Info, X } from "lucide-react";
import { cn } from "../../lib/utils";
import CategoryIcon from "./CategoryIcon";

import { iconOptions } from "@/app/lib/dashboard/icon-options";
type IconOption = (typeof iconOptions)[number];

export default function CategoryModal({
  open,
  mode,
  initialValues,
  isSubmitting = false,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: {
    name?: string;
    description?: string | null;
    icon?: string | null;
  };
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    icon?: string;
    description?: string;
  }) => Promise<void>;
}) {
  if (!open) return null;

  return (
    <CategoryModalForm
      key={`${mode}-${initialValues?.name ?? ""}-${initialValues?.icon ?? ""}`}
      mode={mode}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function CategoryModalForm({
  mode,
  initialValues,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialValues?: {
    name?: string;
    description?: string | null;
    icon?: string | null;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    icon?: string;
    description?: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [selectedIcon, setSelectedIcon] = useState(
    initialValues?.icon?.trim() || "briefcase",
  );
  const [isNameCustom, setIsNameCustom] = useState(
    Boolean(initialValues?.name),
  );
  const [isDescriptionCustom, setIsDescriptionCustom] = useState(
    Boolean(initialValues?.description),
  );
  const initialName = initialValues?.name || "Current";
  const initialDescription =
    initialValues?.description || "Custom category for your tasks.";

  const mergedIconOptions = useMemo(() => {
    const hasCurrent = iconOptions.some((item) => item.icon === selectedIcon);
    if (hasCurrent || !selectedIcon) return iconOptions;
    return [
      {
        label: "Current",
        icon: selectedIcon,
        name: initialName,
        description: initialDescription,
      },
      ...iconOptions,
    ];
  }, [initialDescription, initialName, selectedIcon]);

  const canSubmit = name.trim().length > 0 && !isSubmitting;

  const selectIconOption = (option: IconOption) => {
    setSelectedIcon(option.icon);
    if (!isNameCustom) {
      setName(option.name);
    }
    setDescription((currentDescription) => {
      if (isDescriptionCustom) {
        return currentDescription;
      }

      return option.description;
    });
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 px-4">
      <div className="w-full max-w-xl rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 text-[var(--app-text)] shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Create Category" : "Update Category"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--app-text-muted)] hover:bg-[var(--app-chip-bg)]"
            aria-label="Close category modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <CategoryIcon
              icon={selectedIcon}
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            />
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setIsNameCustom(true);
              }}
              maxLength={50}
              placeholder="Category name"
              className="h-11 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Choose an icon</p>
            <div className="flex flex-wrap gap-2">
              {mergedIconOptions.map((item) => {
                const active = selectedIcon === item.icon;
                return (
                  <button
                    key={`${item.label}-${item.icon}`}
                    type="button"
                    onClick={() => selectIconOption(item)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-white"
                        : "border-[var(--app-border)] hover:bg-[var(--app-chip-bg)]",
                    )}
                  >
                    <CategoryIcon
                      icon={item.icon}
                      className={active ? "text-white" : undefined}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Description</p>
            <textarea
              rows={3}
              maxLength={120}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setIsDescriptionCustom(true);
              }}
              placeholder="Write a short description for this category..."
              className="w-full resize-none rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
            />
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-[var(--app-chip-bg)] p-3 text-sm text-[var(--app-chip-text)]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Categories help organize tasks by context and keep your workflow
            tidy.
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--app-chip-bg)]"
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit}
              onClick={() =>
                onSubmit({
                  name: name.trim(),
                  icon: selectedIcon,
                  description: description.trim() || undefined,
                })
              }
              className="rounded-lg bg-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--app-accent-hover)] disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create category"
                  : "Update category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
