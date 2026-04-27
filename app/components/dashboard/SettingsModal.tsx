"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { User } from "../../lib/dashboard/dashboard-types";

export default function SettingsModal({
  open,
  user,
  onClose,
  onUpdateProfile,
  onUpdatePassword,
}: {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUpdateProfile: (payload: { name?: string; email?: string }) => Promise<void>;
  onUpdatePassword: (payload: {
    current_password: string;
    new_password: string;
  }) => Promise<void>;
}) {
  if (!open) return null;

  return (
    <SettingsModalForm
      key={`${user?.id ?? "none"}-${user?.name ?? ""}`}
      user={user}
      onClose={onClose}
      onUpdateProfile={onUpdateProfile}
      onUpdatePassword={onUpdatePassword}
    />
  );
}

function SettingsModalForm({
  user,
  onClose,
  onUpdateProfile,
  onUpdatePassword,
}: {
  user: User | null;
  onClose: () => void;
  onUpdateProfile: (payload: { name?: string; email?: string }) => Promise<void>;
  onUpdatePassword: (payload: {
    current_password: string;
    new_password: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    document.documentElement.style.colorScheme = checked ? "dark" : "light";
    localStorage.setItem("theme", checked ? "dark" : "light");
    window.dispatchEvent(new Event("todoapp-theme-change"));
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setMessage(null);
    try {
      await onUpdateProfile({ name: name.trim(), email });
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setIsSavingPassword(true);
    setMessage(null);
    try {
      await onUpdatePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 px-4">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 text-[var(--app-text)] shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--app-text-muted)] hover:bg-[var(--app-chip-bg)]"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {message && (
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-chip-bg)] px-3 py-2 text-sm">
              {message}
            </div>
          )}

          <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--app-border)] p-3">
            <span className="text-sm font-medium">Dark theme</span>
            <input
              type="checkbox"
              checked={isDark}
              onChange={(event) => toggleTheme(event.target.checked)}
              className="h-5 w-5 accent-[var(--app-accent)]"
            />
          </label>

          <form onSubmit={saveProfile} className="rounded-lg border border-[var(--app-border)] p-3">
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  className="mt-1 h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
                />
              </label>
              <label className="block text-sm font-medium">
                Email
                <input
                  value={email}
                  disabled
                  className="mt-1 h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-chip-bg)] px-3 text-sm text-[var(--app-text-muted)]"
                />
              </label>
              <div className="flex justify-end">
                <button
                  disabled={isSavingProfile}
                  className="rounded-lg bg-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isSavingProfile ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </form>

          <form onSubmit={savePassword} className="rounded-lg border border-[var(--app-border)] p-3">
            <h3 className="mb-3 text-sm font-semibold">Change password</h3>
            <div className="space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Current password"
                minLength={6}
                required
                className="h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password"
                minLength={6}
                required
                className="h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                minLength={6}
                required
                className="h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
              />
              <div className="flex justify-end">
                <button
                  disabled={isSavingPassword}
                  className="rounded-lg bg-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isSavingPassword ? "Updating..." : "Update password"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
