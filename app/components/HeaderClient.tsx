"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckSquare,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Benefits", href: "#benefits" },
  { label: "About", href: "#about" },
];

const themeChangeEvent = "todoapp-theme-change";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  const storedTheme = localStorage.getItem("theme");

  return storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : null;
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return getStoredTheme() ?? getSystemTheme();
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(themeChangeEvent, onStoreChange);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(themeChangeEvent, onStoreChange);
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export default function HeaderClient() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const isDarkMode = theme === "dark";

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme: Theme = isDarkMode ? "light" : "dark";

    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    window.dispatchEvent(new Event(themeChangeEvent));
  };

  const handleSmoothScroll = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();

    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsNavOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95">
      <nav
        aria-label="Primary"
        className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6"
      >
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--app-sidebar-active)] text-[var(--app-sidebar-text)]">
            <CheckSquare className="h-5 w-5" />
          </span>

          <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            MyTodo
          </span>
        </Link>

        <div className="hidden items-center justify-center gap-2 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => handleSmoothScroll(event, item.href)}
              className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-[var(--app-accent)] dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 justify-self-end md:flex">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--app-accent-hover)]"
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          onClick={() => setIsNavOpen((prev) => !prev)}
          className="inline-flex justify-self-end rounded-lg border border-gray-200 bg-white p-2 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isNavOpen}
        >
          {isNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isNavOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900 md:hidden">
          <div className="flex flex-col gap-2.5">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleSmoothScroll(event, item.href)}
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[var(--app-accent)] dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {item.label}
              </a>
            ))}

            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </>
              )}
            </button>

            <Link
              href="/auth"
              onClick={() => setIsNavOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--app-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--app-accent-hover)]"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
