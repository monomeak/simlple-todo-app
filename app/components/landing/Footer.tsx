import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-6 text-center text-sm text-[var(--app-text-muted)]">
      <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
        <span className="inline-flex items-center gap-1.5">
          Made with love
          <Heart className="h-4 w-4 text-[var(--app-accent)]" />
        </span>
        <span>•</span>
        <span>© {new Date().getFullYear()} All rights reserved</span>
      </div>
    </footer>
  );
}
