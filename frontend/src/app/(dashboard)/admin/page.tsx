import { Metadata } from "next";
import AdminClient from "@/components/admin/AdminClient";

export const metadata: Metadata = {
  title: "Admin Dashboard Overview — TaskFlow",
  description: "Monitor platform users, task statistics, activities, and overall health.",
};

export default function AdminPage() {
  return <AdminClient />;
}
