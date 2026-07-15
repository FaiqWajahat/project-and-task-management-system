"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ActivityLog } from "@/types";
import { timeAgo, getInitials, getAvatarGradient, cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/EmptyState";

interface ActivityFeedProps {
  activities: ActivityLog[];
  compact?: boolean;
}

export function ActivityFeed({ activities, compact = false }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <EmptyState
        type="default"
        title="No activity yet"
        description="Actions like creating tasks, updating statuses, and team changes will appear here."
      />
    );
  }

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {activities.slice(0, compact ? 8 : 50).map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0"
          >
            {/* Timeline dot + avatar */}
            <div className="flex flex-col items-center">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-[10px] font-bold text-white bg-gradient-to-br",
                    getAvatarGradient(activity.user?.name || "U")
                  )}
                >
                  {getInitials(activity.user?.name || "U")}
                </AvatarFallback>
              </Avatar>
              {i < activities.length - 1 && (
                <div className="w-px flex-1 bg-border/40 mt-1 min-h-[12px]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm leading-relaxed">
                <span className="font-medium">{activity.user?.name}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {timeAgo(activity.createdAt)}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
