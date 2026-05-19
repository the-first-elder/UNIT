"use client";

import { useCallback, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { useSocialWallet } from "@/components/wallet/wallet-context";
import type { ExecutionStep } from "@/lib/types";

export function useExecution() {
  const { updateExecutionState, resetExecution } = useAppStore();
  const [isExecutingAll, setIsExecutingAll] = useState(false);
  const social = useSocialWallet();
  const executingRef = useRef(false);

  const executeStep = useCallback(
    async (step: ExecutionStep) => {
      if (!step.tx || executingRef.current) return;
      const tx = step.tx;
      const walletId = social.walletId;
      const walletAddress = social.address;
      if (!walletId || !walletAddress) {
        updateExecutionState(step.step, "failed", undefined, "Wallet not connected");
        return;
      }

      updateExecutionState(step.step, "executing");
      try {
        const txHash = await social.executeTransaction(
          { to: tx.to, data: tx.data, value: tx.value },
          walletId,
          walletAddress,
        );
        updateExecutionState(step.step, "success", txHash as `0x${string}`);
        return txHash;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        updateExecutionState(step.step, "failed", undefined, message);
        return null;
      }
    },
    [social, updateExecutionState]
  );

  // Sequential: create + execute one step at a time
  const executeAllSequential = useCallback(
    async (steps: ExecutionStep[]) => {
      executingRef.current = true;
      setIsExecutingAll(true);
      for (const step of steps) {
        if (step.error) {
          updateExecutionState(step.step, "skipped");
          continue;
        }
        await executeStep(step);
      }
      setIsExecutingAll(false);
      executingRef.current = false;
    },
    [executeStep, updateExecutionState]
  );

  // Parallel: create ALL challenges simultaneously, then execute each one by one
  const executeAllParallel = useCallback(
    async (steps: ExecutionStep[]) => {
      executingRef.current = true;
      setIsExecutingAll(true);
      const valid = steps.filter((s) => !s.error && s.tx);
      const walletId = social.walletId;
      const walletAddress = social.address;
      if (!walletId || !walletAddress) {
        setIsExecutingAll(false);
        executingRef.current = false;
        return;
      }

      // Mark all as executing
      for (const step of valid) {
        updateExecutionState(step.step, "executing");
      }

      try {
        // Step 1: Create ALL challenges in parallel (no user interaction needed)
        const challenges: { step: ExecutionStep; challengeId: string }[] = await Promise.all(
          valid.map(async (step) => {
            const tx = step.tx!;
            const challengeId = await social.createTransactionChallenge(
              { to: tx.to, data: tx.data, value: tx.value },
              walletId,
              walletAddress,
            );
            return { step, challengeId };
          }),
        );

        // Step 2: Execute each challenge sequentially (each requires user biometric/PIN approval)
        for (const { step, challengeId } of challenges) {
          try {
            const txHash = await social.executeChallengeById(challengeId);
            updateExecutionState(step.step, "success", txHash as `0x${string}`);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Transaction failed";
            updateExecutionState(step.step, "failed", undefined, message);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Challenge creation failed";
        for (const step of valid) {
          updateExecutionState(step.step, "failed", undefined, message);
        }
      }

      setIsExecutingAll(false);
      executingRef.current = false;
    },
    [social, updateExecutionState]
  );

  return {
    executeStep,
    executeAllSequential,
    executeAllParallel,
    isExecutingAll,
    resetExecution,
  };
}
