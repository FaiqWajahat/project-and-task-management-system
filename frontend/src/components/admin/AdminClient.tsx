"use client";

import { motion } from "framer-motion";
import { Users, FolderKanban, CheckSquare, TrendingUp, BarChart2, PieChart as PieIcon } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useAllActivity } from "@/hooks/useActivity";
import { useAuth } from "@/providers/AuthProvider";
import { StatsRowSkeleton, ActivitySkeleton } from "@/components/shared/Skeletons";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay = 0,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div variants={fadeUp} transition={{ delay }}>
      <Card className="border-border/50 hover:border-primary/30 transition-colors group">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${color} group-hover:scale-110 transition-transform`}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminClient() {
  const { user } = useAuth();
  const { data: users, isLoading: loadingUsers } = useUsers();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: tasks, isLoading: loadingTasks } = useTasks();
  const { data: activity, isLoading: loadingActivity } = useAllActivity();

  const completedCount = tasks?.filter((t) => t.status === "COMPLETED").length ?? 0;
  const inProgressCount = tasks?.filter((t) => t.status === "IN_PROGRESS").length ?? 0;
  const todoCount = tasks?.filter((t) => t.status === "TODO").length ?? 0;

  // Data for Task Status Distribution (Pie Chart)
  const statusData = [
    { name: "Completed", value: completedCount, color: "#10b981" },
    { name: "In Progress", value: inProgressCount, color: "#3b82f6" },
    { name: "To Do", value: todoCount, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  // Data for Tasks per Project (Bar Chart)
  const projectTasksData = projects?.map((project) => {
    const projectTasks = tasks?.filter((t) => t.projectId === project.id) ?? [];
    return {
      name: project.name.length > 15 ? project.name.slice(0, 15) + "..." : project.name,
      tasks: projectTasks.length,
    };
  }) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back,{" "}
          <span className="gradient-text">{user?.name.split(" ")[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your platform
        </p>
      </div>

      {/* Stats */}
      {loadingUsers || loadingProjects || loadingTasks ? (
        <StatsRowSkeleton />
      ) : (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            label="Total Users"
            value={users?.length ?? 0}
            icon={Users}
            color="bg-violet-500/10 text-violet-400"
            delay={0}
          />
          <StatCard
            label="Projects"
            value={projects?.length ?? 0}
            icon={FolderKanban}
            color="bg-blue-500/10 text-blue-400"
            delay={0.08}
          />
          <StatCard
            label="Total Tasks"
            value={tasks?.length ?? 0}
            icon={CheckSquare}
            color="bg-amber-500/10 text-amber-400"
            delay={0.16}
          />
          <StatCard
            label="Completed"
            value={completedCount}
            icon={TrendingUp}
            color="bg-emerald-500/10 text-emerald-400"
            delay={0.24}
          />
        </motion.div>
      )}

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Load Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 h-[400px]">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <BarChart2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">Project Tasks Distribution</CardTitle>
                <CardDescription>Number of tasks assigned to each project</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {loadingProjects || loadingTasks ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Loading chart data...
                </div>
              ) : projectTasksData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No project task data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectTasksData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fill: "#888888", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#888888", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                      labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
                      itemStyle={{ color: "#a1a1aa" }}
                    />
                    <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {projectTasksData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "#3b82f6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Status breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-border/50 h-[400px]">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <PieIcon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">Tasks Status Overview</CardTitle>
                <CardDescription>Breakdown of task statuses across the system</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {loadingTasks ? (
                <div className="text-muted-foreground text-sm">Loading chart data...</div>
              ) : statusData.length === 0 ? (
                <div className="text-muted-foreground text-sm">No tasks created yet</div>
              ) : (
                <div className="w-full h-full flex flex-col sm:flex-row items-center justify-between">
                  <div className="w-full sm:w-1/2 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                          itemStyle={{ color: "#ffffff" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 pr-8 w-full sm:w-1/2">
                    {statusData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded-lg border border-border/30">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">{item.value} tasks</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <ActivitySkeleton />
            ) : (
              <ActivityFeed activities={activity ?? []} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
