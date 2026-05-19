"use client";

import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StreamingReasoning } from "./streaming-reasoning";
import { ExecutionGraph } from "./execution-graph";
import { ThinkingTerminal } from "./thinking-terminal";
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
  mode?: "chat" | "panel";
}

export function ChatMessageBubble({ message, mode = "chat" }: Props) {
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

  if (mode === "panel" && isUser) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3",
        isUser ? "justify-end" : "justify-start",
        mode === "panel" && "w-full"
      )}
    >
      {!isUser && mode === "chat" && (
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={cn(
        "space-y-3",
        mode === "chat" ? "max-w-[85%]" : "w-full",
        isUser && "order-first"
      )}>
        {/* User message */}
        {isUser && mode === "chat" && (
          <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 shadow-sm">
            <p className="text-sm text-foreground/90">{message.content}</p>
          </div>
        )}

        {/* Assistant loading state */}
        {!isUser && message.isLoading && (
          <div className="w-full pb-4">
            <ThinkingTerminal />
          </div>
        )}

        {/* Assistant response */}
        {!isUser && !message.isLoading && (
          <>
            {mode === "chat" && (
              <>
                {message.content && (
                  <div className="rounded-2xl bg-card border border-border/50 px-4 py-3 shadow-sm bg-gradient-to-b from-card to-card/90">
                    <p className="text-sm text-foreground/80 leading-relaxed font-normal">
                      {message.content}
                    </p>
                  </div>
                )}

                {/* Strategy summary tag */}
                {response?.strategy && (
                  <div className="text-xs font-semibold text-blue-500/80 dark:text-blue-400/80 px-1 py-0.5">
                    Strategy: {response.strategy.summary} ({response.strategy.estimated_apy} APY)
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
              </>
            )}

            {mode === "panel" && (
              <div className="space-y-4 w-full pb-6 pr-4">
                {/* Strategy Card */}
                {response?.strategy && (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500" />
                    <div className="relative scale-95 origin-top">
                      <StrategyCard strategy={response.strategy} />
                    </div>
                  </div>
                )}

                {/* Options + APY Chart */}
                {response?.options && response.options.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-xl p-3 shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      Yield Comparison
                    </div>
                    <div className="w-full">
                      <ApyChart options={response.options} />
                    </div>
                  </div>
                )}

                {/* Allocations + Pie Chart */}
                {response?.allocations && response.allocations.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-xl p-3 shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      Allocation Split
                    </div>
                    <div className="w-full mb-3">
                      <AllocationChart allocations={response.allocations} />
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      {response.allocations.map((a, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] p-1.5 rounded-md bg-white/5 border border-white/5">
                          <span className="text-zinc-300 capitalize flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
                            {a.strategy}
                          </span>
                          <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">
                            {a.allocation_percent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution Flowchart */}
                {response?.steps && response.steps.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-xl p-3 shadow-lg relative overflow-hidden">
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
                      Execution Graph
                    </div>
                    <div className="scale-95 origin-top-left">
                      <ExecutionGraph steps={response.steps} states={plan?.states || response.steps.map(s => ({ step: s, status: "pending" as const }))} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isUser && mode === "chat" && (
        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}
