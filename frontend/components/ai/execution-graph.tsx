"use client";

import { motion } from "framer-motion";
import type { ExecutionStep, TxExecutionState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  steps: ExecutionStep[];
  states: TxExecutionState[];
}

export function ExecutionGraph({ steps, states }: Props) {
  const stateMap = new Map(states.map((s) => [s.step.step, s]));

  if (!steps.length) return null;

  return (
    <div className="relative py-4 px-2">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {steps.map((step, i) => {
          if (i === steps.length - 1) return null;
          const x1 = 40;
          const y1 = i * 64 + 40;
          const x2 = 40;
          const y2 = (i + 1) * 64 + 40;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgb(39, 39, 42)"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      <div className="space-y-4 relative">
        {steps.map((step, i) => {
          const state = stateMap.get(step.step);
          const status = state?.status || "pending";
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center text-[8px] font-bold",
                  status === "success" && "border-green-400 bg-green-500/20 text-green-400",
                  status === "executing" && "border-blue-400 bg-blue-500/20 text-blue-400",
                  status === "failed" && "border-red-400 bg-red-500/20 text-red-400",
                  status === "pending" && "border-muted-foreground/30 bg-card text-muted-foreground/50",
                )}
              >
                {status === "executing" ? (
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                ) : status === "success" ? (
                  "✓"
                ) : (
                  step.step
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground/80 truncate">
                  {step.action} · {step.description}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {step.chain} · {step.type}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
