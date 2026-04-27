import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SessionRefresh from "./components/auth/SessionRefresh";
import Features from "./components/landing/Features";
import Footer from "./components/landing/Footer";
import HeaderClient from "./components/landing/HeaderClient";
import Hero from "./components/landing/Hero";
import { isAccessTokenActive } from "./lib/auth-token";

const ACCESS_TOKEN_COOKIE = "access_token";

export const metadata = {
  title: "MyTodo | Simple Task Management App for Daily Productivity",
  description:
    "MyTodo is a lightweight task management app to organize tasks, track priorities, and stay productive with a clean, focused workflow.",
  keywords: [
    "task management app",
    "todo app",
    "productivity app",
    "daily planner",
    "organize tasks",
    "task tracker",
  ],
};

export default async function Page() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (isAccessTokenActive(accessToken)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--app-shell-bg)] text-[var(--app-text)] transition-colors">
      <SessionRefresh redirectTo="/dashboard" />
      <HeaderClient />

      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
        <div className="space-y-10 sm:space-y-14 lg:space-y-16">
          <Hero />
          <Features />
        </div>
      </main>

      <Footer />
    </div>
  );
}
