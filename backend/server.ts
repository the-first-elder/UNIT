import { MCPClient, type ServerConfig } from "./index.js";
import { encodeIntent, resolveAddress, type ExecutionIntent } from "./txBuilder.js";
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
  {
    name: "defi-yield",
    command: "python",
    args: ["-m", "defi_yield_mcp"],
  },
  {
    name: "defiborrow",
    url: "https://defiborrow.loan/mcp",
  },
  {
    name: "coingecko",
    url: "https://mcp.api.coingecko.com/mcp",
  },
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
  {
    name: "philidor",
    url: "https://mcp.philidor.io/api/mcp",
  },
];

async function start() {
  try {
    await mcpClient.connectToServers(serverConfigs);
    const PORT = parseInt(process.env.PORT ?? "3001", 10);
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (e) {
    console.error("Failed to start:", e);
    process.exit(1);
  }
}

async function resolveVaultAddress(
  vaultName: string,
  defiborrowClient?: Client,
): Promise<string | null> {
  if (!defiborrowClient) return null;
  try {
    const result = await defiborrowClient.callTool({
      name: "find_best_yield",
      arguments: { asset: "USDC", chain: "Ethereum", top_n: 10 },
    });
    const content = result.content as Array<{ text?: string }> | undefined;
    const text = content?.map((c) => c.text).filter(Boolean).join("\n");
    if (!text) return null;

    // defiborrow returns JSON — parse it
    const data = JSON.parse(text);
    const yields: Array<{ platform: string; url?: string; supply_apy?: string }> = data.best_yields ?? data.markets ?? [];
    const nameLower = vaultName.toLowerCase();

    // try matching platform name
    const match = yields.find(
      (y) => y.platform && nameLower.includes(y.platform.toLowerCase()),
    );
    if (match?.url) {
      const extracted = match.url.match(/\/vault\/(0x[a-fA-F0-9]{40})/)?.[1]
        ?? match.url.match(/0x[a-fA-F0-9]{40}/)?.[0];
      if (extracted) return extracted;
    }

    // fallback: any url with an address
    for (const y of yields) {
      if (y.url) {
        const extracted = y.url.match(/\/vault\/(0x[a-fA-F0-9]{40})/)?.[1]
          ?? y.url.match(/0x[a-fA-F0-9]{40}/)?.[0];
        if (extracted) return extracted;
      }
    }

    return text.match(/0x[a-fA-F0-9]{40}/)?.[0] ?? null;
  } catch {
    return null;
  }
}

function replaceUserAddress(obj: unknown, addr: string): unknown {
  if (typeof obj === "string") return obj.replace(/\{\{userAddress\}\}/g, addr);
  if (Array.isArray(obj)) return obj.map((item) => replaceUserAddress(item, addr));
  if (obj && typeof obj === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      o[k] = replaceUserAddress(v, addr);
    }
    return o;
  }
  return obj;
}

async function encodeSteps(obj: unknown, defiborrowClient?: Client, userAddress?: string): Promise<unknown> {
  if (Array.isArray(obj)) return Promise.all(obj.map((item) => encodeSteps(item, defiborrowClient, userAddress)));
  if (obj && typeof obj === "object") {
    const o = obj as Record<string, unknown>;

    // resolve {{placeholders}} in execution_intent or flat fields
    const maybeResolve = (addr: unknown): unknown => {
      if (typeof addr !== "string") return addr;
      if (addr.startsWith("{{") && addr.endsWith("}}")) {
        const key = addr.slice(2, -2);
        try {
          return resolveAddress(addr);
        } catch {
          // try defiborrow lookup for vault addresses
          return addr; // keep placeholder, will error in encodeIntent
        }
      }
      return addr;
    };

    const tryEncode = async (intent: ExecutionIntent) => {
      if (intent.contractAddress.startsWith("{{")) {
        const vaultName = (o.description as string) || (o.protocol as string) || "";
        const resolved = await resolveVaultAddress(vaultName, defiborrowClient);
        if (resolved) intent.contractAddress = resolved as `0x${string}`;
      }
      for (const [key, val] of Object.entries(intent.args)) {
        if (typeof val === "string" && val.startsWith("{{")) {
          try {
            (intent.args as Record<string, unknown>)[key] = resolveAddress(val);
          } catch {}
        }
      }
      return encodeIntent(intent);
    };

    if (o.execution_intent) {
      try {
        const encoded = await tryEncode(o.execution_intent as unknown as ExecutionIntent);
        return { ...o, tx: encoded, execution_intent: undefined };
      } catch (e) {
        return { ...o, error: (e as Error).message };
      }
    }

    if (o.contractType && o.contractAddress && o.functionName) {
      try {
        const intent: ExecutionIntent = {
          contractType: o.contractType as string,
          contractAddress: o.contractAddress as `0x${string}`,
          functionName: o.functionName as string,
          args: (o.args as Record<string, unknown>) ?? {},
        };
        const encoded = await tryEncode(intent);
        return { ...o, tx: encoded };
      } catch (e) {
        return { ...o, error: (e as Error).message };
      }
    }

    const encoded: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      encoded[k] = await encodeSteps(v, defiborrowClient, userAddress);
    }
    return encoded;
  }
  return obj;
}

app.post("/v1/begin", async (req: Request, res: Response) => {
  const { userPrompt, userWallet } = req.body;
  console.log("userPrompt:", userPrompt, "userWallet:", userWallet);
  try {
    let result = await mcpClient.chatMessage(userPrompt);

    let responseData: unknown = result;

    if (typeof result === "string") {
      const trimmed = result.trim();
      // strip JS-style comments before parsing
      const clean = trimmed.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      const jsonStr = clean.startsWith("```")
        ? clean.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")
        : clean;
      try {
        let parsed = JSON.parse(jsonStr);
        if (userWallet) {
          parsed = replaceUserAddress(parsed, userWallet);
        }
        const defiborrowClient = mcpClient.getServer("defiborrow");
        responseData = await encodeSteps(parsed, defiborrowClient, userWallet);
      } catch {
        // not JSON, use raw string
      }
    }

    console.log("response:", responseData);
    res.json({ message: responseData });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error(e);
    res.status(500).json({
      message:
        errMsg ||
        "An error occurred while processing your request... please try again later.",
    });
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message:
      "Oops! You've reached an unknown endpoint. The Uniclaw API is currently only listening at POST /v1/begin.",
    status: 404,
  });
});

start();
