import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().min(5, "Project description must be at least 5 characters"),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").optional(),
  description: z.string().min(5, "Project description must be at least 5 characters").optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1, "Invalid user ID format"),
});
