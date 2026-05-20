"use client";

import type { TxExecutionState, ExecutionStep } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, explorerUrl, shortenAddress } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Play,
  Ban,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  state: TxExecutionState;
  onExecute: (step: ExecutionStep) => void;
  index?: number;
}

const actionIcons: Record<string, string> = {
  approve: "✓",
  deposit: "📥",
  supply: "📤",
  swap: "🔄",
  bridge: "🌉",
  mint: "🔨",
  withdraw: "📤",
  borrow: "💳",
  repay: "💰",
  buy: "🛒",
  execute_swap: "🔄",
};

export function TxStepCard({ state, onExecute, index = 0 }: Props) {
  const { step, status, txHash, error } = state;
  const activeChain = useAppStore((s) => s.activeChain);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "rounded-xl border p-3 transition-all duration-300",
        status === "pending" && "border-border bg-card",
        status === "executing" && "border-blue-500/40 bg-blue-500/5",
        status === "success" && "border-green-500/30 bg-green-500/5",
        status === "failed" && "border-red-500/30 bg-red-500/5",
        status === "skipped" && "border-muted bg-muted/20 opacity-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
              status === "pending" && "bg-secondary text-muted-foreground",
              status === "executing" && "bg-blue-500/20 text-blue-400",
              status === "success" && "bg-green-500/20 text-green-400",
              status === "failed" && "bg-red-500/20 text-red-400",
              status === "skipped" && "bg-muted text-muted-foreground"
            )}
          >
            {status === "executing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : status === "failed" ? (
              <XCircle className="h-4 w-4" />
            ) : status === "skipped" ? (
              <Ban className="h-4 w-4" />
            ) : (
              actionIcons[step.action] || step.step
            )}
          </div>
          {index !== undefined && (
            <div className="h-full w-px bg-border mt-1" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Step {step.step}
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {step.type}
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {step.action}
            </Badge>
            {step.chain && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {step.chain}
              </Badge>
            )}
          </div>

          <p className="text-sm text-foreground/90">{step.description}</p>

          {step.warning && (
            <div className="flex items-center gap-1 mt-1 text-xs text-yellow-400">
              <AlertTriangle className="h-3 w-3" />
              {step.warning}
            </div>
          )}

          {step.error && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
              <AlertTriangle className="h-3 w-3" />
              {step.error}
            </div>
          )}

          <AnimatePresence>
            {status === "success" && txHash && /^0x[a-fA-F0-9]+$/.test(txHash) && (
              <motion.a
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                href={explorerUrl(step.tx?.chainId?.toString() || activeChain.id, txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 mt-1.5 text-xs text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-3 w-3" />
                {shortenAddress(txHash, 8)}
              </motion.a>
            )}
            {status === "success" && (!txHash || !/^0x[a-fA-F0-9]+$/.test(txHash)) && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-yellow-400 mt-1"
              >
                Submitted — waiting for on-chain confirmation
              </motion.p>
            )}

            {status === "failed" && error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 mt-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="shrink-0">
          {status === "pending" && !step.error && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              onClick={() => onExecute(step)}
            >
              <Play className="h-3 w-3" />
              Execute
            </Button>
          )}
          {status === "executing" && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Mining...
            </div>
          )}
          {status === "success" && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              Done
            </div>
          )}
          {status === "failed" && !step.error && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-red-500/30 text-red-400 hover:text-red-300"
              onClick={() => onExecute(step)}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
