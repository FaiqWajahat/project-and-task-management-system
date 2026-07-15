import { Metadata } from "next";
import ProjectsClient from "@/components/projects/ProjectsClient";

export const metadata: Metadata = {
  title: "Projects Overview — TaskFlow",
  description: "View, update, and manage your engineering projects and client workspaces.",
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
