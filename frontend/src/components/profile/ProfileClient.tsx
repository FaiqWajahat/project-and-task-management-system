"use client";

import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, CheckSquare, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useTasks } from "@/hooks/useTasks";
import { useAllActivity } from "@/hooks/useActivity";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getInitials, getAvatarGradient, cn } from "@/lib/utils";
import { ActivityFeed } from "@/components/activity/ActivityFeed";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function ProfileClient() {
  const { user } = useAuth();
  const { data: tasks, isLoading: loadingTasks } = useTasks();
  const { data: activities, isLoading: loadingActivity } = useAllActivity();

  if (!user) return null;

  // Filter tasks assigned to this user
  const myTasks = tasks?.filter((t) => t.assigneeIds?.includes(user.id) || t.assigneeId === user.id) ?? [];
  const completedTasks = myTasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressTasks = myTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoTasks = myTasks.filter((t) => t.status === "TODO").length;

  // Filter activities performed by this user
  const myActivities = activities?.filter((a) => a.userId === user.id) ?? [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and view statistics</p>
      </div>

      {/* Profile Info Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeUp}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-600 via-primary to-blue-500" />
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Avatar */}
              <div
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full text-white text-3xl font-extrabold shadow-lg bg-gradient-to-br",
                  getAvatarGradient(user.name)
                )}
              >
                {getInitials(user.name)}
              </div>

              {/* User Metadata */}
              <div className="text-center md:text-left space-y-2 flex-1">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="capitalize font-medium text-primary">
                      {user.role.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Joined {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Completed */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeUp}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-border/50 bg-emerald-500/5 hover:border-emerald-500/30 transition-colors">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                <p className="text-3xl font-bold mt-1 text-emerald-400">
                  {loadingTasks ? "..." : completedTasks}
                </p>
              </div>
              <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                <CheckSquare className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* In Progress */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeUp}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="border-border/50 bg-blue-500/5 hover:border-blue-500/30 transition-colors">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold mt-1 text-blue-400">
                  {loadingTasks ? "..." : inProgressTasks}
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* To Do */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeUp}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-border/50 bg-amber-500/5 hover:border-amber-500/30 transition-colors">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">To Do</p>
                <p className="text-3xl font-bold mt-1 text-amber-400">
                  {loadingTasks ? "..." : todoTasks}
                </p>
              </div>
              <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* User's Own Activity Logs */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeUp}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Your Recent Activity</CardTitle>
            <CardDescription>A list of your platform events and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                Loading activity feed...
              </div>
            ) : myActivities.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                No recent activity events recorded
              </div>
            ) : (
              <ActivityFeed activities={myActivities} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
