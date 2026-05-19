import { MCPClient, type ServerConfig } from "./index.js";
import {
  encodeIntent,
  resolveAddress,
  type ExecutionIntent,
} from "./txBuilder.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import cors from "cors";
import express from "express";
import type { Request, Response } from "express";

const app = express();
app.use(cors());
app.use(express.json());

const mcpClient = new MCPClient();

const serverConfigs: ServerConfig[] = [
  {
    name: "lifi",
    url: "https://mcp.li.quest/mcp",
    headers: { "X-LiFi-Api-Key": process.env.LIFI_API_KEY ?? "" },
  },
  { name: "defi-yield", command: "python", args: ["-m", "defi_yield_mcp"] },
  { name: "defiborrow", url: "https://defiborrow.loan/mcp" },
  { name: "coingecko", url: "https://mcp.api.coingecko.com/mcp" },
  {
    name: "ccxt",
    command: "node",
    args: ["./node_modules/@lazydino/ccxt-mcp/bin/ccxt-mcp.js"],
  },
  {
    name: "hive-sentiment",
    url: "https://mcp.hiveintelligence.xyz/mcp",
    headers: { Authorization: `Bearer ${process.env.HIVE_API_KEY ?? ""}` },
  },
  { name: "philidor", url: "https://mcp.philidor.io/api/mcp" },
];

async function start() {
  try {
    await mcpClient.connectToServers(serverConfigs);
    const PORT = parseInt(process.env.PORT ?? "3001", 10);
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (e) {
    console.error("Failed to start:", e);
    process.exit(1);
  }
}

// Cache for find_best_yield results — reset per request
let yieldsCache: Array<{
  platform: string;
  url?: string;
  supply_apy?: string;
}> | null = null;
let yieldsChain = "Ethereum";
let yieldsAsset = "USDC";

async function getYields(defiborrowClient?: Client) {
  if (yieldsCache) return yieldsCache;
  if (!defiborrowClient) return [];
  try {
    const result = await defiborrowClient.callTool({
      name: "find_best_yield",
      arguments: { asset: yieldsAsset, chain: yieldsChain, top_n: 10 },
    });
    const text = (
      (result.content as Array<{ text?: string }> | undefined) || []
    )
      .map((c) => c.text)
      .filter(Boolean)
      .join("\n");
    if (!text) return [];
    const data = JSON.parse(text);
    yieldsCache = data.best_yields ?? data.markets ?? [];
  } catch {
    yieldsCache = [];
  }
  return yieldsCache;
}

async function resolveVaultAddress(
  vaultName: string,
  defiborrowClient?: Client,
): Promise<string | null> {
  const yields = await getYields(defiborrowClient);
  if (!yields || !yields.length) return null;
  const nameLower = vaultName.toLowerCase();

  const extract = (url: string) =>
    url.match(/\/vault\/(0x[a-fA-F0-9]{40})/)?.[1] ??
    url.match(/0x[a-fA-F0-9]{40}/)?.[0];

  const match = yields.find(
    (y) => y.platform && nameLower.includes(y.platform.toLowerCase()),
  );
  if (match?.url) {
    const addr = extract(match.url);
    if (addr) return addr;
  }

  for (const y of yields) {
    if (y.url) {
      const addr = extract(y.url);
      if (addr) return addr;
    }
  }
  return null;
}

function replaceUserAddress(obj: unknown, addr: string): unknown {
  if (typeof obj === "string") return obj.replace(/\{\{userAddress\}\}/g, addr);
  if (Array.isArray(obj))
    return obj.map((item) => replaceUserAddress(item, addr));
  if (obj && typeof obj === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj))
      o[k] = replaceUserAddress(v, addr);
    return o;
  }
  return obj;
}

const isValidHexAddr = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s);

async function resolveStepAddress(
  address: string,
  vaultName: string,
  defiborrowClient?: Client,
): Promise<string | null> {
  if (isValidHexAddr(address)) return null;
  return resolveVaultAddress(vaultName, defiborrowClient);
}

async function encodeSteps(
  obj: unknown,
  defiborrowClient?: Client,
  userAddress?: string,
  chainId?: string,
): Promise<unknown> {
  if (Array.isArray(obj))
    return Promise.all(
      obj.map((item) =>
        encodeSteps(item, defiborrowClient, userAddress, chainId),
      ),
    );
  if (!obj || typeof obj !== "object") return obj;

  const o = obj as Record<string, unknown>;

  if (o.contractType && o.contractAddress && o.functionName) {
    const addr = o.contractAddress as string;
    if (/<[^>]+>/.test(addr)) {
      return {
        ...o,
        error: `Placeholder address "${addr}" — must resolve from a tool call`,
      };
    }
    const args = (o.args as Record<string, unknown>) ?? {};
    for (const val of Object.values(args)) {
      if (typeof val === "string" && /<[^>]+>/.test(val)) {
        return {
          ...o,
          error: `Placeholder "${val}" in args — must resolve from a tool call`,
        };
      }
    }
    try {
      const intent: ExecutionIntent = {
        contractType: o.contractType as string,
        contractAddress: o.contractAddress as `0x${string}`,
        functionName: o.functionName as string,
        args: (o.args as Record<string, unknown>) ?? {},
      };

      const vaultName =
        (o.description as string) || (o.protocol as string) || "";
      const resolvedAddr = await resolveStepAddress(
        intent.contractAddress,
        vaultName,
        defiborrowClient,
      );
      if (resolvedAddr) intent.contractAddress = resolvedAddr as `0x${string}`;

      for (const [key, val] of Object.entries(intent.args)) {
        if (typeof val === "string" && !isValidHexAddr(val)) {
          const resolved = await resolveStepAddress(
            val,
            vaultName,
            defiborrowClient,
          );
          if (resolved)
            (intent.args as Record<string, unknown>)[key] = resolved;
        }
      }

      return { ...o, tx: encodeIntent(intent) };
    } catch (e) {
      return { ...o, error: (e as Error).message };
    }
  }

  if (
    o.type === "lifi" &&
    ["buy", "swap", "execute_swap"].includes(o.action as string) &&
    o.fromToken &&
    o.toToken &&
    o.fromAmount &&
    userAddress
  ) {
    try {
      const lifiClient = mcpClient.getServer("lifi");
      const [fromSymbol, toSymbol, fromAmount] = [
        o.fromToken as string,
        o.toToken as string,
        o.fromAmount as string,
      ];

      const lifiChain = chainId || "1";
      const resolveToken = async (symbol: string) => {
        const res = await lifiClient?.callTool({
          name: "get-token",
          arguments: { chain: lifiChain, token: symbol },
        });
        const text = (
          (res?.content as Array<{ text?: string }> | undefined) || []
        )
          .map((c) => c.text)
          .filter(Boolean)
          .join("\n");
        if (!text) return null;
        try {
          return JSON.parse(text).address || null;
        } catch {
          return null;
        }
      };

      const [fromAddr, toAddr] = await Promise.all([
        resolveToken(fromSymbol),
        resolveToken(toSymbol),
      ]);

      if (!toAddr) {
        const vaultAddr = await resolveVaultAddress(toSymbol, defiborrowClient);
        if (vaultAddr) {
          const intent: ExecutionIntent = {
            contractType: "erc4626",
            contractAddress: vaultAddr as `0x${string}`,
            functionName: "deposit",
            args: { assets: fromAmount, receiver: userAddress },
          };
          return {
            ...o,
            type: "contract",
            contractType: "erc4626",
            contractAddress: vaultAddr,
            functionName: "deposit",
            args: { assets: fromAmount, receiver: userAddress },
            tx: encodeIntent(intent),
            fromToken: undefined,
            toToken: undefined,
            fromAmount: undefined,
          };
        }
      }

      if (!fromAddr || !toAddr)
        throw new Error(`Cannot resolve: ${!fromAddr ? fromSymbol : toSymbol}`);

      const quoteResult = await lifiClient?.callTool({
        name: "get-quote",
        arguments: {
          fromChain: lifiChain,
          toChain: lifiChain,
          fromToken: fromAddr,
          toToken: toAddr,
          fromAmount,
          fromAddress: userAddress,
        },
      });
      const quoteText = (
        (quoteResult?.content as Array<{ text?: string }> | undefined) || []
      )
        .map((c) => c.text)
        .filter(Boolean)
        .join("\n");
      const quoteData = JSON.parse(quoteText);
      const txReq =
        quoteData.transactionRequest || quoteData.estimate?.transactionRequest;
      if (txReq) {
        o.tx = {
          to: txReq.to,
          data: txReq.data,
          value: txReq.value || "0x0",
          chainId: txReq.chainId || 1,
        };
        const approvalAddr = quoteData.estimate?.approvalAddress;
        if (approvalAddr)
          (o as Record<string, unknown>)._approvalAddress = approvalAddr;
      }
    } catch (e) {
      return {
        ...o,
        error: `LI.FI auto-resolve failed: ${(e as Error).message}`,
        ...(o.tx ? { tx: o.tx } : {}),
      };
    }
  }

  const encoded: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o))
    encoded[k] = await encodeSteps(v, defiborrowClient, userAddress, chainId);
  return encoded;
}

const CHAIN_NAMES: Record<string, string> = {
  "1": "Ethereum",
  "42161": "Arbitrum",
  "10": "Optimism",
  "8453": "Base",
  "137": "Polygon",
  "43114": "Avalanche",
  "56": "BSC",
};

app.post("/v1/begin", async (req: Request, res: Response) => {
  const { userPrompt, userWallet, chainId } = req.body;
  const missing: string[] = [];
  if (!userPrompt) missing.push("userPrompt");
  if (!userWallet) missing.push("userWallet");
  if (!chainId) missing.push("chainId");
  if (missing.length) {
    res
      .status(400)
      .json({
        message: `Missing required fields: ${missing.join(", ")}`,
        status: 400,
      });
    return;
  }
  const chainIdStr = String(chainId);
  const chainName = CHAIN_NAMES[chainIdStr] || `Chain-${chainIdStr}`;
  console.log(
    "userPrompt:",
    userPrompt,
    "userWallet:",
    userWallet,
    "chainId:",
    chainId,
  );
  yieldsCache = null;
  yieldsChain = CHAIN_NAMES[chainIdStr] || chainIdStr;
  yieldsAsset = "USDC";

  try {
    let result = await mcpClient.chatMessage(
      `User wants: ${userPrompt}. Wallet: ${userWallet}. Chain: "${chainName}" (chainId: ${chainId}). STRICT RULE: You MUST use this chain for ALL tool calls and output it in EVERY step's chain field. Never output "Ethereum" unless chainId is 1. Execute the optimal strategy — call tools, return JSON execution plan. Do not refuse or give warnings.`,
    );

    let responseData: unknown = result;

    if (typeof result === "string") {
      const clean = result
        .trim()
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "");
      const jsonStr = clean.startsWith("```")
        ? clean.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")
        : clean;
      try {
        let parsed = JSON.parse(jsonStr);
        if (userWallet) parsed = replaceUserAddress(parsed, userWallet);
        const defiborrowClient = mcpClient.getServer("defiborrow");
        responseData = await encodeSteps(
          parsed,
          defiborrowClient,
          userWallet,
          String(chainId),
        );

        const steps = (responseData as Record<string, unknown>)?.steps as
          | Array<Record<string, unknown>>
          | undefined;
        if (steps) {
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const args = step.args as Record<string, unknown> | undefined;
            if (args) {
              const addressArgs = new Set([
                "spender",
                "receiver",
                "owner",
                "asset",
                "onBehalfOf",
                "to",
              ]);
              const amountArgs = new Set([
                "amount",
                "assets",
                "mintAmount",
                "shares",
                "redeemTokens",
                "borrowAmount",
                "repayAmount",
              ]);
              for (const [key, val] of Object.entries(args)) {
                if (typeof val !== "string") continue;
                if (addressArgs.has(key)) continue;
                if (amountArgs.has(key) && !/^\d+$/.test(val)) {
                  let corrected = false;
                  let correctAmount: string | undefined;
                  if (
                    !correctAmount &&
                    step.functionName === "borrow" &&
                    i + 1 < steps.length
                  ) {
                    const nextStep = steps[i + 1];
                    correctAmount = nextStep.fromAmount as string | undefined;
                  }
                  if (!correctAmount) {
                    const allocations = (
                      responseData as Record<string, unknown>
                    )?.allocations as
                      | Array<Record<string, unknown>>
                      | undefined;
                    const allocation = allocations?.find(
                      (a) => a.strategy === step.strategy,
                    );
                    correctAmount = allocation?.amount as string | undefined;
                  }
                  if (correctAmount && /^\d+$/.test(correctAmount)) {
                    (args as Record<string, unknown>)[key] = correctAmount;
                    corrected = true;
                  }
                  if (corrected) {
                    if (
                      step.type === "lifi" &&
                      step.action === "approve" &&
                      i + 1 < steps.length
                    ) {
                      const nextStep = steps[i + 1];
                      const approvalAddr = (nextStep as Record<string, unknown>)
                        ._approvalAddress as string | undefined;
                      if (approvalAddr)
                        (args as Record<string, unknown>).spender =
                          approvalAddr;
                    }
                    try {
                      const intent: ExecutionIntent = {
                        contractType: step.contractType as string,
                        contractAddress: step.contractAddress as `0x${string}`,
                        functionName: step.functionName as string,
                        args: step.args as Record<string, unknown>,
                      };
                      step.tx = encodeIntent(intent);
                    } catch (e) {
                      steps[i] = {
                        ...step,
                        error: `Re-encode failed: ${(e as Error).message}`,
                      };
                    }
                  } else {
                    steps[i] = {
                      ...step,
                      error: `Invalid ${key}: "${val}" — must be a numeric amount`,
                    };
                  }
                } else if (
                  !/^\d+$/.test(val) &&
                  !/^0x[a-fA-F0-9]{40}$/.test(val)
                ) {
                  steps[i] = {
                    ...step,
                    error: `Invalid ${key}: "${val}" — not a number or valid address`,
                  };
                }
              }
            }
            if (
              (step.action === "buy" ||
                step.action === "swap" ||
                step.action === "execute_swap") &&
              step.type !== "lifi"
            ) {
              if (!step.error)
                steps[i] = {
                  ...step,
                  error: `"${step.action}" action requires type "lifi" — got "${step.type}"`,
                };
            }
            if (step.action === "approve" && i + 1 < steps.length) {
              const nextStep = steps[i + 1];
              const spender = (args as Record<string, string> | undefined)
                ?.spender;
              const nextAddr = nextStep.contractAddress as string | undefined;
              if (
                spender &&
                nextAddr &&
                spender.toLowerCase() !== nextAddr.toLowerCase() &&
                step.strategy !== "speculation" &&
                step.strategy !== "swap"
              ) {
                if (!step.error)
                  step.warning = `Approve spender ${spender} ≠ next address ${nextAddr}`;
              }
            }
            const tx = step.tx as Record<string, unknown> | undefined;
            if (
              tx &&
              typeof tx.data === "string" &&
              tx.data.length > 0 &&
              tx.data.length < 10
            ) {
              if (!step.error)
                steps[i] = {
                  ...step,
                  error: `Placeholder tx data: "${tx.data}" — step not resolved`,
                };
            }
          }
        }
      } catch {
        /* not JSON, pass through */
      }
    }

    console.log("response:", responseData);
    res.json({ message: responseData });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error(e);
    res.status(500).json({ message: errMsg || "Processing error" });
  }
});

app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ message: "Unknown endpoint. Use POST /v1/begin", status: 404 });
});

start();
