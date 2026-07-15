"use client";

import { useUsers } from "@/hooks/useUsers";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { UserTable } from "@/components/admin/UserTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersClient() {
  const { data: users, isLoading: loadingUsers } = useUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage platform user accounts and permissions
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">User List</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <TableSkeleton />
          ) : (
            <UserTable users={users ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
