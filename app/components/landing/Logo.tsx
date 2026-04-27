import { CheckSquare } from "lucide-react";
import Link from "next/link";

interface logoConfig {
  height?: number;
  width?: number;
  disableText?: boolean;
}
export default function AppLogo({
  height = 9,
  width = 9,
  disableText = false,
}: logoConfig) {
  const iconSize = Math.max(Math.min(height, width) - 4, 4);
  // check for
  return (
    <Link href="/" className="flex items-center gap-2 sm:gap-3">
      <span
        className="grid  place-items-center rounded-xl bg-[var(--app-sidebar-active)] text-[var(--app-sidebar-text)]"
        style={{ height: `${height * 0.25}rem`, width: `${width * 0.25}rem` }}
      >
        <CheckSquare
          style={{
            height: `${iconSize * 0.25}rem`,
            width: `${iconSize * 0.25}rem`,
          }}
        />
      </span>

      <>
        {!disableText && (
          <span className="text-lg font-extrabold tracking-tight text-[var(--app-sidebar-text)]">
            MyTodo
          </span>
        )}
      </>
    </Link>
  );
}
