"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { Option } from "@/lib/types";

interface Props {
  options: Option[];
}

export function ApyChart({ options }: Props) {
  const data = options.map((o) => ({
    name: o.name.length > 12 ? o.name.slice(0, 12) + "..." : o.name,
    apy: parseFloat(o.apy) || 0,
    risk: o.risk,
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "#121214",
              border: "1px solid #27272a",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, "APY"]}
          />
          <Bar dataKey="apy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
