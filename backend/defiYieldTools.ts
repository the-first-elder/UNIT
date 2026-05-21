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
  ilRisk?: "yes" | "no";
  exposure?: "single" | "multi";
  outlier?: boolean;
  predictions?: {
    predictedClass?: string;
    binnedConfidence?: number;
  } | null;
  apyPct1D?: number;
  apyPct7D?: number;
  apyPct30D?: number;
  apyMean30d?: number;
  volumeUsd1d?: number;
  volumeUsd7d?: number;
  sigma?: number;
  count?: number;
}

interface ProtocolInfo {
  name?: string;
  url?: string;
  description?: string;
  category?: string;
  audits?: number;
  audit_links?: string[];
  twitter?: string;
  chains?: string[];
}

const YIELDS_URL = "https://yields.llama.fi/pools";
const PROTOCOLS_URL = "https://api.llama.fi/protocols";
const CACHE_TTL = 300_000;
const PROTOCOL_CACHE_TTL = 3_600_000;

let cachedPools: Pool[] | null = null;
let lastFetch = 0;
let cachedProtocols: Map<string, ProtocolInfo> | null = null;
let lastProtocolFetch = 0;

async function fetchPools(): Promise<Pool[]> {
  const now = Date.now();
  if (cachedPools && now - lastFetch < CACHE_TTL) return cachedPools;
  const res = await fetch(YIELDS_URL);
  const json = (await res.json()) as { data: Pool[] };
  cachedPools = json.data;
  lastFetch = now;
  return cachedPools;
}

async function fetchProtocols(): Promise<Map<string, ProtocolInfo>> {
  const now = Date.now();
  if (cachedProtocols && now - lastProtocolFetch < PROTOCOL_CACHE_TTL) return cachedProtocols;
  const res = await fetch(PROTOCOLS_URL);
  const data = (await res.json()) as Record<string, unknown>[];
  const map = new Map<string, ProtocolInfo>();
  for (const p of data) {
    const name = (p.name as string)?.toLowerCase();
    if (name) {
      map.set(name, {
        name: p.name as string,
        url: p.url as string,
        description: p.description as string,
        category: p.category as string,
        audits: p.audits as number,
        audit_links: p.audit_links as string[],
        twitter: p.twitter as string,
        chains: p.chains as string[],
      });
    }
  }
  cachedProtocols = map;
  lastProtocolFetch = now;
  return cachedProtocols;
}

function riskTier(pool: Pool): string {
  const tvl = pool.tvlUsd || 0;
  const apy = pool.apy || 0;
  const il = pool.ilRisk || "no";
  const stablecoin = pool.stablecoin || false;
  const exposure = pool.exposure || "single";
  const pred = pool.predictions;
  const predClass = pred?.predictedClass || "";
  const apyReward = pool.apyReward || 0;

  if (apy > 1000) return "EXTREME";

  let score = 0;
  if (tvl < 100_000) score += 3;
  else if (tvl < 1_000_000) score += 2;
  else if (tvl < 10_000_000) score += 1;

  if (il === "yes") score += 2;
  if (exposure === "multi") score += 1;
  if (stablecoin) score -= 1;
  if (predClass.includes("Down")) score += 1;
  if (apy > 100) score += 2;
  else if (apy > 50) score += 1;

  if (score <= 1) return "LOW";
  if (score <= 3) return "MEDIUM";
  if (score <= 5) return "HIGH";
  return "EXTREME";
}

function formatPool(p: Pool, rank: number = 0): string {
  const tvl = p.tvlUsd || 0;
  const apy = p.apy || 0;
  const apyBase = p.apyBase || 0;
  const apyReward = p.apyReward || 0;
  const il = p.ilRisk || "no";
  const risk = riskTier(p);
  const stable = p.stablecoin ? "stablecoin" : "";
  const pred = p.predictions;
  const trend = pred?.predictedClass ?? "?";
  const d7 = p.apyPct7D;
  const d7Str = d7 != null ? `${d7 >= 0 ? "+" : ""}${d7.toFixed(1)}%` : "?";

  const prefix = rank ? `${rank}. ` : "- ";
  return (
    `${prefix}**${p.project || "?"}/${p.symbol || "?"}** on ${p.chain || "?"} ` +
    `[${risk}]\n` +
    `  APY: ${apy.toFixed(2)}% (base: ${apyBase.toFixed(2)}% + reward: ${apyReward.toFixed(2)}%) | ` +
    `7d trend: ${d7Str} | Outlook: ${trend}\n` +
    `  TVL: $${tvl.toLocaleString("en-US")} | IL risk: ${il} | ${stable}`
  );
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export const DEFI_YIELD_TOOLS: Tool[] = [
  {
    name: "get_top_yields",
    description:
      "Find the best yield opportunities across DeFi protocols. " +
      "Returns pools sorted by APY, filtered by chain, TVL, risk level, and stablecoin status.",
    inputSchema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          description:
            'Filter by chain (e.g. "Ethereum", "Polygon", "Arbitrum"). Empty = all chains.',
        },
        min_tvl: {
          type: "number",
          description: "Minimum TVL in USD (default $1M). Higher = safer.",
        },
        stablecoins_only: {
          type: "boolean",
          description: "Only show stablecoin pools (lower risk).",
        },
        max_risk: {
          type: "string",
          description:
            'Maximum risk tier: "LOW", "MEDIUM", "HIGH", or "EXTREME".',
          enum: ["LOW", "MEDIUM", "HIGH", "EXTREME"],
        },
        limit: {
          type: "number",
          description: "Number of results (default 15).",
        },
      },
      required: [],
    },
  },
  {
    name: "get_pool_risk",
    description:
      "Deep risk analysis for a specific DeFi pool. " +
      "Looks up by pool UUID, or by project name + symbol. " +
      "Returns: TVL history trend, IL risk, audit status, APY stability, and overall risk classification.",
    inputSchema: {
      type: "object",
      properties: {
        pool_id: {
          type: "string",
          description:
            "DefiLlama pool UUID (e.g. 747c1d2a-c668-4682-b9f9-296708a3dd90).",
        },
        project: {
          type: "string",
          description:
            'Project name to search (e.g. "aave-v3"). Used if pool_id not provided.',
        },
        symbol: {
          type: "string",
          description:
            'Token symbol to search (e.g. "USDC"). Used with project.',
        },
      },
    },
  },
  {
    name: "compare_yields",
    description:
      "Compare yield opportunities for a specific deposit amount. " +
      "Shows projected earnings across top pools for a given investment amount. " +
      "Focuses on safe pools by default (stablecoins, high TVL).",
    inputSchema: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "Amount in USD to deposit (default $1000).",
        },
        chains: {
          type: "string",
          description:
            'Comma-separated chains to compare (e.g. "Ethereum,Polygon,Arbitrum"). Empty = all.',
        },
        stablecoins_only: {
          type: "boolean",
          description:
            "Only compare stablecoin pools (default True for safety).",
        },
        min_tvl: {
          type: "number",
          description: "Minimum TVL filter (default $10M).",
        },
      },
      required: [],
    },
  },
  {
    name: "get_chains",
    description:
      "List all available chains with pool counts and top yields.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

async function handleGetTopYields(
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: string; text?: string }>; isError?: boolean }> {
  const chain = (args.chain as string) || "";
  const minTvl = (args.min_tvl as number) ?? 1_000_000;
  const stablecoinsOnly = args.stablecoins_only === true;
  const maxRisk = (args.max_risk as string) || "HIGH";
  const limit = (args.limit as number) || 15;

  const pools = await fetchPools();
  const riskOrder: Record<string, number> = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
    EXTREME: 3,
  };
  const maxRiskVal = riskOrder[maxRisk.toUpperCase()] ?? 2;

  const filtered = pools.filter((p) => {
    const tvl = p.tvlUsd || 0;
    const apy = p.apy || 0;
    if (tvl < minTvl || apy <= 0) return false;
    if (chain && (p.chain || "").toLowerCase() !== chain.toLowerCase())
      return false;
    if (stablecoinsOnly && !p.stablecoin) return false;
    if (p.outlier) return false;
    const risk = riskTier(p);
    if ((riskOrder[risk] ?? 9) > maxRiskVal) return false;
    return true;
  });

  filtered.sort((a, b) => (b.apy || 0) - (a.apy || 0));
  const top = filtered.slice(0, limit);

  const chainLabel = chain || "All Chains";
  const lines: string[] = [
    `# Top DeFi Yields — ${chainLabel}`,
    `Filters: TVL ≥ $${minTvl.toLocaleString("en-US")} | Risk ≤ ${maxRisk} | ${
      stablecoinsOnly ? "Stablecoins only" : "All assets"
    }`,
    `Pools scanned: ${pools.length.toLocaleString("en-US")} | Matching: ${filtered.length}`,
    "",
  ];

  for (let i = 0; i < top.length; i++) {
    lines.push(formatPool(top[i], i + 1));
  }

  if (!top.length) {
    lines.push(
      "No pools match your criteria. Try lowering min_tvl or increasing max_risk.",
    );
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

async function handleGetPoolRisk(
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: string; text?: string }>; isError?: boolean }> {
  const poolId = args.pool_id as string;
  const project = (args.project as string) || "";
  const symbol = (args.symbol as string) || "";

  const [pools, protocols] = await Promise.all([
    fetchPools(),
    fetchProtocols(),
  ]);

  let pool: Pool | undefined;
  if (poolId) {
    pool = pools.find((p) => p.pool === poolId);
  } else if (project) {
    const matches = pools.filter(
      (p) =>
        project.toLowerCase().includes((p.project || "").toLowerCase()) ||
        (p.project || "").toLowerCase().includes(project.toLowerCase()),
    );
    const symbolFiltered = symbol
      ? matches.filter(
          (p) =>
            (p.symbol || "").toUpperCase().includes(symbol.toUpperCase()) ||
            symbol.toUpperCase().includes((p.symbol || "").toUpperCase()),
        )
      : matches;
    if (symbolFiltered.length) {
      symbolFiltered.sort(
        (a, b) => (b.tvlUsd || 0) - (a.tvlUsd || 0),
      );
      pool = symbolFiltered[0];
    } else if (matches.length) {
      matches.sort((a, b) => (b.tvlUsd || 0) - (a.tvlUsd || 0));
      pool = matches[0];
    }
  }

  if (!pool) {
    return {
      content: [
        {
          type: "text",
          text: "Pool not found. Try get_top_yields() to browse available pools.",
        },
      ],
      isError: true,
    };
  }

  const projName = (pool.project || "").toLowerCase();
  const proto = protocols.get(projName);
  const audits = proto?.audits ?? 0;
  const auditStatus = { 0: "No audits", 1: "Partially audited", 2: "Fully audited" }[
    audits as 0 | 1 | 2
  ] ?? "Unknown";
  const auditLinks = proto?.audit_links || [];

  const tvl = pool.tvlUsd || 0;
  const apy = pool.apy || 0;
  const apyBase = pool.apyBase || 0;
  const apyReward = pool.apyReward || 0;
  const il = pool.ilRisk || "no";
  const risk = riskTier(pool);
  const pred = pool.predictions;
  const trend = pred?.predictedClass ?? "?";
  const confidence = pred?.binnedConfidence ?? 0;
  const d1 = pool.apyPct1D;
  const d7 = pool.apyPct7D;
  const d30 = pool.apyPct30D;
  const mean30 = pool.apyMean30d;
  const vol1d = pool.volumeUsd1d;
  const vol7d = pool.volumeUsd7d;
  const sigma = pool.sigma;

  const lines: string[] = [
    `# Risk Analysis — ${pool.project || "?"}/${pool.symbol || "?"} on ${pool.chain || "?"}`,
    `Pool ID: \`${pool.pool || "?"}\``,
    "",
    `## Risk Classification: **${risk}**`,
    "",
    "## Yield Metrics",
    `- Current APY: **${apy.toFixed(2)}%** (base: ${apyBase.toFixed(2)}% + reward: ${apyReward.toFixed(2)}%)`,
    d1 != null
      ? `- 1-day change: ${d1 >= 0 ? "+" : ""}${d1.toFixed(2)}%`
      : "- 1-day change: N/A",
    d7 != null
      ? `- 7-day change: ${d7 >= 0 ? "+" : ""}${d7.toFixed(2)}%`
      : "- 7-day change: N/A",
    d30 != null
      ? `- 30-day change: ${d30 >= 0 ? "+" : ""}${d30.toFixed(2)}%`
      : "- 30-day change: N/A",
    mean30 != null
      ? `- 30-day mean APY: ${mean30.toFixed(2)}%`
      : "- 30-day mean: N/A",
    sigma != null ? `- Volatility (sigma): ${sigma.toFixed(4)}` : "- Volatility: N/A",
    `- APY prediction: **${trend}** (confidence: ${confidence}/3)`,
    "",
    "## Safety Metrics",
    `- TVL: **$${tvl.toLocaleString("en-US")}**`,
    `- Impermanent loss risk: **${il}**`,
    `- Exposure: ${pool.exposure || "?"}`,
    `- Stablecoin: ${pool.stablecoin ? "Yes" : "No"}`,
    `- Outlier APY: ${pool.outlier ? "Yes — CAUTION" : "No"}`,
    "",
    "## Protocol Security",
    `- Audit status: **${auditStatus}**`,
  ];

  if (auditLinks.length) {
    lines.push(`- Audit links: ${auditLinks.slice(0, 3).join(", ")}`);
  }
  if (proto?.url) {
    lines.push(`- Protocol URL: ${proto.url}`);
  }
  if (proto?.category) {
    lines.push(`- Category: ${proto.category}`);
  }

  if (vol1d != null || vol7d != null) {
    lines.push("");
    lines.push("## Volume");
    if (vol1d != null) {
      lines.push(`- 24h volume: $${vol1d.toLocaleString("en-US")}`);
    }
    if (vol7d != null) {
      lines.push(`- 7d volume: $${vol7d.toLocaleString("en-US")}`);
    }
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

async function handleCompareYields(
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: string; text?: string }>; isError?: boolean }> {
  const amount = (args.amount as number) ?? 1000;
  const chains = (args.chains as string) || "";
  const stablecoinsOnly = args.stablecoins_only !== false;
  const minTvl = (args.min_tvl as number) ?? 10_000_000;

  const pools = await fetchPools();
  const chainList = chains
    ? chains.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean)
    : [];

  const filtered = pools.filter((p) => {
    const tvl = p.tvlUsd || 0;
    const apy = p.apy || 0;
    if (tvl < minTvl || apy <= 0 || p.outlier) return false;
    if (chainList.length && !chainList.includes((p.chain || "").toLowerCase()))
      return false;
    if (stablecoinsOnly && !p.stablecoin) return false;
    const risk = riskTier(p);
    if (risk === "EXTREME") return false;
    return true;
  });

  filtered.sort((a, b) => (b.apy || 0) - (a.apy || 0));

  const chainLabel = chains || "All Chains";
  const lines: string[] = [
    `# Yield Comparison — $${amount.toLocaleString("en-US")} Deposit`,
    `Chains: ${chainLabel} | ${stablecoinsOnly ? "Stablecoins only" : "All assets"} | TVL ≥ $${minTvl.toLocaleString("en-US")}`,
    "",
    `${"#".padStart(3)} ${"Protocol/Pool".padEnd(35)} ${"Chain".padEnd(12)} ${"APY".padStart(8)} ${"Risk".padEnd(8)} ${"Daily".padStart(10)} ${"Monthly".padStart(10)} ${"Yearly".padStart(12)}`,
    "-".repeat(105),
  ];

  for (let i = 0; i < Math.min(filtered.length, 20); i++) {
    const p = filtered[i];
    const apyVal = p.apy || 0;
    const daily = (amount * apyVal) / 100 / 365;
    const monthly = daily * 30;
    const yearly = (amount * apyVal) / 100;
    const risk = riskTier(p);
    const name = `${p.project || "?"}/${p.symbol || "?"}`.substring(0, 35);

    lines.push(
      `${(i + 1).toString().padStart(3)} ${name.padEnd(35)} ${(p.chain || "?").padEnd(12)} ${apyVal.toFixed(2).padStart(6)}% ${risk.padEnd(8)} $${daily.toFixed(2).padStart(8)} $${monthly.toFixed(2).padStart(8)} $${yearly.toFixed(2).padStart(10)}`,
    );
  }

  if (!filtered.length) {
    lines.push("No pools match criteria.");
  }

  lines.push("");
  lines.push("*Based on current APY. Rates change constantly. Past performance ≠ future results.*");

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

async function handleGetChains(
  _args: Record<string, unknown>,
): Promise<{ content: Array<{ type: string; text?: string }>; isError?: boolean }> {
  const pools = await fetchPools();

  const chainStats = new Map<
    string,
    { count: number; totalTvl: number; maxApy: number; maxApyPool: string }
  >();

  for (const p of pools) {
    const chain = p.chain || "Unknown";
    let stats = chainStats.get(chain);
    if (!stats) {
      stats = { count: 0, totalTvl: 0, maxApy: 0, maxApyPool: "" };
      chainStats.set(chain, stats);
    }
    stats.count++;
    stats.totalTvl += p.tvlUsd || 0;
    const apy = p.apy || 0;
    if (apy > stats.maxApy && !p.outlier) {
      stats.maxApy = apy;
      stats.maxApyPool = `${p.project || "?"}/${p.symbol || "?"}`;
    }
  }

  const sorted = [...chainStats.entries()]
    .sort((a, b) => b[1].totalTvl - a[1].totalTvl)
    .slice(0, 30);

  const lines: string[] = ["# DeFi Chains by TVL", ""];
  for (const [chain, stats] of sorted) {
    lines.push(
      `- **${chain}**: ${stats.count} pools | TVL: $${stats.totalTvl.toLocaleString("en-US")} | Top yield: ${stats.maxApy.toFixed(1)}% (${stats.maxApyPool})`,
    );
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export async function callDefiYieldTool(
  name: string,
  args: Record<string, unknown>,
) {
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
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: `Unknown tool: ${name}` }),
          },
        ],
        isError: true,
      };
  }
}
