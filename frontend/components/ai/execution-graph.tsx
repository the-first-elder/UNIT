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
    <div className="relative py-2 pl-2">
      {/* Responsive native CSS vertical track */}
      <div className="absolute left-[17px] top-6 bottom-6 w-0.5 bg-zinc-800/80" />

      <div className="space-y-5 relative">
        {steps.map((step, i) => {
          const state = stateMap.get(step.step);
          const status = state?.status || "pending";
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-4"
            >
              <div
                className={cn(
                  "h-[22px] w-[22px] rounded-full border-[1.5px] shrink-0 flex items-center justify-center text-[9px] font-bold z-10",
                  status === "success" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
                  status === "executing" && "border-blue-500/50 bg-blue-500/10 text-blue-400",
                  status === "failed" && "border-rose-500/50 bg-rose-500/10 text-rose-400",
                  status === "pending" && "border-zinc-700 bg-[#0a0a0c] text-zinc-500",
                )}
              >
                {status === "executing" ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                ) : status === "success" ? (
                  "✓"
                ) : (
                  step.step
                )}
              </div>
              <div className="flex-1 min-w-0 bg-white/5 hover:bg-white/[0.08] transition-colors rounded-xl p-3 border border-white/5 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{step.action}</span>
                  <span className="text-[8px] font-mono font-bold text-zinc-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">{step.chain}</span>
                </div>
                <div className="text-[11px] text-zinc-300 leading-snug">
                  {step.description}
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-zinc-500">
                  <span className="text-blue-400/80 uppercase">Type: {step.type}</span>
                  <span>ID: {step.step}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
