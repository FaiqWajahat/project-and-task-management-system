"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Task } from "@/types";

const COLORS = {
  TODO: "#94a3b8",
  IN_PROGRESS: "#60a5fa",
  COMPLETED: "#34d399",
};

interface ProjectProgressChartProps {
  tasks: Task[];
}

export function ProjectProgressChart({ tasks }: ProjectProgressChartProps) {
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;

  const data = [
    { name: "To Do", value: todo, color: COLORS.TODO },
    { name: "In Progress", value: inProgress, color: COLORS.IN_PROGRESS },
    { name: "Completed", value: completed, color: COLORS.COMPLETED },
  ].filter((d) => d.value > 0);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        No tasks to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={45}
          outerRadius={65}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
