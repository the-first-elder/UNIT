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
  ExternalLink,
  Play,
  Ban,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface Props {
  state: TxExecutionState;
  onExecute: (step: ExecutionStep) => void;
  index?: number;
  totalSteps?: number;
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

function useTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (!running) { setElapsed(0); startRef.current = null; return; }
    if (!startRef.current) startRef.current = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current!) / 1000)), 1000);
    return () => clearInterval(id);
  }, [running]);
  if (!running) return "";
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function TxStepCard({ state, onExecute, index = 0, totalSteps }: Props) {
  const { step, status, txHash, error } = state;
  const activeChain = useAppStore((s) => s.activeChain);
  const timer = useTimer(status === "executing");
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll into view when executing
  useEffect(() => {
    if (status === "executing" && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, x: -10, scale: 0.97 }}
      animate={
        status === "executing"
          ? { opacity: 1, x: 0, scale: 1, boxShadow: "0 0 20px rgba(59,130,246,0.15)" }
          : { opacity: 1, x: 0, scale: 1, boxShadow: "0 0 0px rgba(59,130,246,0)" }
      }
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-xl border p-3 transition-colors duration-300",
        status === "pending" && "border-border bg-card",
        status === "executing" && "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20",
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
              Step {step.step}{totalSteps ? ` of ${totalSteps}` : ""}
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
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5 text-xs text-blue-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Executing
              </div>
              {timer && (
                <div className="flex items-center gap-1 text-[10px] text-blue-400/60">
                  <Clock className="h-2.5 w-2.5" />
                  {timer}
                </div>
              )}
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
