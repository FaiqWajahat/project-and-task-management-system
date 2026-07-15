import { Metadata } from "next";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Profile — TaskFlow",
  description: "View and manage your account details, task statistics, and activity feed.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
