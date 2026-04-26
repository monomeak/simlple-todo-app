"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type AuthMode = "signup" | "login";
interface AuthFormProps {
  mode: AuthMode;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isSignUp = mode === "signup";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }
    if (isSignUp && !name) {
      setLocalError("Please enter your name");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      const endpoint = isSignUp ? "/api/v1/auth/signup" : "/api/v1/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: isSignUp ? name : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }
      window.location.href = "/dashboard";
    } catch {
      setLocalError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* allow full name visible for signup */}
        {isSignUp && (
          <FloatingInput
            label="Full Name"
            type="text"
            value={name}
            onChange={setName}
          ></FloatingInput>
        )}

        <FloatingInput
          label="Email"
          type="text"
          value={email}
          onChange={setEmail}
        ></FloatingInput>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event?.target.value)}
            placeholder=""
            className="peer h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 pb-2 pt-4 pr-11 text-gray-900 transition-all focus:border-[var(--app-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/20 dark:text-gray-100"
          ></input>

          <label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-[var(--app-surface)] px-1 text-sm text-gray-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[var(--app-accent)] peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:text-xs dark:text-gray-400">
            Password
          </label>

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {localError && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {localError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-[var(--app-accent)] py-2.5 font-semibold text-white transition-all hover:bg-[var(--app-accent-hover)] disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Authenticating...
            </span>
          ) : isSignUp ? (
            "Create Account"
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isSignUp ? "Already have an account?" : " Don't have an account?"}
          <Link
            href={isSignUp ? "/login" : "/signup"}
            className="ml-2 font-medium text-[var(--app-accent)] hover:text-[var(--app-accent-hover)]"
          >
            {isSignUp ? "Login" : "Sign Up"}
          </Link>
        </p>
      </div>
    </>
  );
}

function FloatingInput({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;

  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder=""
        className="peer h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 pt-4 text-gray-900 transition-all focus:border-[var(--app-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/20 dark:text-gray-100"
      />

      <label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-[var(--app-surface)] px-1 text-sm text-gray-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[var(--app-accent)] peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:text-xs dark:text-gray-400">
        {label}
      </label>
    </div>
  );
}
