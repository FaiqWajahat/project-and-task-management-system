"use client";

import { motion } from "framer-motion";
import { useAllActivity } from "@/hooks/useActivity";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { ActivitySkeleton } from "@/components/shared/Skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function ActivityClient() {
  const { data: activity, isLoading } = useAllActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Feed</h1>
        <p className="text-muted-foreground mt-1">
          Real-time audit trail of all platform actions
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Recent Actions
              {activity && (
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  ({activity.length} events)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ActivitySkeleton rows={10} />
            ) : (
              <ActivityFeed activities={activity ?? []} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
