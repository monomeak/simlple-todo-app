"use client";

import {
  Briefcase,
  CalendarCheck2,
  CheckSquare,
  Dumbbell,
  GraduationCap,
  Hash,
  Home,
  LucideIcon,
  PenLine,
  Plane,
  ShoppingCart,
  SmilePlus,
  Wallet,
} from "lucide-react";
import { cn } from "../../lib/utils";

const iconMap: Record<string, LucideIcon> = {
  hash: Hash,
  wallet: Wallet,
  "graduation-cap": GraduationCap,
  "pen-line": PenLine,
  plane: Plane,
  "smile-plus": SmilePlus,
  briefcase: Briefcase,
  home: Home,
  "shopping-cart": ShoppingCart,
  dumbbell: Dumbbell,
  "calendar-check-2": CalendarCheck2,
  check: CheckSquare,
};

const colorMap: Record<string, string> = {
  wallet: "text-emerald-500",
  "graduation-cap": "text-sky-500",
  "pen-line": "text-violet-500",
  plane: "text-amber-500",
  "smile-plus": "text-pink-500",
  briefcase: "text-indigo-500",
  home: "text-cyan-500",
  "shopping-cart": "text-orange-500",
  dumbbell: "text-lime-500",
  "calendar-check-2": "text-blue-500",
  check: "text-purple-500",
  hash: "text-[#8ea3d1]",
};

export default function CategoryIcon({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) {
  const key = (icon || "hash").toLowerCase();
  const Icon = iconMap[key] || Hash;

  return (
    <Icon
      className={cn("h-4 w-4", colorMap[key] || colorMap.hash, className)}
    />
  );
}
