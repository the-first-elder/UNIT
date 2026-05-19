"use client";

import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StreamingReasoning } from "./streaming-reasoning";
import { ExecutionGraph } from "./execution-graph";
import { StrategyCard } from "@/components/strategy/strategy-card";
import { AllocationChart } from "@/components/strategy/allocation-chart";
import { ApyChart } from "@/components/strategy/apy-chart";
import { TxPipeline } from "@/components/transaction/tx-pipeline";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";
import { useExecution } from "@/hooks/use-execution";
import { useEffect, useRef } from "react";

interface Props {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: Props) {
  const { executeStep, executeAllSequential, executeAllParallel, isExecutingAll } = useExecution();

  const isUser = message.role === "user";
  const response = message.response;
  const plan = message.executionPlan;
  const autoFired = useRef(false);

  // Auto-batch execute steps when plan arrives
  useEffect(() => {
    if (autoFired.current) return;
    if (!plan || plan.isComplete) return;
    if (!response?.steps || response.steps.length === 0) return;
    const allPending = plan.states.every((s) => s.status === "pending");
    if (!allPending) return;
    autoFired.current = true;
    // Default: execute in parallel (batch)
    executeAllParallel(response.steps);
  }, [plan, response, executeAllParallel]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={cn("max-w-[85%] space-y-2", isUser && "order-first")}>
        {/* User message */}
        {isUser && (
          <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 px-4 py-2.5">
            <p className="text-sm text-foreground/90">{message.content}</p>
          </div>
        )}

        {/* Assistant loading state */}
        {!isUser && message.isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              UNIT is analyzing...
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {/* Assistant response */}
        {!isUser && !message.isLoading && (
          <div className="space-y-3">
            {message.content && (
              <div className="rounded-2xl bg-card border border-border/50 px-4 py-3">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {message.content}
                </p>
              </div>
            )}

            {/* Strategy Card */}
            {response?.strategy && (
              <StrategyCard strategy={response.strategy} />
            )}

            {/* Options + APY Chart */}
            {response?.options && response.options.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Yield Comparison
                </div>
                <ApyChart options={response.options} />
              </div>
            )}

            {/* Allocations + Pie Chart */}
            {response?.allocations && response.allocations.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Allocation Split
                </div>
                <AllocationChart allocations={response.allocations} />
                <div className="space-y-1">
                  {response.allocations.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{a.strategy}</span>
                      <span className="font-medium">{a.allocation_percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execution Steps */}
            {plan && response?.steps && response.steps.length > 0 && (
              <div className="space-y-2">
                <TxPipeline
                  steps={response.steps}
                  states={plan.states}
                  onExecuteStep={executeStep}
                  onExecuteAll={executeAllSequential}
                  onExecuteParallel={executeAllParallel}
                  isExecuting={isExecutingAll}
                />
              </div>
            )}

            {/* Execution Graph (compact) */}
            {response?.steps && response.steps.length > 0 && !plan?.states.some(s => s.status !== "pending") && (
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Execution Flow
                </div>
                <ExecutionGraph steps={response.steps} states={response.steps.map(s => ({ step: s, status: "pending" as const }))} />
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}
