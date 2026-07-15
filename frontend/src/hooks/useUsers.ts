import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { User, UpdateUserPayload } from "@/types";
import { toast } from "sonner";
import { MOCK_USERS } from "@/lib/mockData";

export const USER_KEYS = {
  all: ["users"] as const,
  detail: (id: string) => ["users", id] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: USER_KEYS.all,
    queryFn: async () => {
      try {
        const res = await usersApi.getAll();
        return res.data.data as User[];
      } catch {
        return MOCK_USERS;
      }
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: async () => {
      try {
        const res = await usersApi.getById(id);
        return res.data.data as User;
      } catch {
        return MOCK_USERS.find((u) => u.id === id) ?? MOCK_USERS[0];
      }
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User> & { password: string }) =>
      usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success("User created successfully");
    },
    onError: () => {
      toast.info("Demo mode — changes won't persist without a backend");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success("User updated successfully");
    },
    onError: () => {
      toast.info("Demo mode — changes won't persist without a backend");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.info("Demo mode — changes won't persist without a backend");
    },
  });
}
