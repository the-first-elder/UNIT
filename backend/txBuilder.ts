import { encodeFunctionData, getAddress, isAddress, type Hex } from "viem";

const erc20Abi = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

const erc4626Abi = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeem",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

const lendingPoolAbi = [
  {
    type: "function",
    name: "supply",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "borrow",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interestRateMode", type: "uint256" },
      { name: "referralCode", type: "uint16" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "repay",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interestRateMode", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

const cTokenAbi = [
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "mintAmount", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeem",
    inputs: [
      { name: "redeemTokens", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "borrow",
    inputs: [
      { name: "borrowAmount", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "repayBorrow",
    inputs: [
      { name: "repayAmount", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "payable",
  },
] as const;

const registry: Record<string, readonly unknown[]> = {
  erc20: erc20Abi,
  erc4626: erc4626Abi,
  lendingPool: lendingPoolAbi,
  cToken: cTokenAbi,
};

const ARG_DEFAULTS: Record<string, unknown> = {
  referralCode: 0,
  interestRateMode: 2,
};

export function resolveAddress(addr: string): Hex {
  if (isValidEvmAddress(addr)) return getAddress(addr);
  throw new Error(`Invalid address "${addr}" — must be a 0x-prefixed hex address`);
}

export type ExecutionIntent = {
  contractType: string;
  contractAddress: Hex;
  functionName: string;
  args: Record<string, unknown>;
};

export type EncodedTx = {
  to: Hex;
  data: Hex;
  value: Hex;
};

function isValidEvmAddress(v: unknown): v is Hex {
  return typeof v === "string" && isAddress(v, { strict: false });
}

function intentToArgs(intent: ExecutionIntent): readonly unknown[] {
  const abi = registry[intent.contractType] as readonly {
    name: string;
    inputs: { name: string; type: string }[];
  }[] | undefined;
  if (!abi) throw new Error(`Unknown contractType: ${intent.contractType}`);

  const fn = abi.find(
    (f: any) => f.name === intent.functionName,
  ) as { inputs: { name: string; type: string }[] } | undefined;
  if (!fn) throw new Error(`Unknown function: ${intent.functionName}`);

  return fn.inputs.map((input) => {
    let val = intent.args[input.name];
    if (val === undefined) {
      val = ARG_DEFAULTS[input.name];
      if (val === undefined) throw new Error(`Missing arg: ${input.name}`);
    }
    if (input.type === "address") {
      val = resolveAddress(val as string);
    }
    return val;
  });
}

export function encodeIntent(intent: ExecutionIntent): EncodedTx {
  const contractAddress = resolveAddress(intent.contractAddress);
  const abi = registry[intent.contractType];
  if (!abi) throw new Error(`Unknown contractType: ${intent.contractType}`);

  const args = intentToArgs(intent);

  const data = encodeFunctionData({
    abi,
    functionName: intent.functionName,
    args,
  });

  return {
    to: contractAddress,
    data,
    value: "0x0",
  };
}
