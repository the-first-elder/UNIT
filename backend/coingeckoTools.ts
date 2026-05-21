import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export const COINGECKO_TOOLS: Tool[] = [
  {
    name: "execute",
    description:
      "Execute a CoinGecko API endpoint. Use endpoint='/search/trending' for trending tokens, '/simple/price' for price lookups, '/coins/markets' for market data.",
    inputSchema: {
      type: "object",
      properties: {
        endpoint: {
          type: "string",
          description: "CoinGecko API endpoint path (e.g. /search/trending, /simple/price, /coins/markets)",
        },
        vs_currency: {
          type: "string",
          description: "Target currency for price data (default: usd)",
        },
        ids: {
          type: "string",
          description: "Coin IDs for price lookups (comma-separated)",
        },
      },
      required: ["endpoint"],
    },
  },
];

async function handleExecute(args: Record<string, unknown>) {
  const endpoint = String(args.endpoint ?? "");
  if (!endpoint) {
    return { content: [{ type: "text", text: JSON.stringify({ error: "endpoint is required" }) }], isError: true };
  }

  try {
    const params = new URLSearchParams();
    if (args.vs_currency) params.set("vs_currency", String(args.vs_currency));
    if (args.ids) params.set("ids", String(args.ids));

    const query = params.toString();
    const url = `${COINGECKO_API}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}${query ? `?${query}` : ""}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        content: [{ type: "text", text: JSON.stringify({ error: `CoinGecko API returned ${res.status}: ${body}` }) }],
        isError: true,
      };
    }

    const data = await res.json();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  } catch (e) {
    return { content: [{ type: "text", text: JSON.stringify({ error: String(e) }) }], isError: true };
  }
}

export async function callCoingeckoTool(name: string, args: Record<string, unknown>) {
  if (name === "execute") return handleExecute(args);
  return { content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }], isError: true };
}
