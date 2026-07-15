import { Metadata } from "next";
import ActivityClient from "@/components/activity/ActivityClient";

export const metadata: Metadata = {
  title: "Activity Feed — TaskFlow",
  description: "Real-time audit trail of all actions, updates, and contributions across projects.",
};

export default function ActivityPage() {
  return <ActivityClient />;
}
