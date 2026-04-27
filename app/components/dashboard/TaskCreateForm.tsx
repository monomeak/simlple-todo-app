"use client";

import { Plus } from "lucide-react";

interface TaskCreateFormProps {
  inputValue: string;
  descriptionValue: string;
  endDateValue: string;
  selectedCategoryName?: string;
  isSubmitting: boolean;
  titleWarning?: string;
  dateWarning?: string;
  onInputChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}

export default function TaskCreateForm({
  inputValue,
  descriptionValue,
  endDateValue,
  selectedCategoryName,
  isSubmitting,
  titleWarning,
  dateWarning,
  onInputChange,
  onDescriptionChange,
  onEndDateChange,
  onSubmit,
}: TaskCreateFormProps) {
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  const minDate = localNow.toISOString().slice(0, 10);
  const minTime = localNow.toISOString().slice(11, 16);
  const selectedDate = endDateValue.slice(0, 10);
  const selectedTime = endDateValue.slice(11, 16);

  const handleDateChange = (dateValue: string) => {
    if (!dateValue) {
      onEndDateChange("");
      return;
    }
    onEndDateChange(`${dateValue}T${selectedTime || minTime}`);
  };

  const handleTimeChange = (timeValue: string) => {
    if (!timeValue) return;
    onEndDateChange(`${selectedDate || minDate}T${timeValue}`);
  };

  return (
    <div className="mb-6 max-w-[980px] space-y-2">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div>
          <input
            type="text"
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void onSubmit();
            }}
            disabled={isSubmitting}
            placeholder={`Add a task to ${selectedCategoryName || "Your Tasks"}...`}
            data-testid="task-input"
            className="h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-base text-[var(--app-text)] shadow-sm placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
          />
          {titleWarning && (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              {titleWarning}
            </p>
          )}
        </div>

        <div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={selectedDate}
              min={minDate}
              onChange={(event) => handleDateChange(event.target.value)}
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-base text-[var(--app-text)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
            />
            <input
              type="time"
              value={selectedTime}
              min={selectedDate === minDate ? minTime : undefined}
              step={60}
              onChange={(event) => handleTimeChange(event.target.value)}
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-base text-[var(--app-text)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
            />
          </div>
          {dateWarning && (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              {dateWarning}
            </p>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-6 text-base font-semibold text-white transition hover:bg-[var(--app-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <textarea
        value={descriptionValue}
        onChange={(event) => onDescriptionChange(event.target.value)}
        disabled={isSubmitting}
        rows={2}
        maxLength={240}
        placeholder="Description (optional)"
        className="w-full resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm text-[var(--app-text)] shadow-sm placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
      />
    </div>
  );
}
