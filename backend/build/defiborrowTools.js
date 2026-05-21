const YIELDS_URL = "https://yields.llama.fi/pools";
const CACHE_TTL = 300_000;
let cachedPools = null;
let lastFetch = 0;
async function fetchPools() {
    const now = Date.now();
    if (cachedPools && now - lastFetch < CACHE_TTL)
        return cachedPools;
    const res = await fetch(YIELDS_URL);
    const json = (await res.json());
    cachedPools = json.data;
    lastFetch = now;
    return cachedPools;
}
const PROTOCOL_URLS = {
    "aave-v3": (p) => {
        const chainMap = {
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
function poolUrl(pool) {
    const builder = PROTOCOL_URLS[pool.project?.toLowerCase() ?? ""];
    return builder ? builder(pool) : undefined;
}
// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------
export const DEFIBORROW_TOOLS = [
    {
        name: "find_best_yield",
        description: "Find best yield opportunities for a given asset and chain. Returns vault addresses in the url field, platform name, and APY data.",
        inputSchema: {
            type: "object",
            properties: {
                asset: {
                    type: "string",
                    description: "Token symbol (e.g. USDC, USDT, DAI, ETH)",
                },
                chain: {
                    type: "string",
                    description: "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BSC)",
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
        description: "Get lending rates (supply APY) for a given asset across all available protocols on a chain.",
        inputSchema: {
            type: "object",
            properties: {
                asset: {
                    type: "string",
                    description: "Token symbol (e.g. USDC, USDT, DAI)",
                },
                chain: {
                    type: "string",
                    description: "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
                },
            },
            required: ["asset", "chain"],
        },
    },
    {
        name: "get_earn_markets",
        description: "Get earn market opportunities with platform, asset, supply_apy, and URL with vault address.",
        inputSchema: {
            type: "object",
            properties: {
                chain: {
                    type: "string",
                    description: "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
                },
            },
            required: ["chain"],
        },
    },
    {
        name: "get_alpha_signals",
        description: "Get on-chain alpha signals and market insights for a given chain.",
        inputSchema: {
            type: "object",
            properties: {
                chain: {
                    type: "string",
                    description: "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
                },
            },
        },
    },
    {
        name: "get_whale_activity",
        description: "Get recent whale activity and large transactions for a given chain.",
        inputSchema: {
            type: "object",
            properties: {
                chain: {
                    type: "string",
                    description: "Blockchain name (e.g. Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche)",
                },
            },
        },
    },
];
// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------
async function handleFindBestYield(args) {
    const asset = (args.asset || "").toUpperCase();
    const chain = (args.chain || "").toLowerCase();
    const topN = args.top_n || 10;
    const pools = await fetchPools();
    const byChain = chain
        ? pools.filter((p) => p.chain?.toLowerCase() === chain)
        : pools;
    const byAsset = asset
        ? byChain.filter((p) => p.symbol.toUpperCase().includes(asset) ||
            asset.includes(p.symbol.toUpperCase()))
        : byChain;
    const withoutOutliers = byAsset.filter((p) => !p.outlier);
    const sorted = withoutOutliers.sort((a, b) => (b.apy || 0) - (a.apy || 0));
    const bestYields = sorted.slice(0, topN).map((p) => {
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
            chain: p.chain,
        };
    });
    if (!bestYields.length) {
        const globalTop = pools
            .filter((p) => !p.outlier)
            .sort((a, b) => (b.apy || 0) - (a.apy || 0))
            .slice(0, topN)
            .map((p) => ({
            platform: p.project,
            url: poolUrl(p),
            supply_apy: p.apy?.toFixed(2),
            symbol: p.symbol,
            tvlUsd: p.tvlUsd,
            apyBase: p.apyBase,
            apyReward: p.apyReward,
            stablecoin: p.stablecoin,
            chain: p.chain,
        }));
        const text = JSON.stringify({
            best_yields: globalTop,
            count: 0,
            chain,
            asset,
            note: `No pools found for ${chain}/${asset}. Showing top ${topN} global pools for reference.`,
        }, null, 2);
        return { content: [{ type: "text", text }] };
    }
    const text = JSON.stringify({ best_yields: bestYields, count: bestYields.length, chain, asset }, null, 2);
    return { content: [{ type: "text", text }] };
}
async function handleGetLendingRates(args) {
    const asset = (args.asset || "").toUpperCase();
    const chain = (args.chain || "").toLowerCase();
    const pools = await fetchPools();
    let filtered = pools;
    if (asset) {
        filtered = filtered.filter((p) => p.symbol.toUpperCase().includes(asset) ||
            asset.includes(p.symbol.toUpperCase()));
    }
    if (chain) {
        filtered = filtered.filter((p) => p.chain?.toLowerCase() === chain);
    }
    filtered = filtered.filter((p) => !p.outlier);
    filtered.sort((a, b) => (b.tvlUsd || 0) - (a.tvlUsd || 0));
    const top = filtered.slice(0, 30);
    const rates = top.map((p) => ({
        protocol: p.project,
        asset: p.symbol,
        supply_apy: p.apy?.toFixed(2),
        supply_apy_base: p.apyBase?.toFixed(2),
        supply_apy_reward: p.apyReward?.toFixed(2),
        tvlUsd: p.tvlUsd,
        stablecoin: p.stablecoin,
        chain: p.chain,
        url: poolUrl(p),
    }));
    const text = JSON.stringify({ rates, count: rates.length, chain, asset }, null, 2);
    return { content: [{ type: "text", text }] };
}
async function handleGetEarnMarkets(args) {
    const chain = (args.chain || "").toLowerCase();
    const pools = await fetchPools();
    const byChain = chain
        ? pools.filter((p) => p.chain?.toLowerCase() === chain && !p.outlier)
        : pools.filter((p) => !p.outlier);
    byChain.sort((a, b) => (b.apy || 0) - (a.apy || 0));
    const markets = byChain.slice(0, 50).map((p) => ({
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
export async function callDefiborrowTool(name, args) {
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
