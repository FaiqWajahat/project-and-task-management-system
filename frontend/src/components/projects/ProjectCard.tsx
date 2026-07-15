"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, CheckSquare, Calendar } from "lucide-react";
import { Project } from "@/types";
import { getProjectProgress, formatDate, cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = getProjectProgress(project.tasks ?? []);
  const taskCount = project.tasks?.length ?? 0;
  const completedCount =
    project.tasks?.filter((t) => t.status === "COMPLETED").length ?? 0;
  const memberCount = project.members?.length ?? 0;

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
      <Link href={`/projects/${project.id}`}>
        <Card className="border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full group cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                {project.name}
              </h3>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {project.description || "No description provided."}
            </p>
          </CardHeader>

          <CardContent className="pb-3 space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progress</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>
                  {completedCount}/{taskCount} tasks
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{memberCount} members</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-3 border-t border-border/30 flex items-center justify-between">
            {/* Member avatars */}
            <div className="flex -space-x-2">
              {project.members?.slice(0, 4).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback
                    className={cn(
                      "text-[10px] font-bold text-white",
                      "bg-gradient-to-br from-violet-500 to-purple-600"
                    )}
                  >
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {(project.members?.length ?? 0) > 4 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
                  +{(project.members?.length ?? 0) - 4}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(project.createdAt)}
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
