import { CheckCircle2, FolderPlus, LayoutGrid, ListChecks } from "lucide-react";

const features = [
  {
    title: "Create Tasks",
    description:
      "Add tasks with clear due date and time, then track them by status.",
    icon: ListChecks,
  },
  {
    title: "Create Categories",
    description:
      "Group work with custom categories so your board stays organized.",
    icon: FolderPlus,
  },
  {
    title: "Focus Views",
    description:
      "Move fast between all, todo, overdue, and category-specific lists.",
    icon: LayoutGrid,
  },
];

const benefits = [
  "Modern, clean interface with responsive design.",
  "Task ordering, drag-and-drop, and smart status grouping.",
  "Simple auth flow with secure token handling.",
  "Built for daily consistency with minimal setup.",
];

export default function Features() {
  return (
    <>
      <section id="features" className="scroll-mt-24">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--app-accent)]">
              Features
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-3xl">
              What You Can Do
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="inline-flex rounded-lg bg-[var(--app-chip-bg)] p-2 text-[var(--app-accent)]">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="benefits"
        className="scroll-mt-24 rounded-3xl border border-gray-200 bg-gray-50 p-7 dark:border-gray-700 dark:bg-gray-800 sm:p-9"
      >
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--app-accent)]">
          Benefits
        </p>

        <h2 className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-3xl">
          Why People Join MyTodo
        </h2>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-700/50"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-accent)]" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-24 grid gap-5 md:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-7 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--app-accent)]">
            About Us
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Built for focused teams
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            We design practical software that helps people ship work every day.
            MyTodo is the starting point: fast setup, clear structure, and just
            enough features to stay productive.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-chip-bg)] p-7 dark:bg-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Ready to get started?
          </h3>

          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Create your account and begin planning your day in minutes.
          </p>

          <a
            href="/auth"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--app-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--app-accent-hover)]"
          >
            Sign In
          </a>
        </div>
      </section>
    </>
  );
}