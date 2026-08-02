// Server component
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative scroll-mt-24 overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 sm:p-12"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[var(--app-chip-bg)] opacity-70 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[var(--app-accent)]/15 opacity-70 blur-2xl" />

      <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-chip-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-chip-text)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--app-accent)]" />
            Minimal Task Platform
          </span>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--app-text)] sm:text-5xl">
            Keep work clear.
            <br />
            Finish what matters.
          </h1>

          <p className="mt-4 max-w-2xl text-base text-[var(--app-text-muted)] sm:text-lg">
            MyTodo is a minimalist task management app for personal focus. Plan
            tasks, organize categories, and move through your day with less
            noise and more action.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--app-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--app-accent-hover)]"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#features"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-3 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-chip-bg)]"
            >
              Explore Features
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-task-card-bg)] p-5 shadow-lg sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--app-border)] pb-4">
            <p className="text-sm font-semibold text-[var(--app-text)]">
              Today&apos;s Focus
            </p>
            <span className="rounded-full bg-[var(--app-chip-bg)] px-2 py-0.5 text-xs text-[var(--app-chip-text)]">
              Live
            </span>
          </div>

          <div className="space-y-3">
            {["Plan sprint tasks", "Review overdue items", "Ship feature update"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-[var(--app-accent)]" />
                  <span className="text-sm text-[var(--app-text-muted)]">
                    {item}
                  </span>
                </div>
              ),
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat label="Users" value="200+" />
            <Stat label="Tasks" value="5000+" />
            <Stat label="Satisfied" value="190+" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--app-surface)] p-2 text-center">
      <p className="text-[10px] font-semibold uppercase text-[var(--app-text-muted)]">
        {label}
      </p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
