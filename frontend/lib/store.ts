"use client";

import { create } from "zustand";
import type {
  ChatMessage,
  ChainConfig,
  ExecutionStep,
  TxExecutionState,
  TxStatus,
} from "./types";

type WalletType = "passkey" | "social" | "simulator" | null;

interface AppState {
  messages: ChatMessage[];
  activeChain: ChainConfig;
  isProcessing: boolean;
  executionStates: Map<number, TxExecutionState>;
  sidebarOpen: boolean;
  executionPanelOpen: boolean;
  walletAddress: string | null;
  walletType: WalletType;

  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setActiveChain: (chain: ChainConfig) => void;
  setIsProcessing: (v: boolean) => void;
  setSidebarOpen: (v: boolean) => void;
  setExecutionPanelOpen: (v: boolean) => void;
  setWallet: (address: string | null, type: WalletType) => void;
  updateExecutionState: (step: number, status: TxStatus, hash?: `0x${string}`, error?: string) => void;
  resetExecution: () => void;
  clearMessages: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  messages: [],
  activeChain: { id: "1", name: "Ethereum", shortName: "ETH", icon: "⟠" },
  isProcessing: false,
  executionStates: new Map(),
  sidebarOpen: true,
  executionPanelOpen: true,
  walletAddress: null,
  walletType: null,

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  setActiveChain: (chain) => set({ activeChain: chain }),
  setIsProcessing: (v) => set({ isProcessing: v }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setExecutionPanelOpen: (v) => set({ executionPanelOpen: v }),
  setWallet: (address, type) => set({ walletAddress: address, walletType: type }),

  updateExecutionState: (step, status, txHash, error) =>
    set((s) => {
      const nextMap = new Map(s.executionStates);
      const existing = nextMap.get(step);
      nextMap.set(step, {
        step: existing?.step || { step, type: "contract", chain: "", strategy: "", action: "", description: "" } as ExecutionStep,
        status,
        txHash,
        error,
      });

      // Update the status in the assistant message's execution plan that contains this step
      const nextMessages = s.messages.map((msg) => {
        if (msg.role === "assistant" && msg.executionPlan) {
          const plan = msg.executionPlan;
          const hasStep = plan.states.some((st) => st.step.step === step);
          if (hasStep) {
            const updatedStates = plan.states.map((st) => {
              if (st.step.step === step) {
                return { ...st, status, txHash, error };
              }
              return st;
            });
            const isComplete = updatedStates.every(
              (st) => st.status === "success" || st.status === "failed" || st.status === "skipped"
            );
            return {
              ...msg,
              executionPlan: {
                ...plan,
                states: updatedStates,
                isComplete,
              },
            };
          }
        }
        return msg;
      });

      return {
        executionStates: nextMap,
        messages: nextMessages,
      };
    }),

  resetExecution: () => set({ executionStates: new Map() }),

  clearMessages: () => set({ messages: [] }),
}));
