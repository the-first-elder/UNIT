"use client";

import type { ExecutionStep, TxExecutionState } from "@/lib/types";
import { motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  steps: ExecutionStep[];
  states: TxExecutionState[];
}

export function TxGroup({ steps, states }: Props) {
  const stateMap = new Map(states.map((s) => [s.step.step, s]));
  const completed = states.filter((s) => s.status === "success").length;
  const total = states.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
          <Activity className="h-3 w-3" />
          Parallel Group
        </div>
        <span className="text-xs text-muted-foreground">
          {completed}/{total} done
        </span>
      </div>

      <Progress value={progress} className="h-1" />

      <div className="flex flex-wrap gap-1.5">
        {steps.map((step) => {
          const state = stateMap.get(step.step);
          const status = state?.status || "pending";
          return (
            <div
              key={step.step}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium"
              data-status={status}
              style={{
                backgroundColor:
                  status === "success"
                    ? "rgba(34, 197, 94, 0.1)"
                    : status === "executing"
                    ? "rgba(59, 130, 246, 0.1)"
                    : status === "failed"
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(39, 39, 42, 0.3)",
                color:
                  status === "success"
                    ? "#22c55e"
                    : status === "executing"
                    ? "#3b82f6"
                    : status === "failed"
                    ? "#ef4444"
                    : "#a1a1aa",
              }}
            >
              {step.action}
              {status === "executing" && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse ml-1" />
              )}
              {status === "success" && (
                <span className="ml-1">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {steps.length > 1 && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {steps.map((s, i) => (
            <span key={s.step} className="flex items-center gap-1">
              <span>{s.action}</span>
              {i < steps.length - 1 && <ArrowRight className="h-2.5 w-2.5" />}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
