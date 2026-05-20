"use client";

import { useCallback, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { useSocialWallet } from "@/components/wallet/wallet-context";
import type { ExecutionStep } from "@/lib/types";

export function useExecution() {
  const { updateExecutionState, resetExecution, walletType } = useAppStore();
  const [isExecutingAll, setIsExecutingAll] = useState(false);
  const social = useSocialWallet();
  const executingRef = useRef(false);

  const executeStep = useCallback(
    async (step: ExecutionStep, messageId: string) => {
      if (executingRef.current) return;

      if (walletType === "simulator") {
        updateExecutionState(messageId, step.step, "executing");
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;
        updateExecutionState(messageId, step.step, "success", txHash);
        return txHash;
      }

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
        } else {
          // Challenge was approved but no on-chain confirmation yet — keep as executing
        }
        return txHash;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        updateExecutionState(messageId, step.step, "failed", undefined, message);
        return null;
      }
    },
    [social, updateExecutionState, walletType]
  );

  // Sequential: create all challenges in parallel using callData, execute one by one
  const executeAllSequential = useCallback(
    async (steps: ExecutionStep[], messageId: string) => {
      executingRef.current = true;
      setIsExecutingAll(true);
      const valid = steps.filter((s) => !s.error && ((s.tx?.to && s.tx?.data) || walletType === "simulator"));

      if (walletType === "simulator") {
        for (const step of valid) {
          updateExecutionState(messageId, step.step, "executing");
        }
        // Simulate delay for parallel processing
        await new Promise((resolve) => setTimeout(resolve, 1500));
        for (const step of valid) {
          const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;
          updateExecutionState(messageId, step.step, "success", txHash);
        }
        setIsExecutingAll(false);
        executingRef.current = false;
        return;
      }

      const walletId = social.walletId;
      const walletAddress = social.address;
      if (!walletId || !walletAddress) {
        setIsExecutingAll(false);
        executingRef.current = false;
        return;
      }

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
            }
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Transaction failed";
            updateExecutionState(messageId, step.step, "failed", undefined, message);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Challenge creation failed";
        for (const step of valid) {
          updateExecutionState(messageId, step.step, "failed", undefined, message);
        }
      }

      setIsExecutingAll(false);
      executingRef.current = false;
    },
    [social, updateExecutionState, walletType]
  );

  // Batch: atomic executeBatch via pre-encoded callData (one challenge, all steps in one userOp)
  const executeAllParallel = useCallback(
    async (steps: ExecutionStep[], messageId: string) => {
      executingRef.current = true;
      setIsExecutingAll(true);
      const valid = steps.filter((s) => !s.error && ((s.tx?.to && s.tx?.data) || walletType === "simulator"));

      if (walletType === "simulator") {
        for (const step of valid) {
          updateExecutionState(messageId, step.step, "executing");
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
        for (const step of valid) {
          const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;
          updateExecutionState(messageId, step.step, "success", txHash as `0x${string}`);
        }
        setIsExecutingAll(false);
        executingRef.current = false;
        return;
      }

      const walletId = social.walletId;
      const walletAddress = social.address;
      if (!walletId || !walletAddress) {
        setIsExecutingAll(false);
        executingRef.current = false;
        return;
      }

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
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        for (const step of valid) {
          updateExecutionState(messageId, step.step, "failed", undefined, message);
        }
      }

      setIsExecutingAll(false);
      executingRef.current = false;
    },
    [social, updateExecutionState, walletType]
  );

  return {
    executeStep,
    executeAllSequential,
    executeAllParallel,
    isExecutingAll,
    resetExecution,
  };
}
