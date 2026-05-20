"use client";

import type { ExecutionStep, TxExecutionState, TxStatus } from "@/lib/types";
import { TxStepCard } from "./tx-step";
import { Button } from "@/components/ui/button";
import { Play, Layers, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo } from "react";

interface Props {
  steps: ExecutionStep[];
  states: TxExecutionState[];
  onExecuteStep: (step: ExecutionStep) => void;
  onExecuteAll: (steps: ExecutionStep[]) => void;
  onExecuteParallel: (steps: ExecutionStep[]) => void;
  isExecuting: boolean;
}

export function TxPipeline({
  steps,
  states,
  onExecuteStep,
  onExecuteAll,
  onExecuteParallel,
  isExecuting,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const stateMap = new Map(states.map((s) => [s.step.step, s]));
  const validSteps = steps.filter((s) => !s.error);
  const hasSteps = validSteps.length > 0;

  // Derive overall pipeline stage from individual step states
  const pipelineStage = useMemo<"pending" | "executing" | "success" | "failed">(() => {
    const statuses = states.map((s) => s.status);
    if (statuses.some((s) => s === "failed")) return "failed";
    if (statuses.some((s) => s === "executing")) return "executing";
    if (statuses.every((s) => s === "success")) return "success";
    return "pending";
  }, [states]);

  const executedCount = states.filter((s) => s.status === "success" || s.status === "failed").length;
  const totalCount = states.length;
  const progressPct = totalCount > 0 ? Math.round((executedCount / totalCount) * 100) : 0;

  const rowVirtualizer = useVirtualizer({
    count: validSteps.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  if (!hasSteps) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <motion.div
            animate={pipelineStage === "success" ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Layers className="h-4 w-4 text-blue-400" />
          </motion.div>
          <span>Pipeline</span>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground font-normal ml-1">
              {executedCount}/{totalCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 cursor-pointer hover:bg-accent/80 active:scale-95 transition-all"
            onClick={() => onExecuteAll(validSteps)}
            disabled={isExecuting}
          >
            <Play className="h-3 w-3" />
            Parallel
          </Button>
          <Button
            size="sm"
            variant="premium"
            className="h-8 text-xs gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            onClick={() => onExecuteParallel(validSteps)}
            disabled={isExecuting}
          >
            <Layers className="h-3 w-3" />
            Batch
          </Button>
        </div>
      </div>

      {/* Animated progress bar */}
      <AnimatePresence>
        {pipelineStage === "executing" && (
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${Math.max(progressPct, 5)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </motion.div>
        )}
        {pipelineStage === "success" && (
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
          />
        )}
        {pipelineStage === "failed" && (
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
            className="h-1 bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
          />
        )}
      </AnimatePresence>

      <div ref={parentRef} className="space-y-2 max-h-[500px] overflow-y-auto">
        {validSteps.map((step, i) => {
          const state = stateMap.get(step.step);
          if (!state) return null;
          return (
            <TxStepCard
              key={step.step}
              state={state}
              onExecute={onExecuteStep}
              index={i}
              totalSteps={validSteps.length}
            />
          );
        })}
      </div>

      {/* Responsive pipeline stage indicator */}
      <div className="flex items-center justify-center gap-3 text-xs pt-1">
        <motion.div
          animate={{ scale: pipelineStage === "pending" ? 1 : 0.9, opacity: pipelineStage === "pending" ? 1 : 0.4 }}
          className={`flex items-center gap-1.5 ${pipelineStage === "pending" ? "text-foreground" : "text-muted-foreground"}`}
        >
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          Pending
        </motion.div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <motion.div
          animate={
            pipelineStage === "executing"
              ? { scale: [1, 1.1, 1], opacity: 1 }
              : { scale: 0.9, opacity: pipelineStage === "success" || pipelineStage === "failed" ? 0.4 : 0.6 }
          }
          transition={pipelineStage === "executing" ? { repeat: Infinity, duration: 1.5 } : undefined}
          className={`flex items-center gap-1.5 ${pipelineStage === "executing" ? "text-blue-400" : "text-muted-foreground"}`}
        >
          {pipelineStage === "executing" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-blue-400" />
          )}
          Executing
        </motion.div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <motion.div
          animate={
            pipelineStage === "success"
              ? { scale: [1, 1.15, 1], opacity: 1 }
              : { scale: 0.9, opacity: 0.4 }
          }
          transition={pipelineStage === "success" ? { duration: 0.6 } : undefined}
          className={`flex items-center gap-1.5 ${pipelineStage === "success" ? "text-green-400" : "text-muted-foreground"}`}
        >
          {pipelineStage === "success" ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : pipelineStage === "failed" ? (
            <XCircle className="h-3 w-3 text-red-400" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-green-400/30" />
          )}
          {pipelineStage === "failed" ? "Failed" : "Confirmed"}
        </motion.div>
      </div>

      {/* Completion summary */}
      <AnimatePresence mode="wait">
        {pipelineStage === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-1.5 text-xs text-green-400/80 bg-green-500/10 px-3 py-1 rounded-full"
            >
              <CheckCircle2 className="h-3 w-3" />
              All {totalCount} step{totalCount > 1 ? "s" : ""} confirmed
            </motion.div>
          </motion.div>
        )}
        {pipelineStage === "executing" && (
          <motion.div
            key="executing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-xs text-blue-400/60 pt-0.5"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              {executedCount}/{totalCount} complete — good things take time
            </span>
          </motion.div>
        )}
        {pipelineStage === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-xs text-red-400/60 pt-0.5"
          >
            <span className="inline-flex items-center gap-1.5">
              <XCircle className="h-3 w-3" />
              {executedCount}/{totalCount} completed — {totalCount - executedCount} failed
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
