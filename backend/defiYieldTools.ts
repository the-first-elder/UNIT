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
}

interface ChainSummary {
  chain: string;
  poolCount: number;
  topPools: Pool[];
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

function riskTier(pool: Pool): string {
  if (pool.tvlUsd < 100_000) return "EXTREME";
  if (pool.apy > 100) return pool.tvlUsd > 1_000_000 ? "HIGH" : "EXTREME";
  if (pool.apy > 50) return pool.tvlUsd > 10_000_000 ? "HIGH" : "MEDIUM";
  if (pool.stablecoin && pool.apy > 15) return "HIGH";
  if (pool.stablecoin) return "LOW";
  return pool.tvlUsd > 100_000_000 ? "LOW" : pool.tvlUsd > 10_000_000 ? "MEDIUM" : "HIGH";
}

export const DEFI_YIELD_TOOLS: Tool[] = [
  {
    name: "get_top_yields",
    description:
      "Find best yield opportunities for a given chain and asset. Returns APY comparison data including pool details, project name, chain, and risk tier.",
    inputSchema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          description: "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
        },
        asset: {
          type: "string",
          description: "Token symbol (e.g. USDC, USDT, DAI, ETH, WBTC)",
        },
        minTvl: {
          type: "number",
          description: "Minimum TVL in USD (default: 100000)",
        },
        maxRisk: {
          type: "string",
          description: "Maximum risk tier: LOW, MEDIUM, HIGH, EXTREME (default: HIGH)",
          enum: ["LOW", "MEDIUM", "HIGH", "EXTREME"],
        },
        stablecoinOnly: {
          type: "boolean",
          description: "Only show stablecoin pools (default: true)",
        },
        topN: {
          type: "number",
          description: "Number of top pools to return (default: 10)",
        },
      },
      required: ["chain", "asset"],
    },
  },
  {
    name: "get_pool_risk",
    description:
      "Get detailed risk analysis for a specific yield pool. Returns TVL, APY breakdown, impermanent loss risk, and overall risk tier.",
    inputSchema: {
      type: "object",
      properties: {
        poolId: {
          type: "string",
          description: "Pool identifier from yields.llama.fi",
        },
      },
      required: ["poolId"],
    },
  },
  {
    name: "compare_yields",
    description:
      "Compare yields across multiple chains for a given token. Returns best APY per chain with TVL and protocol details.",
    inputSchema: {
      type: "object",
      properties: {
        asset: { type: "string", description: "Token symbol" },
        depositAmount: { type: "number", description: "Amount to deposit in USD" },
      },
      required: ["asset"],
    },
  },
  {
    name: "get_chains",
    description: "List all available chains with pool counts and top yield opportunities.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

async function handleGetTopYields(args: Record<string, unknown>) {
  const chain = (args.chain as string)?.toLowerCase() || "";
  const asset = (args.asset as string)?.toUpperCase() || "";
  const minTvl = (args.minTvl as number) || 100_000;
  const maxRisk = (args.maxRisk as string) || "HIGH";
  const stablecoinOnly = args.stablecoinOnly !== false;
  const topN = (args.topN as number) || 10;

  const pools = await fetchPools();
  const riskOrder = ["LOW", "MEDIUM", "HIGH", "EXTREME"];
  const maxRiskIndex = riskOrder.indexOf(maxRisk);

  const filtered = pools.filter((p) => {
    if (p.chain.toLowerCase() !== chain) return false;
    if (!p.symbol.toUpperCase().includes(asset) && !asset.includes(p.symbol.toUpperCase())) return false;
    if (p.tvlUsd < minTvl) return false;
    const tier = riskTier(p);
    if (riskOrder.indexOf(tier) > maxRiskIndex) return false;
    if (stablecoinOnly && !p.stablecoin) return false;
    return true;
  });

  const sorted = filtered.sort((a, b) => b.apy - a.apy).slice(0, topN);

  return {
    content: [{ type: "text", text: JSON.stringify({ pools: sorted, count: sorted.length, chain, asset }, null, 2) }],
  };
}

async function handleGetPoolRisk(args: Record<string, unknown>) {
  const poolId = args.poolId as string;
  const pools = await fetchPools();
  const pool = pools.find((p) => p.pool === poolId);

  if (!pool) {
    return { content: [{ type: "text", text: JSON.stringify({ error: `Pool ${poolId} not found` }) }], isError: true };
  }

  const analysis = {
    pool: pool.pool,
    project: pool.project,
    symbol: pool.symbol,
    chain: pool.chain,
    tvlUsd: pool.tvlUsd,
    apyBase: pool.apyBase,
    apyReward: pool.apyReward,
    apyTotal: pool.apy,
    stablecoin: pool.stablecoin,
    riskTier: riskTier(pool),
    impermanentLossRisk: pool.apyReward > pool.apyBase ? "HIGH" : "LOW",
    concentrationRisk: pool.tvlUsd < 1_000_000 ? "HIGH" : pool.tvlUsd < 10_000_000 ? "MEDIUM" : "LOW",
  };

  return { content: [{ type: "text", text: JSON.stringify(analysis, null, 2) }] };
}

async function handleCompareYields(args: Record<string, unknown>) {
  const asset = (args.asset as string)?.toUpperCase() || "";
  const pools = await fetchPools();

  const byChain = new Map<string, Pool[]>();
  for (const p of pools) {
    if (!p.symbol.toUpperCase().includes(asset) && !asset.includes(p.symbol.toUpperCase())) continue;
    if (p.tvlUsd < 100_000) continue;
    const arr = byChain.get(p.chain) || [];
    arr.push(p);
    byChain.set(p.chain, arr);
  }

  const bestPerChain: Array<{ chain: string; project: string; symbol: string; apy: number; tvlUsd: number; riskTier: string }> = [];
  for (const [chain, chainPools] of byChain) {
    const sorted = chainPools.sort((a, b) => b.apy - a.apy);
    const best = sorted[0];
    bestPerChain.push({
      chain,
      project: best.project,
      symbol: best.symbol,
      apy: best.apy,
      tvlUsd: best.tvlUsd,
      riskTier: riskTier(best),
    });
  }

  bestPerChain.sort((a, b) => b.apy - a.apy);

  return {
    content: [{ type: "text", text: JSON.stringify({ asset, bestPerChain, count: bestPerChain.length }, null, 2) }],
  };
}

async function handleGetChains(_args: Record<string, unknown>) {
  const pools = await fetchPools();

  const byChain = new Map<string, Pool[]>();
  for (const p of pools) {
    const arr = byChain.get(p.chain) || [];
    arr.push(p);
    byChain.set(p.chain, arr);
  }

  const chains: ChainSummary[] = [];
  for (const [chain, chainPools] of byChain) {
    const sorted = chainPools.sort((a, b) => b.apy - a.apy);
    chains.push({
      chain,
      poolCount: chainPools.length,
      topPools: sorted.slice(0, 5),
    });
  }

  chains.sort((a, b) => b.poolCount - a.poolCount);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            chains: chains.map((c) => ({
              chain: c.chain,
              poolCount: c.poolCount,
              topPools: c.topPools.map((p) => ({
                project: p.project,
                symbol: p.symbol,
                apy: p.apy,
                tvlUsd: p.tvlUsd,
                riskTier: riskTier(p),
              })),
            })),
            totalChains: chains.length,
          },
          null,
          2,
        ),
      },
    ],
  };
}

export async function callDefiYieldTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "get_top_yields":
      return handleGetTopYields(args);
    case "get_pool_risk":
      return handleGetPoolRisk(args);
    case "compare_yields":
      return handleCompareYields(args);
    case "get_chains":
      return handleGetChains(args);
    default:
      return { content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }], isError: true };
  }
}
