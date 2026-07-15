"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Task, TaskStatus, TaskPriority } from "@/types";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useProject } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { cn, getInitials, getAvatarGradient } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assigneeIds: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  task?: Task; // edit mode
}

export function TaskDialog({
  open,
  onOpenChange,
  projectId,
  task,
}: TaskDialogProps) {
  const isEdit = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const targetProjectId = projectId || task?.projectId;
  const { data: project } = useProject(targetProjectId as string);

  // Get project members and the project manager
  const eligibleAssignees = (() => {
    if (!project) return [];
    const list = [...(project.members || [])];
    if (project.manager && !list.some((m) => m.id === project.manager.id)) {
      list.unshift(project.manager);
    }
    return list;
  })();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeIds: task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []),
        }
      : {
          status: "TODO",
          priority: "MEDIUM",
          assigneeIds: [],
        },
  });

  const onSubmit = async (data: FormData) => {
    if (isEdit && task) {
      await updateTask.mutateAsync({ id: task.id, data });
    } else if (projectId) {
      await createTask.mutateAsync({ ...data, projectId });
    }
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update task details." : "Add a new task to this project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="e.g. Design landing page"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              placeholder="Task details..."
              rows={3}
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => v && setValue("status", v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={watch("priority")}
                onValueChange={(v) => v && setValue("priority", v as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignees</Label>
            <div className="border border-border/80 rounded-lg p-2 bg-background/50 max-h-[160px] overflow-y-auto space-y-1">
              {eligibleAssignees.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2 text-center">No project members available</p>
              ) : (
                eligibleAssignees.map((u) => {
                  const isChecked = (watch("assigneeIds") || []).includes(u.id);
                  return (
                    <div
                      key={u.id}
                      className={cn(
                        "flex items-center justify-between p-1.5 px-2.5 rounded-md hover:bg-accent/50 cursor-pointer transition-colors",
                        isChecked && "bg-accent/40 text-accent-foreground"
                      )}
                      onClick={() => {
                        const current = watch("assigneeIds") || [];
                        if (isChecked) {
                          setValue("assigneeIds", current.filter((id) => id !== u.id));
                        } else {
                          setValue("assigneeIds", [...current, u.id]);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback
                            className={cn(
                              "text-[8px] font-bold text-white bg-gradient-to-br",
                              getAvatarGradient(u.name)
                            )}
                          >
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{u.name}</span>
                        <span className="text-[9px] text-muted-foreground bg-secondary/80 px-1 py-0.2 rounded border border-border/40">
                          {u.role.toLowerCase()}
                        </span>
                      </div>
                      <div className={cn(
                        "h-3.5 w-3.5 rounded border border-primary/60 flex items-center justify-center transition-all",
                        isChecked ? "bg-primary text-primary-foreground border-primary" : "bg-transparent"
                      )}>
                        {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                ? "Save Changes"
                : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
