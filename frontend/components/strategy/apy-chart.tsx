"use client";

import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
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
    <div className="h-32 w-full min-w-0">
      <ResponsiveContainer width="99%" height="100%">
        <BarChart data={data} layout="vertical" barCategoryGap="20%" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#e4e4e7", fontSize: 11, fontWeight: 500 }}
            width={90}
          />
          <Tooltip
            cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
            contentStyle={{
              background: "rgba(18, 18, 20, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#fafafa",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, "APY"]}
            itemStyle={{ color: "#3b82f6", fontWeight: "bold" }}
          />
          <Bar dataKey="apy" fill="#3b82f6" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.risk === 'low' ? '#10b981' : entry.risk === 'high' ? '#8b5cf6' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
