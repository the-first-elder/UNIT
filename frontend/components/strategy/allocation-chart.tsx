"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Allocation } from "@/lib/types";

const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#22c55e", "#eab308"];

interface Props {
  allocations: Allocation[];
}

export function AllocationChart({ allocations }: Props) {
  const data = allocations.map((a) => ({
    name: a.strategy.charAt(0).toUpperCase() + a.strategy.slice(1),
    value: a.allocation_percent,
  }));

  return (
    <div className="h-28 w-full min-w-0">
      <ResponsiveContainer width="99%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={45}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(18, 18, 20, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#fafafa",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
            itemStyle={{ color: "#fafafa", fontWeight: "bold" }}
            formatter={(value: number) => [`${value}%`, "Allocation"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
