import { ReactNode } from "react";

export const metadata = {
  title: "Dashboard | MyTodo",
  description: "Manage your tasks easily.",
};
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
