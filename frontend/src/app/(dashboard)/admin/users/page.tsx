import { Metadata } from "next";
import UsersClient from "@/components/admin/UsersClient";

export const metadata: Metadata = {
  title: "User Management — TaskFlow",
  description: "Create, edit, and delete user accounts and manage permission levels.",
};

export default function UsersPage() {
  return <UsersClient />;
}
