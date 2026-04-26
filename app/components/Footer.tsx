import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
      <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
        <span className="inline-flex items-center gap-1.5">
          MyTodo team created with love
          <Heart className="h-4 w-4 text-[var(--app-accent)]" />
        </span>
        <span>•</span>
        <span>© {new Date().getFullYear()} All rights reserved</span>
      </div>
    </footer>
  );
}
