"use client";

import { useCallback, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { useSocialWallet } from "@/components/wallet/wallet-context";
import type { ExecutionStep } from "@/lib/types";

export interface ReputationRecord {
  txHash?: string;
  count: number;
  averageScore: number;
}

async function recordExecutionResult(
  results: { success: boolean; tag: string }[],
  onComplete?: (rep: ReputationRecord) => void,
) {
  try {
    const res = await fetch("/api/erc8004", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "recordExecutionResult", steps: results }),
    });
    if (res.ok) {
      const data = await res.json();
      const txHash = data.results?.[0]?.txHash as string | undefined;
      onComplete?.({ txHash, count: data.count, averageScore: data.averageScore });
    }
  } catch {
    // fire-and-forget — don't block UX
  }
}

export function useExecution() {
  const { updateExecutionState, resetExecution } = useAppStore();
  const [isExecutingAll, setIsExecutingAll] = useState(false);
  const [reputationTx, setReputationTx] = useState<ReputationRecord | null>(null);
  const social = useSocialWallet();
  const executingRef = useRef(false);

  const executeStep = useCallback(
    async (step: ExecutionStep, messageId: string) => {
      if (executingRef.current) return;
      setReputationTx(null);

      if (!step.tx?.to) return;
      const tx = step.tx;
      const walletId = social.walletId;
      const walletAddress = social.address;
      if (!walletId || !walletAddress) {
        updateExecutionState(messageId, step.step, "failed", undefined, "Wallet not connected");
        return;
      }

      updateExecutionState(messageId, step.step, "executing");
      try {
        const txHash = await social.executeTransaction(
          { to: tx.to, data: tx.data, value: tx.value },
          walletId,
          walletAddress,
          step.functionName ? { functionName: step.functionName, args: step.args || {} } : undefined,
        );
        if (txHash) {
          updateExecutionState(messageId, step.step, "success", txHash as `0x${string}`);
          recordExecutionResult([{ success: true, tag: step.action }], setReputationTx);
        } else {
          // Challenge was approved but no on-chain confirmation yet — keep as executing
          recordExecutionResult([{ success: false, tag: step.action }], setReputationTx);
        }
        return txHash;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        updateExecutionState(messageId, step.step, "failed", undefined, message);
        recordExecutionResult([{ success: false, tag: step.action }], setReputationTx);
        return null;
      }
    },
    [social, updateExecutionState]
  );

  // Sequential: create all challenges in parallel using callData, execute one by one
  const executeAllSequential = useCallback(
    async (steps: ExecutionStep[], messageId: string) => {
      executingRef.current = true;
      setIsExecutingAll(true);
      setReputationTx(null);
      const valid = steps.filter((s) => !s.error && s.tx?.to && s.tx?.data);

      const walletId = social.walletId;
      const walletAddress = social.address;
      if (!walletId || !walletAddress) {
        setIsExecutingAll(false);
        executingRef.current = false;
        return;
      }

      const stepResults: { success: boolean; tag: string }[] = [];

      // Mark all as executing
      for (const step of valid) {
        updateExecutionState(messageId, step.step, "executing");
      }

      try {
        // Create ALL challenges in parallel, each using callData (no execute wrapping)
        const challenges: { step: ExecutionStep; challengeId: string }[] = await Promise.all(
          valid.map(async (step) => {
            const tx = step.tx!;
            const challengeId = await social.createTransactionChallenge(
              { to: tx.to, data: tx.data, value: tx.value },
              walletId,
              walletAddress,
              step.functionName ? { functionName: step.functionName, args: step.args || {} } : undefined,
            );
            return { step, challengeId };
          }),
        );

        // Execute each challenge sequentially (each requires biometric/PIN approval)
        for (const { step, challengeId } of challenges) {
          try {
            const txHash = await social.executeChallengeById(challengeId, walletId, walletAddress, step.tx!.to);
            if (txHash) {
              updateExecutionState(messageId, step.step, "success", txHash as `0x${string}`);
              stepResults.push({ success: true, tag: step.action });
            }
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Transaction failed";
            updateExecutionState(messageId, step.step, "failed", undefined, message);
            stepResults.push({ success: false, tag: step.action });
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Challenge creation failed";
        for (const step of valid) {
          updateExecutionState(messageId, step.step, "failed", undefined, message);
          stepResults.push({ success: false, tag: step.action });
        }
      }

      setIsExecutingAll(false);
      executingRef.current = false;

      if (stepResults.length > 0) {
        recordExecutionResult(stepResults, setReputationTx);
      }
    },
    [social, updateExecutionState]
  );

  // Batch: atomic executeBatch via pre-encoded callData (one challenge, all steps in one userOp)
  const executeAllParallel = useCallback(
    async (steps: ExecutionStep[], messageId: string) => {
      executingRef.current = true;
      setIsExecutingAll(true);
      setReputationTx(null);
      const valid = steps.filter((s) => !s.error && s.tx?.to && s.tx?.data);

      const walletId = social.walletId;
      const walletAddress = social.address;
      if (!walletId || !walletAddress) {
        setIsExecutingAll(false);
        executingRef.current = false;
        return;
      }

      const stepResults: { success: boolean; tag: string }[] = [];

      // Mark all as executing
      for (const step of valid) {
        updateExecutionState(messageId, step.step, "executing");
      }

      try {
        const batchSteps = valid.map((s) => ({
          to: s.tx!.to,
          data: s.tx!.data,
          value: s.tx!.value,
        }));
        const challengeId = await social.createBatchTransactionChallenge(batchSteps, walletId, walletAddress);
        const txHash = await social.executeChallengeById(challengeId, walletId, walletAddress, valid[valid.length - 1].tx!.to);
        if (txHash) {
          for (const step of valid) {
            updateExecutionState(messageId, step.step, "success", txHash as `0x${string}`);
            stepResults.push({ success: true, tag: step.action });
          }
        } else {
          for (const step of valid) {
            stepResults.push({ success: false, tag: step.action });
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        for (const step of valid) {
          updateExecutionState(messageId, step.step, "failed", undefined, message);
          stepResults.push({ success: false, tag: step.action });
        }
      }

      setIsExecutingAll(false);
      executingRef.current = false;

      if (stepResults.length > 0) {
        recordExecutionResult(stepResults, setReputationTx);
      }
    },
    [social, updateExecutionState]
  );

  return {
    executeStep,
    executeAllSequential,
    executeAllParallel,
    isExecutingAll,
    reputationTx,
    resetExecution,
  };
}
