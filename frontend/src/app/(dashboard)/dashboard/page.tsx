"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else if (user.role === "MANAGER") {
        router.replace("/projects");
      } else {
        router.replace("/tasks");
      }
    }
  }, [user, isLoading, router]);

  return null;
}
