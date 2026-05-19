"use client";

import { cn } from "@/lib/utils";
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

interface Props {
  level: string;
}

export function RiskBadge({ level }: Props) {
  const config = {
    low: {
      icon: ShieldCheck,
      color: "text-green-400",
      bg: "bg-green-500/10",
      label: "Low Risk",
    },
    moderate: {
      icon: ShieldQuestion,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      label: "Moderate Risk",
    },
    high: {
      icon: ShieldAlert,
      color: "text-red-400",
      bg: "bg-red-500/10",
      label: "High Risk",
    },
  }[level] || {
    icon: Shield,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: level,
  };

  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", config.bg, config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
}
