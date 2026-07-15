"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/providers/AuthProvider";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProjectCardSkeleton } from "@/components/shared/Skeletons";
import { Button } from "@/components/ui/button";

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function ProjectsClient() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: projects, isLoading } = useProjects();
  const { user } = useAuth();

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {projects?.length ?? 0} project{(projects?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2" id="create-project-btn">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {projects.map((project) => (
            <motion.div key={project.id} variants={fadeUp}>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          type="projects"
          title="No projects yet"
          description={
            canCreate
              ? "Create your first project to get started assigning tasks and managing your team."
              : "You haven't been assigned to any projects yet. Ask your manager to add you."
          }
          actionLabel={canCreate ? "Create Project" : undefined}
          onAction={canCreate ? () => setCreateOpen(true) : undefined}
        />
      )}

      <ProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
