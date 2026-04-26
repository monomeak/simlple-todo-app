import Link from "next/link";
import AppLogo from "../components/Logo";
import AuthForm from "../components/AuthForm";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Create Account | MyTodo",
  description: "Create a new MyTodo account.",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex justify-center">
          <AppLogo width={20} height={20} disableText={true} />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Create account
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Start organizing your tasks with MyTodo.
          </p>
        </div>

        <AuthForm mode="signup" />

        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className=" flex gap-2 text-sm font-medium text-[var(--app-accent)] hover:underline"
          >
            <ArrowLeft />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
