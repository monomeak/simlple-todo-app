import Features from "./components/Features";
import Footer from "./components/Footer";
import HeaderClient from "./components/HeaderClient";
import Hero from "./components/Hero";


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

export default function Page() {
  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-gray-900 dark:text-gray-100">
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