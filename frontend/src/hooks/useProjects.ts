import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api";
import { Project, CreateProjectPayload, UpdateProjectPayload } from "@/types";
import { toast } from "sonner";
import { MOCK_PROJECTS } from "@/lib/mockData";

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: PROJECT_KEYS.all,
    queryFn: async () => {
      try {
        const res = await projectsApi.getAll();
        return res.data.data as Project[];
      } catch {
        return MOCK_PROJECTS;
      }
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: async () => {
      try {
        const res = await projectsApi.getById(id);
        return res.data.data as Project;
      } catch {
        return MOCK_PROJECTS.find((p) => p.id === id) ?? MOCK_PROJECTS[0];
      }
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectPayload) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      toast.success("Project created successfully");
    },
    onError: () => {
      toast.info("Demo mode — changes won't persist without a backend");
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectPayload }) =>
      projectsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
      toast.success("Project updated");
    },
    onError: () => {
      toast.info("Demo mode — changes won't persist without a backend");
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      toast.success("Project deleted");
    },
    onError: () => {
      toast.info("Demo mode — changes won't persist without a backend");
    },
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectsApi.addMember(projectId, userId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      toast.success("Member added to project");
    },
    onError: () => {
      toast.info("Demo mode — changes won't persist without a backend");
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectsApi.removeMember(projectId, userId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      toast.success("Member removed");
    },
    onError: () => {
      toast.info("Demo mode — changes won't persist without a backend");
    },
  });
}
