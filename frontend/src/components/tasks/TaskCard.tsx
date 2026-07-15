"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Calendar, User } from "lucide-react";
import { Task, TaskStatus } from "@/types";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useAuth } from "@/providers/AuthProvider";
import {
  statusConfig,
  priorityConfig,
  formatDate,
  getInitials,
  getAvatarGradient,
  cn,
} from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskDialog } from "./TaskDialog";

interface TaskCardProps {
  task: Task;
  draggable?: boolean;
}

export function TaskCard({ task, draggable = false }: TaskCardProps) {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const canEdit =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    (!!user?.id && task.assigneeIds?.includes(user.id)) ||
    task.assigneeId === user?.id;

  const canDelete = user?.role === "ADMIN" || user?.role === "MANAGER";

  const handleStatusChange = (status: string | null) => {
    if (!status) return;
    updateTask.mutate({ id: task.id, data: { status: status as TaskStatus } });
  };

  const handleDelete = async () => {
    await deleteTask.mutateAsync(task.id);
    setDeleteOpen(false);
  };

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const isPending = updateTask.isPending || deleteTask.isPending;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Card
          className={cn(
            "group border-border/50 hover:border-border transition-colors relative overflow-hidden",
            draggable && "cursor-grab active:cursor-grabbing",
            isPending && "opacity-50 pointer-events-none"
          )}
        >
          {isPending && (
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="text-xs font-semibold text-muted-foreground animate-pulse">
                {deleteTask.isPending ? "Deleting..." : "Updating..."}
              </span>
            </div>
          )}
          <CardContent className="p-4 space-y-3">
            {/* Header: title + actions */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm leading-snug flex-1">
                {task.title}
              </h4>
              {(canEdit || canDelete) && (
                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Priority badge */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("text-xs gap-1.5", priority.bg, priority.color)}
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", priority.dot)}
                />
                {priority.label}
              </Badge>
            </div>

            {/* Status select + assignee */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
              {canEdit ? (
                <Select
                  value={task.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="h-7 text-xs border-0 bg-transparent p-0 w-auto gap-1 focus:ring-0">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", status.bg, status.color)}
                    >
                      <SelectValue />
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  variant="outline"
                  className={cn("text-xs", status.bg, status.color)}
                >
                  {status.label}
                </Badge>
              )}

              <div className="flex items-center gap-1.5">
                {task.assignees && task.assignees.length > 0 ? (
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {task.assignees.map((assignee) => (
                      <Avatar key={assignee.id} className="h-5 w-5 border border-background">
                        <AvatarFallback
                          className={cn(
                            "text-[8px] font-bold text-white bg-gradient-to-br",
                            getAvatarGradient(assignee.name)
                          )}
                        >
                          {getInitials(assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground max-w-[120px] truncate">
                  {task.assignees && task.assignees.length > 0
                    ? task.assignees.length === 1
                      ? task.assignees[0].name
                      : `${task.assignees.length} assigned`
                    : "Unassigned"}
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
              <Calendar className="h-3 w-3" />
              {formatDate(task.createdAt)}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <TaskDialog open={editOpen} onOpenChange={setEditOpen} task={task} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Delete <strong>{task.title}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
            >
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
