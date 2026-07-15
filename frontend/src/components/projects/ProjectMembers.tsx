"use client";

import { useState } from "react";
import { UserMinus, UserPlus } from "lucide-react";
import { Project } from "@/types";
import { useUsers } from "@/hooks/useUsers";
import { useAddProjectMember, useRemoveProjectMember } from "@/hooks/useProjects";
import { getInitials, getAvatarGradient, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";

interface ProjectMembersProps {
  project: Project;
  canManage: boolean;
}

export function ProjectMembers({ project, canManage }: ProjectMembersProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: allUsers } = useUsers();
  const addMember = useAddProjectMember();
  const removeMember = useRemoveProjectMember();

  const memberIds = new Set(project.members?.map((m) => m.id) ?? []);
  const availableUsers = allUsers?.filter((u) => !memberIds.has(u.id)) ?? [];

  const handleAdd = async () => {
    if (!selectedUserId) return;
    await addMember.mutateAsync({ projectId: project.id, userId: selectedUserId });
    setSelectedUserId(null);
  };

  return (
    <div className="space-y-4">
      {/* Add member */}
      {canManage && (
        <div className="flex gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a user to add..." />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} ({u.role.toLowerCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAdd}
            disabled={!selectedUserId || addMember.isPending}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add
          </Button>
        </div>
      )}

      {/* Members list */}
      {(project.members?.length ?? 0) === 0 ? (
        <EmptyState
          type="users"
          title="No members yet"
          description="Add team members to this project to start collaborating."
        />
      ) : (
        <div className="space-y-2">
          {project.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:border-border/70 transition-colors"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback
                  className={cn(
                    "text-xs font-bold text-white bg-gradient-to-br",
                    getAvatarGradient(member.name)
                  )}
                >
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <span className="text-xs text-muted-foreground capitalize">
                {member.role.toLowerCase()}
              </span>
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    removeMember.mutateAsync({
                      projectId: project.id,
                      userId: member.id,
                    })
                  }
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
