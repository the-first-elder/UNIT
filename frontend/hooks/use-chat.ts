"use client";

import { useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { submitPrompt } from "@/lib/api";
import type { ChatMessage, TxExecutionState } from "@/lib/types";

export function useChat() {
  const { addMessage, updateMessage, setIsProcessing, setExecutionPanelOpen, messages } = useAppStore();

  const sendPrompt = useCallback(
    async (text: string, walletAddress: string, chainId: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };
      addMessage(userMsg);

      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isLoading: true,
        isStreaming: true,
      };
      addMessage(assistantMsg);
      setIsProcessing(true);
      setExecutionPanelOpen(true);

      try {
        const response = await submitPrompt(text, walletAddress, chainId);

        const states: TxExecutionState[] = (response.steps || []).map((s) => ({
          step: s,
          status: "pending" as const,
        }));

        updateMessage(assistantId, {
          content: response.content || response.strategy?.summary || response.strategy?.reasoning || "Strategy generated.",
          response,
          executionPlan: { response, states, isComplete: false },
          isLoading: false,
          isStreaming: false,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An error occurred";
        updateMessage(assistantId, {
          content: `Error: ${message}`,
          isStreaming: false,
          isLoading: false,
        });
      }

      setIsProcessing(false);
    },
    [addMessage, updateMessage, setIsProcessing, setExecutionPanelOpen]
  );

  return { sendPrompt, messages };
}
