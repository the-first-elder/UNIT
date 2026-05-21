import type { Tool } from "@modelcontextprotocol/sdk/types.js";

interface Pool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  stablecoin: boolean;
  pool: string;
  ilRisk?: string;
  exposure?: string;
  outlier?: boolean;
  apyPct1D?: number;
  apyPct7D?: number;
  apyPct30D?: number;
  sigma?: number;
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

function riskScore(pool: Pool): { score: number; label: string } {
  let s = 0;
  if ((pool.tvlUsd || 0) < 100_000) s += 3;
  else if ((pool.tvlUsd || 0) < 1_000_000) s += 2;
  else if ((pool.tvlUsd || 0) < 10_000_000) s += 1;
  if (pool.ilRisk === "yes") s += 2;
  if (pool.exposure === "multi") s += 1;
  if (pool.stablecoin) s -= 1;
  if (pool.sigma && pool.sigma > 0.5) s += 1;
  if ((pool.apy || 0) > 100) s += 2;
  else if ((pool.apy || 0) > 50) s += 1;
  const label = s <= 1 ? "safe" : s <= 3 ? "moderate" : s <= 5 ? "risky" : "dangerous";
  return { score: s, label };
}

export const PHILIDOR_TOOLS: Tool[] = [
  {
    name: "search_vaults",
    description:
      "Search for yield vaults by asset and chain. Returns risk scores, APY, TVL, and protocol details. Risk levels: safe, moderate, risky, dangerous.",
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
            "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
        },
      },
      required: ["asset", "chain"],
    },
  },
  {
    name: "get_vault_risk_breakdown",
    description:
      "Get detailed risk breakdown for a specific vault/protocol. Returns TVL analysis, APY stability, impermanent loss risk, and overall risk score.",
    inputSchema: {
      type: "object",
      properties: {
        vault: {
          type: "string",
          description:
            "Vault name or identifier (e.g. aave-v3, morpho, yearn)",
        },
        chain: {
          type: "string",
          description: "Blockchain name",
        },
        asset: {
          type: "string",
          description: "Token symbol",
        },
      },
      required: ["vault", "chain", "asset"],
    },
  },
  {
    name: "compare_vaults",
    description:
      "Compare risk metrics between multiple vaults for the same asset on a chain.",
    inputSchema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          description: "Blockchain name",
        },
        asset: {
          type: "string",
          description: "Token symbol",
        },
      },
      required: ["chain", "asset"],
    },
  },
  {
    name: "find_safest_vaults",
    description:
      "Find the safest vaults for a given asset and chain. Prioritizes high TVL, audited protocols, and stable APY.",
    inputSchema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          description:
            "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
        },
        asset: {
          type: "string",
          description: "Token symbol",
        },
        topN: {
          type: "number",
          description: "Number of results (default 5)",
        },
      },
      required: ["chain"],
    },
  },
];

async function searchPools(asset: string, chain: string) {
  const pools = await fetchPools();
  const assetUpper = asset.toUpperCase();
  const chainLower = chain.toLowerCase();
  return pools.filter((p) => {
    if (chainLower && p.chain?.toLowerCase() !== chainLower) return false;
    if (assetUpper) {
      if (
        !p.symbol.toUpperCase().includes(assetUpper) &&
        !assetUpper.includes(p.symbol.toUpperCase())
      )
        return false;
    }
    if (p.outlier) return false;
    return true;
  });
}

async function handleSearchVaults(args: Record<string, unknown>) {
  const asset = String(args.asset ?? "");
  const chain = String(args.chain ?? "");
  const pools = await searchPools(asset, chain);
  pools.sort((a, b) => (b.tvlUsd || 0) - (a.tvlUsd || 0));

  const vaults = pools.slice(0, 20).map((p) => ({
    name: `${p.project}/${p.symbol}`,
    protocol: p.project,
    asset: p.symbol,
    chain: p.chain,
    risk: riskScore(p),
    apy: p.apy?.toFixed(2),
    tvlUsd: p.tvlUsd,
    stablecoin: p.stablecoin,
    url: poolUrl(p),
  }));

  return { content: [{ type: "text", text: JSON.stringify({ vaults, count: vaults.length }, null, 2) }] };
}

async function handleGetVaultRiskBreakdown(args: Record<string, unknown>) {
  const vault = String(args.vault ?? "").toLowerCase();
  const chain = String(args.chain ?? "").toLowerCase();
  const asset = String(args.asset ?? "").toUpperCase();

  const pools = await searchPools(asset, chain);
  const match = pools.find((p) => {
    const name = `${p.project}/${p.symbol}`.toLowerCase();
    return name.includes(vault) || vault.includes(name);
  });
  if (!match) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Vault ${vault} not found on ${chain}/${asset}` }) }],
      isError: true,
    };
  }

  const risk = riskScore(match);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            vault: `${match.project}/${match.symbol}`,
            chain: match.chain,
            riskScore: risk.score,
            riskLabel: risk.label,
            tvlUsd: match.tvlUsd,
            tvlRisk: match.tvlUsd > 10_000_000 ? "low" : match.tvlUsd > 1_000_000 ? "medium" : "high",
            apyStability: match.sigma
              ? match.sigma < 0.2 ? "stable" : match.sigma < 0.5 ? "moderate" : "volatile"
              : "unknown",
            impermanentLoss: match.ilRisk === "yes" ? "present" : "none",
            exposure: match.exposure || "single",
            concentrationRisk: (match.tvlUsd || 0) < 1_000_000 ? "high" : (match.tvlUsd || 0) < 10_000_000 ? "medium" : "low",
            apyTrend: {
              "1d": match.apyPct1D,
              "7d": match.apyPct7D,
              "30d": match.apyPct30D,
            },
            url: poolUrl(match),
          },
          null,
          2,
        ),
      },
    ],
  };
}

async function handleCompareVaults(args: Record<string, unknown>) {
  const chain = String(args.chain ?? "");
  const asset = String(args.asset ?? "").toUpperCase();
  const pools = await searchPools(asset, chain);
  pools.sort((a, b) => (b.tvlUsd || 0) - (a.tvlUsd || 0));

  const vaults = pools.slice(0, 10).map((p) => ({
    name: `${p.project}/${p.symbol}`,
    risk: riskScore(p),
    apy: p.apy?.toFixed(2) + "%",
    tvlUsd: p.tvlUsd,
    stablecoin: p.stablecoin,
  }));

  return { content: [{ type: "text", text: JSON.stringify({ vaults, count: vaults.length }, null, 2) }] };
}

async function handleFindSafestVaults(args: Record<string, unknown>) {
  const chain = String(args.chain ?? "").toLowerCase();
  const asset = String(args.asset ?? "").toUpperCase();
  const topN = (args.topN as number) || 5;

  const pools = await searchPools(asset, chain);
  const withRisk = pools.map((p) => ({ pool: p, risk: riskScore(p) }));
  const safe = withRisk
    .filter((r) => r.risk.label !== "dangerous" && r.risk.label !== "risky")
    .sort((a, b) => a.risk.score - b.risk.score || (b.pool.tvlUsd || 0) - (a.pool.tvlUsd || 0))
    .slice(0, topN);

  const vaults = safe.map((r) => ({
    name: `${r.pool.project}/${r.pool.symbol}`,
    risk: r.risk,
    apy: r.pool.apy?.toFixed(2) + "%",
    tvlUsd: r.pool.tvlUsd,
    stablecoin: r.pool.stablecoin,
    url: poolUrl(r.pool),
  }));

  return { content: [{ type: "text", text: JSON.stringify({ vaults, count: vaults.length }, null, 2) }] };
}

export async function callPhilidorTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "search_vaults":
      return handleSearchVaults(args);
    case "get_vault_risk_breakdown":
      return handleGetVaultRiskBreakdown(args);
    case "compare_vaults":
      return handleCompareVaults(args);
    case "find_safest_vaults":
      return handleFindSafestVaults(args);
    default:
      return {
        content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
        isError: true,
      };
  }
}
