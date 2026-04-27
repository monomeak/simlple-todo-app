import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function DashboardHome({
  categoryId = null,
}: {
  categoryId?: string | null;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--app-shell-bg)] px-6 py-10 text-[var(--app-text-muted)]">
          Loading dashboard...
        </div>
      }
    >
      <DashboardClient initialCategoryId={categoryId} />
    </Suspense>
  );
}
