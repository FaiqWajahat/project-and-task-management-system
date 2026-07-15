"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Task, TaskStatus } from "@/types";
import { useMyTasks, useUpdateTask } from "@/hooks/useTasks";
import { useAuth } from "@/providers/AuthProvider";
import { statusConfig, cn } from "@/lib/utils";
import { TaskCard } from "@/components/tasks/TaskCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { KanbanCardSkeleton } from "@/components/shared/Skeletons";
import { Badge } from "@/components/ui/badge";

const COLUMNS: { id: TaskStatus; title: string; color: string; accent: string }[] = [
  {
    id: "TODO",
    title: "To Do",
    color: "border-t-slate-400",
    accent: "bg-slate-400/10",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "border-t-blue-400",
    accent: "bg-blue-400/10",
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color: "border-t-emerald-400",
    accent: "bg-emerald-400/10",
  },
];

export default function TasksClient() {
  const { data: tasks, isLoading } = useMyTasks();
  const updateTask = useUpdateTask();

  const [columns, setColumns] = useState<Record<TaskStatus, Task[]>>({
    TODO: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  });

  useEffect(() => {
    if (tasks) {
      setColumns({
        TODO: tasks.filter((t) => t.status === "TODO"),
        IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
        COMPLETED: tasks.filter((t) => t.status === "COMPLETED"),
      });
    }
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const srcStatus = source.droppableId as TaskStatus;
    const dstStatus = destination.droppableId as TaskStatus;

    // Optimistic update
    const srcTasks = [...columns[srcStatus]];
    const dstTasks =
      srcStatus === dstStatus ? srcTasks : [...columns[dstStatus]];

    const [movedTask] = srcTasks.splice(source.index, 1);
    const updatedTask = { ...movedTask, status: dstStatus };

    if (srcStatus === dstStatus) {
      srcTasks.splice(destination.index, 0, updatedTask);
      setColumns((prev) => ({ ...prev, [srcStatus]: srcTasks }));
    } else {
      dstTasks.splice(destination.index, 0, updatedTask);
      setColumns((prev) => ({
        ...prev,
        [srcStatus]: srcTasks,
        [dstStatus]: dstTasks,
      }));
    }

    // Persist
    updateTask.mutate({ id: draggableId, data: { status: dstStatus } });
  };

  const totalTasks = tasks?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground mt-1">
          {totalTasks} task{totalTasks !== 1 ? "s" : ""} assigned to you
        </p>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{col.title}</span>
              </div>
              {[...Array(3)].map((_, i) => (
                <KanbanCardSkeleton key={i} />
              ))}
            </div>
          ))}
        </div>
      ) : totalTasks === 0 ? (
        <EmptyState
          type="tasks"
          title="No tasks assigned"
          description="You don't have any tasks yet. Ask your project manager to assign you tasks."
        />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
            {COLUMNS.map((col) => {
              const colTasks = columns[col.id];
              const config = statusConfig[col.id];
              return (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: COLUMNS.indexOf(col) * 0.1 }}
                  className="flex flex-col"
                >
                  {/* Column header */}
                  <div
                    className={cn(
                      "flex items-center justify-between mb-3 px-1"
                    )}
                  >
                    <span className="text-sm font-semibold">{col.title}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        config.bg,
                        config.color
                      )}
                    >
                      {colTasks.length}
                    </Badge>
                  </div>

                  {/* Droppable zone */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 rounded-xl border-2 border-t-4 p-3 space-y-3 transition-colors kanban-column",
                          col.color,
                          snapshot.isDraggingOver
                            ? cn("border-border bg-muted/50", col.accent)
                            : "border-border/40 bg-muted/20"
                        )}
                      >
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-border/30">
                            <p className="text-xs text-muted-foreground">
                              Drop tasks here
                            </p>
                          </div>
                        )}

                        {colTasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "transition-transform",
                                  snapshot.isDragging &&
                                    "rotate-1 shadow-2xl scale-105"
                                )}
                              >
                                <TaskCard task={task} draggable />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </motion.div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
