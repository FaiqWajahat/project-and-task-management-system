"use client";

import { motion } from "framer-motion";
import { FolderOpen, CheckSquare, Users, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

const icons = {
  projects: FolderOpen,
  tasks: CheckSquare,
  users: Users,
  default: Inbox,
};

interface EmptyStateProps {
  type?: keyof typeof icons;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  type = "default",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-muted border border-border/50">
          <Icon className="h-9 w-9 text-muted-foreground" />
        </div>
      </div>

      {/* Decorative dots */}
      <div className="flex gap-1.5 mb-6">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
