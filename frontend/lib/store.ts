"use client";

import { create } from "zustand";
import type {
  ChatMessage,
  ChainConfig,
  ExecutionStep,
  TxExecutionState,
  TxStatus,
} from "./types";

type WalletType = "passkey" | "social" | null;

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
      const next = new Map(s.executionStates);
      const existing = next.get(step);
      next.set(step, {
        step: existing?.step || { step, type: "contract", chain: "", strategy: "", action: "", description: "" } as ExecutionStep,
        status,
        txHash,
        error,
      });
      return { executionStates: next };
    }),

  resetExecution: () => set({ executionStates: new Map() }),

  clearMessages: () => set({ messages: [] }),
}));
