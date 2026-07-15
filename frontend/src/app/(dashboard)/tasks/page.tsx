import { Metadata } from "next";
import TasksClient from "@/components/tasks/TasksClient";

export const metadata: Metadata = {
  title: "My Tasks Kanban Board — TaskFlow",
  description: "View and prioritize your assigned tasks, drag and drop columns, and update task statuses.",
};

export default function TasksPage() {
  return <TasksClient />;
}
