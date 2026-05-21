import { MCPClient, type ServerConfig } from "./index.js";
import { encodeIntent, type ExecutionIntent } from "./txBuilder.js";
import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import { DEFI_YIELD_TOOLS, callDefiYieldTool } from "./defiYieldTools.js";
import {
  LIFI_TOOLS,
  callLifiTool,
  lifiGetToken,
  lifiGetQuote,
} from "./lifiTools.js";
import { DEFIBORROW_TOOLS, callDefiborrowTool } from "./defiborrowTools.js";
import { COINGECKO_TOOLS, callCoingeckoTool } from "./coingeckoTools.js";
import { CCXT_TOOLS, callCcxtTool } from "./ccxtTools.js";
import { PHILIDOR_TOOLS, callPhilidorTool } from "./philidorTools.js";
import { HIVE_TOOLS, callHiveTool } from "./hiveTools.js";

const app = express();
// app.use(cors());
app.use(express.json());
app.use(
  cors({
    origin: "https://unit-jkz9.vercel.app",
  }),
);

const mcpClient = new MCPClient();

const serverConfigs: ServerConfig[] = [];

async function start() {
  const errors: string[] = [];
  try {
    await mcpClient.connectToServers(serverConfigs);
  } catch (e) {
    errors.push(
      `connectToServers: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  try {
    await mcpClient.addLocalTools(
      "defi-yield",
      DEFI_YIELD_TOOLS,
      callDefiYieldTool,
    );
    await mcpClient.addLocalTools("lifi", LIFI_TOOLS, callLifiTool);
    await mcpClient.addLocalTools(
      "defiborrow",
      DEFIBORROW_TOOLS,
      callDefiborrowTool,
    );
    await mcpClient.addLocalTools(
      "coingecko",
      COINGECKO_TOOLS,
      callCoingeckoTool,
    );
    await mcpClient.addLocalTools("ccxt", CCXT_TOOLS, callCcxtTool);
    await mcpClient.addLocalTools("philidor", PHILIDOR_TOOLS, callPhilidorTool);
    await mcpClient.addLocalTools("hive", HIVE_TOOLS, callHiveTool);
  } catch (e) {
    errors.push(`addLocalTools: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (errors.length) console.warn("Init completed with errors:", errors);
  const PORT = parseInt(process.env.PORT ?? "3001", 10);
  if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  }
}

let initDone = false;
let initError: string | null = null;
start()
  .then(() => {
    initDone = true;
    console.log("Server initialization complete");
  })
  .catch((e) => {
    initError = e instanceof Error ? e.message : String(e);
    console.error("Init failed:", e);
  });

app.use((_req: Request, _res: Response, next: () => void) => {
  if (initDone) return next();
  if (initError) {
    console.warn("Init had errors, proceeding anyway:", initError);
    initDone = true;
    return next();
  }
  setImmediate(() => {
    if (initDone) return next();
    initDone = true;
    next();
  });
});

// Cache for find_best_yield results — reset per request
let yieldsCache: Array<{
  platform: string;
  url?: string;
  supply_apy?: string;
}> | null = null;
let yieldsChain = "Ethereum";
let yieldsAsset = "USDC";

async function getYields(useCache = true) {
  if (useCache && yieldsCache) return yieldsCache;
  try {
    const result = await callDefiborrowTool("find_best_yield", {
      asset: yieldsAsset,
      chain: yieldsChain,
      top_n: 10,
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

async function resolveVaultAddress(vaultName: string): Promise<string | null> {
  const yields = await getYields();
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
): Promise<string | null> {
  if (isValidHexAddr(address)) return null;
  return resolveVaultAddress(vaultName);
}

async function encodeSteps(
  obj: unknown,
  userAddress?: string,
  chainId?: string,
): Promise<unknown> {
  if (Array.isArray(obj))
    return Promise.all(
      obj.map((item) => encodeSteps(item, userAddress, chainId)),
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
      );
      if (resolvedAddr) intent.contractAddress = resolvedAddr as `0x${string}`;

      for (const [key, val] of Object.entries(intent.args)) {
        if (typeof val === "string" && !isValidHexAddr(val)) {
          const resolved = await resolveStepAddress(val, vaultName);
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
      const [fromSymbol, toSymbol, fromAmount] = [
        o.fromToken as string,
        o.toToken as string,
        o.fromAmount as string,
      ];

      const lifiChain = chainId || "1";
      const resolveToken = async (symbol: string) => {
        if (/^0x[a-fA-F0-9]{40}$/.test(symbol)) return symbol;
        const result = await lifiGetToken(lifiChain, symbol);
        return result?.address || null;
      };

      const [fromAddr, toAddr] = await Promise.all([
        resolveToken(fromSymbol),
        resolveToken(toSymbol),
      ]);

      if (!toAddr) {
        const vaultAddr = await resolveVaultAddress(toSymbol);
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
        return { ...o, error: `Cannot resolve token: ${toSymbol}` };
      }

      if (!fromAddr)
        return { ...o, error: `Cannot resolve token: ${fromSymbol}` };

      const quoteData = await lifiGetQuote(
        lifiChain,
        lifiChain,
        fromAddr,
        toAddr,
        fromAmount,
        userAddress,
      );

      if (!quoteData) {
        return { ...o, error: "LI.FI quote returned empty response" };
      }

      const qd = quoteData as Record<string, unknown>;
      const txReq =
        (qd.transactionRequest as
          | { to: string; data: string; value: string }
          | undefined) ||
        ((qd.estimate as Record<string, unknown> | undefined)
          ?.transactionRequest as
          | { to: string; data: string; value: string }
          | undefined);
      if (!txReq) {
        return {
          ...o,
          error: "LI.FI quote did not include transactionRequest data",
        };
      }
      o.tx = {
        to: txReq.to,
        data: txReq.data,
        value: txReq.value || "0x0",
        chainId:
          ((qd.action as Record<string, unknown> | undefined)?.fromChainId as
            | number
            | undefined) ||
          parseInt(lifiChain) ||
          1,
      };
      const approvalAddr = (qd.estimate as Record<string, unknown> | undefined)
        ?.approvalAddress as string | undefined;
      if (approvalAddr)
        (o as Record<string, unknown>)._approvalAddress = approvalAddr;
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
    encoded[k] = await encodeSteps(v, userAddress, chainId);
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
  "11155111": "Sepolia",
  "5042002": "Arc Testnet",
};

app.post("/v1/begin", async (req: Request, res: Response) => {
  const { userPrompt, userWallet, chainId } = req.body;
  const missing: string[] = [];
  if (!userPrompt) missing.push("userPrompt");
  if (!userWallet) missing.push("userWallet");
  if (!chainId) missing.push("chainId");
  if (missing.length) {
    res.status(400).json({
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
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^```(?:json)?\s*/, "")
        .replace(/\s*```$/, "")
        .split("\n")
        .filter((line) => !/^\s*\/\//.test(line))
        .join("\n");
      const jsonStr =
        clean.startsWith("{") || clean.startsWith("[")
          ? clean
          : clean.replace(/^[^{[]+/, "");
      try {
        let parsed = JSON.parse(jsonStr);
        if (userWallet) parsed = replaceUserAddress(parsed, userWallet);
        responseData = await encodeSteps(parsed, userWallet, String(chainId));

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
      } catch (err) {
        console.warn(
          "Failed to parse/encode AI response, sending raw result:",
          err,
        );
      }
    } else if (result === null || result === undefined) {
      console.warn("AI returned null/undefined response");
      responseData = {
        error: "AI returned empty response",
        raw: String(result ?? ""),
      };
    }

    if (responseData === null || responseData === undefined) {
      responseData = {
        error: "Empty response from AI",
        raw: String(result ?? ""),
      };
    }

    if (typeof responseData === "string") {
      console.warn(
        "responseData is still a raw string — wrapping in fallback object",
      );
      responseData = {
        strategy: {
          summary: responseData.slice(0, 200),
          reasoning: "",
          risk_level: "moderate" as const,
          estimated_apy: "",
          protocol: "",
          realistic_expectation_note: "",
        },
        options: [],
        allocations: [],
        steps: [],
      };
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

export default app;
