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
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
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
              background: "#121214",
              border: "1px solid #27272a",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value: number) => `${value}%`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
