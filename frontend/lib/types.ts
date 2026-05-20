export interface Strategy {
  summary: string;
  reasoning: string;
  risk_level: "low" | "moderate" | "high";
  estimated_apy: string;
  protocol: string;
  realistic_expectation_note: string;
}

export interface Option {
  name: string;
  protocol: string;
  apy: string;
  risk: string;
}

export interface Allocation {
  strategy: "vault" | "lending" | "speculation";
  allocation_percent: number;
  amount: string;
  rationale: string;
}

export interface TransactionData {
  to: `0x${string}`;
  data: `0x${string}`;
  value: `0x${string}`;
  chainId?: number;
}

export interface ExecutionStep {
  step: number;
  type: "contract" | "lifi";
  chain: string;
  strategy: "vault" | "lending" | "speculation" | string;
  action: string;
  description: string;
  contractType?: "erc20" | "erc4626" | "lendingPool" | "cToken";
  contractAddress?: `0x${string}`;
  functionName?: string;
  args?: Record<string, string>;
  fromToken?: string;
  toToken?: string;
  fromAmount?: string;
  tx?: TransactionData;
  _approvalAddress?: `0x${string}`;
  error?: string;
  warning?: string;
}

export interface PromptResponse {
  content?: string;
  strategy?: Strategy;
  options?: Option[];
  allocations?: Allocation[];
  steps?: ExecutionStep[];
}

export type TxStatus = "pending" | "executing" | "success" | "failed" | "skipped";

export interface TxExecutionState {
  step: ExecutionStep;
  status: TxStatus;
  txHash?: `0x${string}`;
  error?: string;
}

export interface ExecutionPlan {
  response: PromptResponse;
  states: TxExecutionState[];
  isComplete: boolean;
}

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  response?: PromptResponse;
  executionPlan?: ExecutionPlan;
  isLoading?: boolean;
  isStreaming?: boolean;
}

export interface ChainConfig {
  id: string;
  name: string;
  shortName: string;
  icon: string;
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
  { id: "1", name: "Ethereum", shortName: "ETH", icon: "⟠" },
  { id: "42161", name: "Arbitrum", shortName: "ARB", icon: "🔷" },
  { id: "10", name: "Optimism", shortName: "OP", icon: "🔴" },
  { id: "8453", name: "Base", shortName: "BASE", icon: "🔵" },
  { id: "137", name: "Polygon", shortName: "MATIC", icon: "🟣" },
  { id: "43114", name: "Avalanche", shortName: "AVAX", icon: "❄️" },
  { id: "11155111", name: "Sepolia", shortName: "ETH", icon: "🧪" },
  { id: "5042002", name: "Arc Testnet", shortName: "ARC", icon: "🧪" },
];
