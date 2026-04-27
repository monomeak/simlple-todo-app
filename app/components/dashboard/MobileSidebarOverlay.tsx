"use client";

import { cn } from "../../lib/utils";

export default function MobileSidebarOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <button
      aria-label="Close menu"
      onClick={onClose}
      className={cn(
        "fixed inset-0 z-40 bg-black/45 transition-opacity duration-200 md:hidden",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    />
  );
}
