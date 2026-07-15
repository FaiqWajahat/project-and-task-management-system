// ============================================================
// Global TypeScript Types for the Task Management Platform
// ============================================================

// ── Enums ──────────────────────────────────────────────────
export type UserRole = "ADMIN" | "MANAGER" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

// ── Core Models ────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  managerId: string;
  manager: User;
  members: User[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  project: Project;
  assigneeId: string | null;
  assignee: User | null;
  assigneeIds?: string[];
  assignees?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  user: User;
  projectId: string;
  taskId: string | null;
  createdAt: string;
}

// ── Auth ────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// ── API Responses ───────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Form Payloads ───────────────────────────────────────────
export interface CreateProjectPayload {
  name: string;
  description: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string;
  assigneeIds?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  assigneeIds?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
}

// ── UI Helpers ───────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface StatsCard {
  label: string;
  value: number | string;
  icon: string;
  trend?: number;
  color: string;
}
