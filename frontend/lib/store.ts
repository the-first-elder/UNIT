"use client";

import { create } from "zustand";
import type {
  ChatMessage,
  ChainConfig,
  TxExecutionState,
  TxStatus,
  ActivePosition,
} from "./types";

type WalletType = "passkey" | "social" | null;

interface AppState {
  messages: ChatMessage[];
  activeChain: ChainConfig;
  isProcessing: boolean;
  executionStates: Map<string, TxExecutionState>;
  sidebarOpen: boolean;
  executionPanelOpen: boolean;
  walletAddress: string | null;
  walletType: WalletType;
  activePositions: ActivePosition[];

  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setActiveChain: (chain: ChainConfig) => void;
  setIsProcessing: (v: boolean) => void;
  setSidebarOpen: (v: boolean) => void;
  setExecutionPanelOpen: (v: boolean) => void;
  setWallet: (address: string | null, type: WalletType) => void;
  updateExecutionState: (messageId: string, step: number, status: TxStatus, hash?: `0x${string}`, error?: string) => void;
  addActivePosition: (pos: ActivePosition) => void;
  removeActivePosition: (id: string) => void;
  resetExecution: () => void;
  clearMessages: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  messages: [],
  activeChain: { id: "5042002", name: "Arc Testnet", shortName: "ARC", icon: "🧪" },
  isProcessing: false,
  executionStates: new Map(),
  sidebarOpen: true,
  executionPanelOpen: true,
  walletAddress: null,
  walletType: null,
  activePositions: [],

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

  updateExecutionState: (messageId, step, status, txHash, error) =>
    set((s) => {
      const key = `${messageId}:${step}`;
      const nextMap = new Map(s.executionStates);

      const nextMessages = s.messages.map((msg) => {
        if (msg.id === messageId && msg.executionPlan) {
          const plan = msg.executionPlan;
          const updatedStates = plan.states.map((st) => {
            if (st.step.step === step) {
              nextMap.set(key, { step: st.step, status, txHash, error });
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
        return msg;
      });

      return {
        executionStates: nextMap,
        messages: nextMessages,
      };
    }),

  addActivePosition: (pos) =>
    set((s) => ({ activePositions: [pos, ...s.activePositions] })),

  removeActivePosition: (id) =>
    set((s) => ({ activePositions: s.activePositions.filter((p) => p.id !== id) })),

  resetExecution: () => set({ executionStates: new Map() }),

  clearMessages: () => set({ messages: [] }),
}));
