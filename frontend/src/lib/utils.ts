import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { TaskPriority, TaskStatus, UserRole } from "@/types";

// ── Tailwind class merger ────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date formatters ──────────────────────────────────────────
export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ── Task Status helpers ──────────────────────────────────────
export const statusConfig: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  TODO: {
    label: "To Do",
    color: "text-slate-400",
    bg: "bg-slate-400/10 border-slate-400/30",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/30",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/30",
  },
};

// ── Task Priority helpers ────────────────────────────────────
export const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; bg: string; dot: string }
> = {
  LOW: {
    label: "Low",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/30",
    dot: "bg-emerald-400",
  },
  MEDIUM: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/30",
    dot: "bg-amber-400",
  },
  HIGH: {
    label: "High",
    color: "text-rose-400",
    bg: "bg-rose-400/10 border-rose-400/30",
    dot: "bg-rose-400",
  },
};

// ── Role helpers ─────────────────────────────────────────────
export const roleConfig: Record<
  UserRole,
  { label: string; color: string; bg: string }
> = {
  ADMIN: {
    label: "Admin",
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/30",
  },
  MANAGER: {
    label: "Manager",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/30",
  },
  MEMBER: {
    label: "Member",
    color: "text-slate-400",
    bg: "bg-slate-400/10 border-slate-400/30",
  },
};

// ── Progress calculator ──────────────────────────────────────
export function getProjectProgress(tasks: { status: TaskStatus }[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  return Math.round((completed / tasks.length) * 100);
}

// ── Avatar initials ───────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Avatar color from name ────────────────────────────────────
const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-600",
];

export function getAvatarGradient(name: string): string {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}
