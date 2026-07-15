"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, Users } from "lucide-react";
import { useProject, useDeleteProject } from "@/hooks/useProjects";
import { useProjectActivity } from "@/hooks/useActivity";
import { useAuth } from "@/providers/AuthProvider";
import { getProjectProgress, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { TaskCard } from "@/components/tasks/TaskCard";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { ProjectProgressChart } from "@/components/projects/ProjectProgressChart";
import { ProjectMembers } from "@/components/projects/ProjectMembers";
import { EmptyState } from "@/components/shared/EmptyState";
import { ActivitySkeleton } from "@/components/shared/Skeletons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user } = useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: project, isLoading } = useProject(projectId);
  const { data: activity, isLoading: loadingActivity } = useProjectActivity(projectId);
  const deleteProject = useDeleteProject();

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const progress = getProjectProgress(project?.tasks ?? []);

  const handleDelete = async () => {
    await deleteProject.mutateAsync(projectId);
    router.push("/projects");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        type="projects"
        title="Project not found"
        description="This project doesn't exist or you don't have access."
        actionLabel="Back to Projects"
        onAction={() => router.push("/projects")}
      />
    );
  }

  const todoTasks = project.tasks?.filter((t) => t.status === "TODO") ?? [];
  const inProgressTasks = project.tasks?.filter((t) => t.status === "IN_PROGRESS") ?? [];
  const completedTasks = project.tasks?.filter((t) => t.status === "COMPLETED") ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              {project.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Created {formatDate(project.createdAt)} · Managed by{" "}
              <span className="font-medium">{project.manager?.name}</span>
            </p>
          </div>

          {canManage && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="gap-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">
                {completedTasks.length}/{project.tasks?.length ?? 0} tasks completed
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1.5">{progress}% complete</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="tasks">
            <TabsList className="mb-4">
              <TabsTrigger value="tasks">
                Tasks ({project.tasks?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="members">
                Members ({project.members?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
              {canManage && (
                <Button
                  onClick={() => setCreateTaskOpen(true)}
                  className="gap-2 w-full sm:w-auto"
                  id="add-task-btn"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              )}

              {(project.tasks?.length ?? 0) === 0 ? (
                <EmptyState
                  type="tasks"
                  title="No tasks yet"
                  description="Add your first task to this project to start tracking progress."
                  actionLabel={canManage ? "Add Task" : undefined}
                  onAction={canManage ? () => setCreateTaskOpen(true) : undefined}
                />
              ) : (
                <div className="space-y-6">
                  {todoTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        To Do ({todoTasks.length})
                      </h3>
                      <div className="space-y-2">
                        {todoTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}
                  {inProgressTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-blue-400 mb-3 uppercase tracking-wide">
                        In Progress ({inProgressTasks.length})
                      </h3>
                      <div className="space-y-2">
                        {inProgressTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}
                  {completedTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-emerald-400 mb-3 uppercase tracking-wide">
                        Completed ({completedTasks.length})
                      </h3>
                      <div className="space-y-2">
                        {completedTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members">
              <ProjectMembers project={project} canManage={canManage} />
            </TabsContent>

            <TabsContent value="activity">
              {loadingActivity ? (
                <ActivitySkeleton />
              ) : (
                <ActivityFeed activities={activity ?? []} />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Chart + info */}
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Task Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectProgressChart tasks={project.tasks ?? []} />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team ({project.members?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.members?.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center gap-2 text-sm">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <span className="truncate">{member.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto capitalize">
                    {member.role.toLowerCase()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ProjectDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
      <TaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        projectId={projectId}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{project.name}</strong>?
              This will also delete all associated tasks and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
