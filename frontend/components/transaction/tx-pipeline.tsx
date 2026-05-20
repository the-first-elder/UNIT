"use client";

import type { ExecutionStep, TxExecutionState } from "@/lib/types";
import { TxStepCard } from "./tx-step";
import { Button } from "@/components/ui/button";
import { Play, Layers, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

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
          <Layers className="h-4 w-4 text-blue-400" />
          Transaction Pipeline
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
            />
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          Pending
        </div>
        <ArrowRight className="h-3 w-3" />
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          Executing
        </div>
        <ArrowRight className="h-3 w-3" />
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Confirmed
        </div>
      </div>
    </motion.div>
  );
}
