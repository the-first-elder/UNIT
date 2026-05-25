"use client";

import { useCallback, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { useSocialWallet } from "@/components/wallet/wallet-context";
import { useCircleWallet } from "@/hooks/use-circle-wallet";
import type { ExecutionStep, ActivePosition } from "@/lib/types";

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
    const data = await res.json();
    if (!res.ok) {
      console.warn("recordExecutionResult non-ok:", res.status, data);
      return;
    }
    if (data.skipped) {
      console.warn("recordExecutionResult skipped:", data.note);
      return;
    }
    const txHash = data.results?.[0]?.txHash as string | undefined;
    onComplete?.({ txHash, count: data.count, averageScore: data.averageScore });
  } catch (e) {
    console.warn("recordExecutionResult failed:", e);
  }
}

function checkAndRecordPosition(step: ExecutionStep, txHash: string) {
  const { addActivePosition } = useAppStore.getState();
  const id = `${txHash}-${step.step}`;
  const position: ActivePosition = {
    id,
    name: step.action,
    protocol: step.strategy ?? step.chain,
    apy: step.strategy ?? "",
    amount: step.tx?.value ?? "0",
    status: "active",
    chain: step.chain,
    timestamp: Date.now(),
  };
  addActivePosition(position);
}

async function passkeySendTransaction(
  walletId: string,
  to: string,
  data: string,
  contractInfo?: { functionName?: string; args?: Record<string, string> },
): Promise<string | null> {
  const res = await fetch("/api/circle/passkey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sendTransaction", walletId, to, data, contractInfo }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Passkey sendTransaction failed");
  // The challenge was created and executed. Poll for the txHash.
  const challengeId = json.id;
  if (!challengeId) return null;
  for (let i = 0; i < 30; i++) {
    const pollRes = await fetch("/api/circle/passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pollTransaction", walletId }),
    });
    const pollJson = await pollRes.json();
    const tx = (pollJson.transactions || []).find((t: any) => t.id === challengeId);
    if (tx?.state === "COMPLETE") return tx.txHash || challengeId;
    if (tx?.state === "FAILED") throw new Error(tx.reason || "Transaction failed");
    await new Promise((r) => setTimeout(r, 2000));
  }
  return null;
}

async function passkeySendBatch(
  walletId: string,
  walletAddress: string,
  steps: { to: string; data: string; value?: string }[],
): Promise<string | null> {
  const res = await fetch("/api/circle/passkey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sendBatchTransaction", walletId, walletAddress, steps }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Passkey batch failed");
  const challengeId = json.id;
  if (!challengeId) return null;
  for (let i = 0; i < 30; i++) {
    const pollRes = await fetch("/api/circle/passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pollTransaction", walletId }),
    });
    const pollJson = await pollRes.json();
    const tx = (pollJson.transactions || []).find((t: any) => t.id === challengeId);
    if (tx?.state === "COMPLETE") return tx.txHash || challengeId;
    if (tx?.state === "FAILED") throw new Error(tx.reason || "Batch transaction failed");
    await new Promise((r) => setTimeout(r, 2000));
  }
  return null;
}

export function useExecution() {
  const { updateExecutionState, resetExecution } = useAppStore();
  const [isExecutingAll, setIsExecutingAll] = useState(false);
  const [reputationTx, setReputationTx] = useState<ReputationRecord | null>(null);
  const social = useSocialWallet();
  const passkey = useCircleWallet();
  const walletType = useAppStore((s) => s.walletType);
  const executingRef = useRef(false);

  const getWalletInfo = useCallback(() => {
    if (walletType === "passkey") {
      return { walletId: passkey.walletId, walletAddress: passkey.address, type: "passkey" as const };
    }
    return { walletId: social.walletId, walletAddress: social.address, type: "social" as const };
  }, [walletType, passkey.walletId, passkey.address, social.walletId, social.address]);

  const executeStep = useCallback(
    async (step: ExecutionStep, messageId: string) => {
      if (executingRef.current) return;
      setReputationTx(null);

      if (!step.tx?.to) return;
      const tx = step.tx;
      const { walletId, walletAddress, type } = getWalletInfo();
      if (!walletId || !walletAddress) {
        updateExecutionState(messageId, step.step, "failed", undefined, "Wallet not connected");
        return;
      }

      updateExecutionState(messageId, step.step, "executing");
      try {
        let txHash: string | null;
        if (type === "passkey") {
          txHash = await passkeySendTransaction(
            walletId,
            tx.to,
            tx.data ?? "0x",
            step.functionName ? { functionName: step.functionName, args: step.args || {} } : undefined,
          );
        } else {
          txHash = await social.executeTransaction(
            { to: tx.to, data: tx.data, value: tx.value },
            walletId,
            walletAddress,
            step.functionName ? { functionName: step.functionName, args: step.args || {} } : undefined,
          );
        }
        if (txHash) {
          updateExecutionState(messageId, step.step, "success", txHash as `0x${string}`);
          recordExecutionResult([{ success: true, tag: step.action }], setReputationTx);
          checkAndRecordPosition(step, txHash);
        } else {
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
    [social, updateExecutionState, getWalletInfo]
  );

  const executeAllSequential = useCallback(
    async (steps: ExecutionStep[], messageId: string) => {
      executingRef.current = true;
      setIsExecutingAll(true);
      setReputationTx(null);
      const valid = steps.filter((s) => !s.error && s.tx?.to && s.tx?.data);

      const { walletId, walletAddress, type } = getWalletInfo();
      if (!walletId || !walletAddress) {
        setIsExecutingAll(false);
        executingRef.current = false;
        return;
      }

      const stepResults: { success: boolean; tag: string }[] = [];

      for (const step of valid) {
        updateExecutionState(messageId, step.step, "executing");
      }

      try {
        if (type === "passkey") {
          // Execute each step sequentially via passkey API (no challenge split needed)
          for (const step of valid) {
            try {
              const tx = step.tx!;
              const txHash = await passkeySendTransaction(
                walletId,
                tx.to,
                tx.data ?? "0x",
                step.functionName ? { functionName: step.functionName, args: step.args || {} } : undefined,
              );
              if (txHash) {
                updateExecutionState(messageId, step.step, "success", txHash as `0x${string}`);
                stepResults.push({ success: true, tag: step.action });
                checkAndRecordPosition(step, txHash);
              }
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : "Transaction failed";
              updateExecutionState(messageId, step.step, "failed", undefined, message);
              stepResults.push({ success: false, tag: step.action });
            }
          }
        } else {
          // Social flow: create ALL challenges in parallel, execute sequentially
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

          for (const { step, challengeId } of challenges) {
            try {
              const txHash = await social.executeChallengeById(challengeId, walletId, walletAddress, step.tx!.to);
              if (txHash) {
                updateExecutionState(messageId, step.step, "success", txHash as `0x${string}`);
                stepResults.push({ success: true, tag: step.action });
                checkAndRecordPosition(step, txHash);
              }
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : "Transaction failed";
              updateExecutionState(messageId, step.step, "failed", undefined, message);
              stepResults.push({ success: false, tag: step.action });
            }
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Execution failed";
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
    [social, updateExecutionState, getWalletInfo]
  );

  const executeAllParallel = useCallback(
    async (steps: ExecutionStep[], messageId: string) => {
      executingRef.current = true;
      setIsExecutingAll(true);
      setReputationTx(null);
      const valid = steps.filter((s) => !s.error && s.tx?.to && s.tx?.data);

      const { walletId, walletAddress, type } = getWalletInfo();
      if (!walletId || !walletAddress) {
        setIsExecutingAll(false);
        executingRef.current = false;
        return;
      }

      const stepResults: { success: boolean; tag: string }[] = [];

      for (const step of valid) {
        updateExecutionState(messageId, step.step, "executing");
      }

      try {
        let txHash: string | null;
        if (type === "passkey") {
          const batchSteps = valid.map((s) => ({
            to: s.tx!.to,
            data: s.tx!.data,
            value: s.tx!.value,
          }));
          txHash = await passkeySendBatch(walletId, walletAddress, batchSteps);
        } else {
          const batchSteps = valid.map((s) => ({
            to: s.tx!.to,
            data: s.tx!.data,
            value: s.tx!.value,
          }));
          const challengeId = await social.createBatchTransactionChallenge(batchSteps, walletId, walletAddress);
          txHash = await social.executeChallengeById(challengeId, walletId, walletAddress, valid[valid.length - 1].tx!.to);
        }
        if (txHash) {
          for (const step of valid) {
            updateExecutionState(messageId, step.step, "success", txHash as `0x${string}`);
            stepResults.push({ success: true, tag: step.action });
            checkAndRecordPosition(step, txHash);
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
    [social, updateExecutionState, getWalletInfo]
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
