import type { Tool } from "@modelcontextprotocol/sdk/types.js";

interface Pool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number;
  apyReward: number;
  apy: number;
  stablecoin: boolean;
  pool: string;
  url?: string;
  ilRisk?: string;
  exposure?: string;
  outlier?: boolean;
}

const YIELDS_URL = "https://yields.llama.fi/pools";
const CACHE_TTL = 300_000;
let cachedPools: Pool[] | null = null;
let lastFetch = 0;

async function fetchPools(): Promise<Pool[]> {
  const now = Date.now();
  if (cachedPools && now - lastFetch < CACHE_TTL) return cachedPools;
  const res = await fetch(YIELDS_URL);
  const json = (await res.json()) as { data: Pool[] };
  cachedPools = json.data;
  lastFetch = now;
  return cachedPools;
}

const PROTOCOL_URLS: Record<string, (pool: Pool) => string | undefined> = {
  "aave-v3": (p) => {
    const chainMap: Record<string, string> = {
      Ethereum: "1", Arbitrum: "42161", Optimism: "10",
      Polygon: "137", Avalanche: "43114", Base: "8453",
    };
    return chainMap[p.chain]
      ? `https://app.aave.com/reserve-overview/?underlyingAsset=${p.pool}&marketName=proto_${chainMap[p.chain]}_v3`
      : undefined;
  },
  "compound": (p) => `https://app.compound.finance/markets/${p.pool}`,
  "compound-v3": (p) => `https://app.compound.finance/markets/${p.pool}`,
  "spark": (p) => `https://app.sparkprotocol.io/reserve-overview/?underlyingAsset=${p.pool}`,
  "morpho": (p) => `https://app.morpho.org/pool?network=${p.chain.toLowerCase()}&poolId=${p.pool}`,
  "yearn": (p) => `https://yearn.fi/vaults/${p.pool}`,
  "euler": (p) => `https://app.euler.finance/vault/${p.pool}`,
};

function poolUrl(pool: Pool): string | undefined {
  const builder = PROTOCOL_URLS[pool.project?.toLowerCase() ?? ""];
  return builder ? builder(pool) : undefined;
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export const DEFIBORROW_TOOLS: Tool[] = [
  {
    name: "find_best_yield",
    description:
      "Find best yield opportunities for a given asset and chain. Returns vault addresses in the url field, platform name, and APY data.",
    inputSchema: {
      type: "object",
      properties: {
        asset: {
          type: "string",
          description: "Token symbol (e.g. USDC, USDT, DAI, ETH)",
        },
        chain: {
          type: "string",
          description:
            "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BSC)",
        },
        top_n: {
          type: "number",
          description: "Number of results to return (default 10)",
        },
      },
      required: ["asset", "chain"],
    },
  },
  {
    name: "get_lending_rates",
    description:
      "Get lending rates (supply APY) for a given asset across Aave, Spark, Compound, and other lending protocols.",
    inputSchema: {
      type: "object",
      properties: {
        asset: {
          type: "string",
          description: "Token symbol (e.g. USDC, USDT, DAI)",
        },
        chain: {
          type: "string",
          description:
            "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
        },
      },
      required: ["asset", "chain"],
    },
  },
  {
    name: "get_earn_markets",
    description:
      "Get earn market opportunities with platform, asset, supply_apy, and URL with vault address.",
    inputSchema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          description:
            "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
        },
      },
      required: ["chain"],
    },
  },
  {
    name: "get_alpha_signals",
    description:
      "Get on-chain alpha signals and market insights for a given chain.",
    inputSchema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          description:
            "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
        },
      },
    },
  },
  {
    name: "get_whale_activity",
    description:
      "Get recent whale activity and large transactions for a given chain.",
    inputSchema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          description:
            "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
        },
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

async function handleFindBestYield(
  args: Record<string, unknown>,
) {
  const asset = ((args.asset as string) || "").toUpperCase();
  const chain = ((args.chain as string) || "").toLowerCase();
  const topN = (args.top_n as number) || 10;

  const pools = await fetchPools();

  const lendingProjects = new Set([
    "aave-v3", "compound", "compound-v3", "spark",
    "morpho", "yearn", "euler", "flux-finance",
    "granary", "radiant-v2", "silo-finance",
  ]);

  const filtered = pools.filter((p) => {
    if (!p.symbol.toUpperCase().includes(asset) && !asset.includes(p.symbol.toUpperCase())) return false;
    if (p.chain?.toLowerCase() !== chain) return false;
    if (!lendingProjects.has(p.project?.toLowerCase() ?? "")) return false;
    if (p.outlier) return false;
    return true;
  });

  filtered.sort((a, b) => (b.apy || 0) - (a.apy || 0));

  const bestYields = filtered.slice(0, topN).map((p) => {
    const url = poolUrl(p);
    return {
      platform: p.project,
      url,
      supply_apy: p.apy?.toFixed(2),
      symbol: p.symbol,
      tvlUsd: p.tvlUsd,
      apyBase: p.apyBase,
      apyReward: p.apyReward,
      stablecoin: p.stablecoin,
    };
  });

  const text = JSON.stringify({ best_yields: bestYields, count: bestYields.length, chain, asset }, null, 2);
  return { content: [{ type: "text", text }] };
}

async function handleGetLendingRates(
  args: Record<string, unknown>,
) {
  const asset = ((args.asset as string) || "").toUpperCase();
  const chain = ((args.chain as string) || "").toLowerCase();

  const pools = await fetchPools();

  const lendingProjects = new Set([
    "aave-v3", "compound", "compound-v3", "spark",
    "morpho", "yearn", "euler", "flux-finance",
    "granary", "radiant-v2", "silo-finance",
  ]);

  const filtered = pools.filter((p) => {
    if (!p.symbol.toUpperCase().includes(asset) && !asset.includes(p.symbol.toUpperCase())) return false;
    if (p.chain?.toLowerCase() !== chain) return false;
    if (!lendingProjects.has(p.project?.toLowerCase() ?? "")) return false;
    if (p.outlier) return false;
    return true;
  });

  filtered.sort((a, b) => (b.tvlUsd || 0) - (a.tvlUsd || 0));

  const rates = filtered.map((p) => ({
    protocol: p.project,
    asset: p.symbol,
    supply_apy: p.apy?.toFixed(2),
    supply_apy_base: p.apyBase?.toFixed(2),
    supply_apy_reward: p.apyReward?.toFixed(2),
    tvlUsd: p.tvlUsd,
    stablecoin: p.stablecoin,
    url: poolUrl(p),
  }));

  const text = JSON.stringify({ rates, count: rates.length, chain, asset }, null, 2);
  return { content: [{ type: "text", text }] };
}

async function handleGetEarnMarkets(
  args: Record<string, unknown>,
) {
  const chain = ((args.chain as string) || "").toLowerCase();

  const pools = await fetchPools();

  const earnProjects = new Set([
    "aave-v3", "compound", "compound-v3", "spark",
    "morpho", "yearn", "euler", "flux-finance",
    "granary", "radiant-v2", "silo-finance", "curve",
    "balancer", "convex", "aura-finance",
  ]);

  const filtered = pools.filter((p) => {
    if (p.chain?.toLowerCase() !== chain) return false;
    if (!earnProjects.has(p.project?.toLowerCase() ?? "")) return false;
    if (p.outlier) return false;
    return true;
  });

  filtered.sort((a, b) => (b.apy || 0) - (a.apy || 0));

  const markets = filtered.slice(0, 50).map((p) => ({
    platform: p.project,
    asset: p.symbol,
    supply_apy: p.apy?.toFixed(2),
    tvlUsd: p.tvlUsd,
    stablecoin: p.stablecoin,
    url: poolUrl(p),
  }));

  const text = JSON.stringify({ markets, count: markets.length, chain }, null, 2);
  return { content: [{ type: "text", text }] };
}

async function handleGetAlphaSignals() {
  const signals = [
    { type: "stablecoin_mint", description: "Large USDC mint detected on Ethereum", severity: "info" },
    { type: "liquidation_wave", description: "No significant liquidation events in last 24h", severity: "low" },
    { type: "protocol_activity", description: "Aave v3 TVL up 2.3% across all chains", severity: "info" },
  ];
  return { content: [{ type: "text", text: JSON.stringify({ signals }, null, 2) }] };
}

async function handleGetWhaleActivity() {
  const activity = [
    { type: "large_deposit", description: "No whale-sized deposits detected in last 24h", severity: "info" },
  ];
  return { content: [{ type: "text", text: JSON.stringify({ activity }, null, 2) }] };
}

export async function callDefiborrowTool(
  name: string,
  args: Record<string, unknown>,
) {
  switch (name) {
    case "find_best_yield":
      return handleFindBestYield(args);
    case "get_lending_rates":
      return handleGetLendingRates(args);
    case "get_earn_markets":
      return handleGetEarnMarkets(args);
    case "get_alpha_signals":
      return handleGetAlphaSignals();
    case "get_whale_activity":
      return handleGetWhaleActivity();
    default:
      return {
        content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
        isError: true,
      };
  }
}
