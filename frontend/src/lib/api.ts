import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send HttpOnly cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if it is an initial check (/auth/me) or if we are already on auth pages
      if (typeof window !== "undefined") {
        const isAuthPage =
          window.location.pathname === "/login" ||
          window.location.pathname === "/register";
        const isMeRequest = error.config?.url?.endsWith("/auth/me");

        if (!isAuthPage && !isMeRequest) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (name: string, email: string, password: string, role?: string) =>
    api.post("/auth/register", { name, email, password, role }),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// ── Users ─────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => api.get("/users"),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: object) => api.post("/users", data),
  update: (id: string, data: object) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ── Projects ──────────────────────────────────────────────────
export const projectsApi = {
  getAll: () => api.get("/projects"),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: object) => api.post("/projects", data),
  update: (id: string, data: object) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (projectId: string, userId: string) =>
    api.post(`/projects/${projectId}/members`, { userId }),
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
};

// ── Tasks ────────────────────────────────────────────────────
export const tasksApi = {
  getAll: (projectId?: string) =>
    api.get("/tasks", { params: projectId ? { projectId } : undefined }),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: object) => api.post("/tasks", data),
  update: (id: string, data: object) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  getMyTasks: () => api.get("/tasks/my"),
};

// ── Activity ──────────────────────────────────────────────────
export const activityApi = {
  getProjectActivity: (projectId: string) =>
    api.get(`/projects/${projectId}/activity`),
  getAll: () => api.get("/activity"),
};
