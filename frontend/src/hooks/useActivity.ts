import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/lib/api";
import { ActivityLog } from "@/types";

import { MOCK_ACTIVITY } from "@/lib/mockData";

export const ACTIVITY_KEYS = {
  project: (id: string) => ["activity", "project", id] as const,
  all: ["activity"] as const,
};

export function useProjectActivity(projectId: string) {
  return useQuery({
    queryKey: ACTIVITY_KEYS.project(projectId),
    queryFn: async () => {
      try {
        const res = await activityApi.getProjectActivity(projectId);
        return res.data.data as ActivityLog[];
      } catch {
        return MOCK_ACTIVITY.filter((a) => a.projectId === projectId);
      }
    },
    enabled: !!projectId,
    refetchInterval: 30000, // auto-refresh every 30s
  });
}

export function useAllActivity() {
  return useQuery({
    queryKey: ACTIVITY_KEYS.all,
    queryFn: async () => {
      try {
        const res = await activityApi.getAll();
        return res.data.data as ActivityLog[];
      } catch {
        return MOCK_ACTIVITY;
      }
    },
    refetchInterval: 30000,
  });
}
