import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api";
import { Task, CreateTaskPayload, UpdateTaskPayload } from "@/types";
import { toast } from "sonner";
import { PROJECT_KEYS } from "./useProjects";

import { MOCK_TASKS } from "@/lib/mockData";

export const TASK_KEYS = {
  all: ["tasks"] as const,
  byProject: (projectId: string) => ["tasks", "project", projectId] as const,
  my: ["tasks", "my"] as const,
  detail: (id: string) => ["tasks", id] as const,
};

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: projectId ? TASK_KEYS.byProject(projectId) : TASK_KEYS.all,
    queryFn: async () => {
      try {
        const res = await tasksApi.getAll(projectId);
        return res.data.data as Task[];
      } catch {
        return projectId ? MOCK_TASKS.filter((t) => t.projectId === projectId) : MOCK_TASKS;
      }
    },
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: TASK_KEYS.my,
    queryFn: async () => {
      try {
        const res = await tasksApi.getMyTasks();
        return res.data.data as Task[];
      } catch {
        // Fall back to tasks assigned to 'member' by default in demo
        return MOCK_TASKS.filter((t) => t.assigneeId === "u3");
      }
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskPayload) => tasksApi.create(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.byProject(vars.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.detail(vars.projectId),
      });
      toast.success("Task created successfully");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to create task");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.my });
      toast.success("Task updated");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to update task");
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.my });
      toast.success("Task deleted");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to delete task");
    },
  });
}
