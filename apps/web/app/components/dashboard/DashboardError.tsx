"use client";

export default function DashboardError({ message }: { message: string }) {
  return (
    <div className="mb-5 max-w-[980px] rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </div>
  );
}
