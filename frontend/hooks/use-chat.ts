"use client";

import { useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { submitPrompt } from "@/lib/api";
import type { ChatMessage, TxExecutionState, PromptResponse } from "@/lib/types";

// Dynamic mock strategies for simulator/sandbox runs
function getMockStrategyResponse(text: string, walletAddress: string): PromptResponse {
  const query = text.toLowerCase();
  const isApy = query.includes("apy") || query.includes("yield") || query.includes("grow");
  const isArbitrum = query.includes("arbitrum") || query.includes("arb");
  const isBase = query.includes("base");

  if (isArbitrum || query.includes("arb")) {
    return {
      strategy: {
        summary: "Leveraged USDC Compounding Loop on Arbitrum Aave v3",
        reasoning: "Deposits USDC into Aave v3 on Arbitrum, borrows stablecoin assets against the deposit to loop back into Aave, boosting native yield efficiency.",
        risk_level: "moderate",
        estimated_apy: "18.40%",
        protocol: "Aave v3",
        realistic_expectation_note: "Yields update continuously. Liquidations are safeguarded by keeping health factor above 1.5x."
      },
      options: [
        { name: "Aave v3 USDC Vault", protocol: "Aave", apy: "18.40%", risk: "moderate" },
        { name: "Camelot USDC-USDT LP", protocol: "Camelot", apy: "8.20%", risk: "low" },
      ],
      allocations: [
        { strategy: "lending", allocation_percent: 100, amount: "", rationale: "Concentrated leveraged loop for optimized stable lending returns" },
      ],
      steps: [
        {
          step: 1,
          type: "contract",
          chain: "42161",
          strategy: "lending",
          action: "approve",
          description: "Approve Aave Pool to transfer USDC from your wallet",
          contractType: "erc20",
          contractAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          functionName: "approve",
          args: { spender: "0x794a61358d6845594f94dc1db02a252b5b4814ad", amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935" },
        },
        {
          step: 2,
          type: "contract",
          chain: "42161",
          strategy: "lending",
          action: "supply",
          description: "Supply USDC into Aave v3 Pool to begin earning interest",
          contractType: "lendingPool",
          contractAddress: "0x794a61358d6845594f94dc1db02a252b5b4814ad",
          functionName: "supply",
          args: { asset: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", amount: "{{depositAmount}}", onBehalfOf: walletAddress, referralCode: "0" },
        }
      ]
    };
  }

  if (isBase) {
    return {
      strategy: {
        summary: "Aerodrome Finance USDbC-USDC Yield Strategy on Base",
        reasoning: "Swaps a portion of assets to match pool liquidity, deposits into the Aerodrome Stable Pool, and stakes LP tokens into the Aerodrome Gauge.",
        risk_level: "low",
        estimated_apy: "24.50%",
        protocol: "Aerodrome Finance",
        realistic_expectation_note: "Yield paid in AERO rewards. Can be claimed and auto-compounded at any time."
      },
      options: [
        { name: "Aerodrome USDbC-USDC Pool", protocol: "Aerodrome", apy: "24.50%", risk: "low" },
        { name: "Moonwell USDC lending", protocol: "Moonwell", apy: "6.90%", risk: "low" },
      ],
      allocations: [
        { strategy: "vault", allocation_percent: 80, amount: "", rationale: "Primary staking yield in the stable pool gauge" },
        { strategy: "lending", allocation_percent: 20, amount: "", rationale: "Secondary liquid reserve earning interest" },
      ],
      steps: [
        {
          step: 1,
          type: "contract",
          chain: "8453",
          strategy: "vault",
          action: "approve",
          description: "Approve Aerodrome Router to spend USDC",
          contractType: "erc20",
          contractAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          functionName: "approve",
          args: { spender: "0xcf77a682147d209c537454355f59b0cd1579b302", amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935" },
        },
        {
          step: 2,
          type: "contract",
          chain: "8453",
          strategy: "vault",
          action: "addLiquidity",
          description: "Add liquidity into Aerodrome stable pool and receive LP tokens",
          contractType: "erc20",
          contractAddress: "0xcf77a682147d209c537454355f59b0cd1579b302",
          functionName: "addLiquidity",
          args: { tokenA: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", tokenB: "0xd9aaec86b65d86f6a7b5b12c3c94d80d90a823cf", stable: "true", amountADesired: "{{amount}}", amountBDesired: "{{amount}}", receiver: walletAddress }
        }
      ]
    };
  }

  // Default: Euler USDC Vault on Mainnet
  return {
    strategy: {
      summary: "High Yield Euler USDC ERC4626 Vault Strategy",
      reasoning: "Allocates USDC into the Euler USDC ERC4626 vault on Ethereum mainnet, which has the highest risk-adjusted yield for stables among top-tier lending pools.",
      risk_level: "low",
      estimated_apy: "54.00%",
      protocol: "Euler",
      realistic_expectation_note: "Yield rate is volatile based on borrow demand. Funds can be withdrawn instantly without fee."
    },
    options: [
      { name: "Euler USDC Vault", protocol: "Euler", apy: "54.00%", risk: "low" },
      { name: "Aave v3 USDC Vault", protocol: "Aave", apy: "5.10%", risk: "low" },
    ],
    allocations: [
      { strategy: "vault", allocation_percent: 100, amount: "", rationale: "Full allocation into highest yielding ERC4626 vault for maximal safe returns" },
    ],
    steps: [
      {
        step: 1,
        type: "contract",
        chain: "1",
        strategy: "vault",
        action: "approve",
        description: "Approve the Euler USDC vault to transfer USDC from your wallet",
        contractType: "erc20",
        contractAddress: "0xA0b86991c6218b36c1d19D4a2e9EB0cE3606eB48",
        functionName: "approve",
        args: { spender: "0xcBC9B61177444A793B85442D3a953B90f6170b7D", amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935" },
      },
      {
        step: 2,
        type: "contract",
        chain: "1",
        strategy: "vault",
        action: "deposit",
        description: "Deposit USDC into the Euler ERC4626 vault to start compounding yield",
        contractType: "erc4626",
        contractAddress: "0xcBC9B61177444A793B85442D3a953B90f6170b7D",
        functionName: "deposit",
        args: { assets: "{{depositAmount}}", receiver: walletAddress }
      }
    ]
  };
}

export function useChat() {
  const { addMessage, updateMessage, setIsProcessing, setExecutionPanelOpen, messages, walletType } = useAppStore();

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

      // Simulator Mode: bypass API call completely and return mockup response with a slight delay
      if (walletType === "simulator") {
        await new Promise((resolve) => setTimeout(resolve, 1800));
        const response = getMockStrategyResponse(text, walletAddress);
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
        setIsProcessing(false);
        return;
      }

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
        console.warn("Backend API error, falling back to client-side strategy simulation:", err);
        
        // Wait a small moment to mimic processing before falling back
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const response = getMockStrategyResponse(text, walletAddress);
        const states: TxExecutionState[] = (response.steps || []).map((s) => ({
          step: s,
          status: "pending" as const,
        }));
        
        updateMessage(assistantId, {
          content: `(Simulated Fallback) ${response.strategy?.summary || "Strategy generated."}`,
          response,
          executionPlan: { response, states, isComplete: false },
          isLoading: false,
          isStreaming: false,
        });
      }

      setIsProcessing(false);
    },
    [addMessage, updateMessage, setIsProcessing, setExecutionPanelOpen, walletType]
  );

  return { sendPrompt, messages };
}
