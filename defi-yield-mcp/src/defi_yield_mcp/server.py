"""DeFi Yield Aggregator MCP Server.

Wraps DefiLlama API to let AI agents query cross-protocol yield
opportunities with risk metrics (IL, TVL, audit status, APY trends).

Zero API keys required. All data from DefiLlama (free, public).
"""

from __future__ import annotations

import time
from datetime import datetime, timezone

import httpx
from mcp.server.fastmcp import FastMCP

YIELDS_URL = "https://yields.llama.fi/pools"
PROTOCOLS_URL = "https://api.llama.fi/protocols"

_cache: dict[str, tuple[float, object]] = {}
CACHE_TTL = 300  # 5 min


def _cached_get(url: str, ttl: int = CACHE_TTL) -> object:
    now = time.time()
    if url in _cache:
        t, val = _cache[url]
        if now - t < ttl:
            return val

    with httpx.Client(timeout=20) as c:
        resp = c.get(url)
        resp.raise_for_status()
        data = resp.json()

    _cache[url] = (now, data)
    return data


def _get_pools() -> list[dict]:
    data = _cached_get(YIELDS_URL)
    return data.get("data", []) if isinstance(data, dict) else data


def _get_protocols() -> dict[str, dict]:
    data = _cached_get(PROTOCOLS_URL, ttl=3600)
    return {p.get("name", "").lower(): p for p in data} if isinstance(data, list) else {}


def _risk_tier(pool: dict) -> str:
    """Classify pool risk: LOW / MEDIUM / HIGH / EXTREME."""
    tvl = pool.get("tvlUsd") or 0
    il = pool.get("ilRisk", "no")
    stablecoin = pool.get("stablecoin", False)
    exposure = pool.get("exposure", "single")
    apy = pool.get("apy") or 0
    pred = pool.get("predictions", {})
    pred_class = pred.get("predictedClass", "") if pred else ""

    if apy > 1000:
        return "EXTREME"

    score = 0
    if tvl < 100_000:
        score += 3
    elif tvl < 1_000_000:
        score += 2
    elif tvl < 10_000_000:
        score += 1

    if il == "yes":
        score += 2
    if exposure == "multi":
        score += 1
    if stablecoin:
        score -= 1
    if pred_class and "Down" in pred_class:
        score += 1
    if apy > 100:
        score += 2
    elif apy > 50:
        score += 1

    if score <= 1:
        return "LOW"
    elif score <= 3:
        return "MEDIUM"
    elif score <= 5:
        return "HIGH"
    return "EXTREME"


def _format_pool(p: dict, rank: int = 0) -> str:
    tvl = p.get("tvlUsd") or 0
    apy = p.get("apy") or 0
    apy_base = p.get("apyBase") or 0
    apy_reward = p.get("apyReward") or 0
    il = p.get("ilRisk", "no")
    risk = _risk_tier(p)
    stable = "stablecoin" if p.get("stablecoin") else ""
    pred = p.get("predictions", {})
    trend = pred.get("predictedClass", "?") if pred else "?"
    d7 = p.get("apyPct7D")
    d7_str = f"{d7:+.1f}%" if d7 is not None else "?"

    prefix = f"{rank}. " if rank else "- "
    return (
        f"{prefix}**{p.get('project','?')}/{p.get('symbol','?')}** on {p.get('chain','?')} "
        f"[{risk}]\n"
        f"  APY: {apy:.2f}% (base: {apy_base:.2f}% + reward: {apy_reward:.2f}%) | "
        f"7d trend: {d7_str} | Outlook: {trend}\n"
        f"  TVL: ${tvl:,.0f} | IL risk: {il} | {stable}"
    )


# ---------------------------------------------------------------------------
# MCP Server
# ---------------------------------------------------------------------------

mcp = FastMCP(
    name="defi-yield",
    instructions=(
        "DeFi Yield Aggregator — cross-protocol yield opportunities from DefiLlama. "
        "Covers 16,000+ pools across 60+ chains. Provides APY data, risk metrics "
        "(impermanent loss, TVL, audit status), and yield trend predictions. "
        "Use get_top_yields() to find the best opportunities, get_pool_risk() for "
        "deep risk analysis, and compare_yields() to optimize allocation."
    ),
)


@mcp.tool()
def get_top_yields(
    chain: str = "",
    min_tvl: float = 1_000_000,
    stablecoins_only: bool = False,
    max_risk: str = "HIGH",
    limit: int = 15,
) -> str:
    """Find the best yield opportunities across DeFi protocols.

    Returns pools sorted by APY, filtered by chain, TVL, risk level,
    and stablecoin status.

    Args:
        chain: Filter by chain (e.g., "Ethereum", "Polygon", "Arbitrum"). Empty = all chains.
        min_tvl: Minimum TVL in USD (default $1M). Higher = safer.
        stablecoins_only: Only show stablecoin pools (lower risk).
        max_risk: Maximum risk tier to show: "LOW", "MEDIUM", "HIGH", or "EXTREME".
        limit: Number of results (default 15).
    """
    pools = _get_pools()

    risk_order = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "EXTREME": 3}
    max_risk_val = risk_order.get(max_risk.upper(), 2)

    filtered = []
    for p in pools:
        tvl = p.get("tvlUsd") or 0
        apy = p.get("apy") or 0
        if tvl < min_tvl or apy <= 0:
            continue
        if chain and p.get("chain", "").lower() != chain.lower():
            continue
        if stablecoins_only and not p.get("stablecoin"):
            continue
        if p.get("outlier"):
            continue

        risk = _risk_tier(p)
        if risk_order.get(risk, 9) > max_risk_val:
            continue

        filtered.append(p)

    filtered.sort(key=lambda x: x.get("apy", 0), reverse=True)
    filtered = filtered[:limit]

    chain_label = chain or "All Chains"
    lines = [
        f"# Top DeFi Yields — {chain_label}",
        f"Filters: TVL ≥ ${min_tvl:,.0f} | Risk ≤ {max_risk} | "
        f"{'Stablecoins only' if stablecoins_only else 'All assets'}",
        f"Pools scanned: {len(pools):,} | Matching: {len(filtered)}",
        "",
    ]

    for i, p in enumerate(filtered, 1):
        lines.append(_format_pool(p, rank=i))

    if not filtered:
        lines.append("No pools match your criteria. Try lowering min_tvl or increasing max_risk.")

    return "\n".join(lines)


@mcp.tool()
def get_pool_risk(pool_id: str = "", project: str = "", symbol: str = "") -> str:
    """Deep risk analysis for a specific DeFi pool.

    Looks up by pool UUID, or by project name + symbol.
    Returns: TVL history trend, IL risk, audit status, APY stability,
    and overall risk classification.

    Args:
        pool_id: DefiLlama pool UUID (e.g., "747c1d2a-c668-4682-b9f9-296708a3dd90").
        project: Project name to search (e.g., "aave-v3"). Used if pool_id not provided.
        symbol: Token symbol to search (e.g., "USDC"). Used with project.
    """
    pools = _get_pools()
    protocols = _get_protocols()

    # Find the pool
    pool = None
    if pool_id:
        pool = next((p for p in pools if p.get("pool") == pool_id), None)
    elif project:
        matches = [
            p for p in pools
            if project.lower() in (p.get("project") or "").lower()
            and (not symbol or symbol.upper() in (p.get("symbol") or "").upper())
        ]
        if matches:
            matches.sort(key=lambda x: x.get("tvlUsd", 0) or 0, reverse=True)
            pool = matches[0]

    if not pool:
        return f"Pool not found. Try get_top_yields() to browse available pools."

    # Protocol audit info
    proj_name = (pool.get("project") or "").lower()
    proto = protocols.get(proj_name, {})
    audits = proto.get("audits", 0)
    audit_status = {0: "No audits", 1: "Partially audited", 2: "Fully audited"}.get(audits, "Unknown")
    audit_links = proto.get("audit_links") or []

    # Risk analysis
    tvl = pool.get("tvlUsd") or 0
    apy = pool.get("apy") or 0
    apy_base = pool.get("apyBase") or 0
    apy_reward = pool.get("apyReward") or 0
    il = pool.get("ilRisk", "no")
    risk = _risk_tier(pool)
    pred = pool.get("predictions", {})
    trend = pred.get("predictedClass", "?") if pred else "?"
    confidence = pred.get("binnedConfidence", 0) if pred else 0
    d1 = pool.get("apyPct1D")
    d7 = pool.get("apyPct7D")
    d30 = pool.get("apyPct30D")
    mean30 = pool.get("apyMean30d")
    vol_1d = pool.get("volumeUsd1d")
    vol_7d = pool.get("volumeUsd7d")
    sigma = pool.get("sigma")

    lines = [
        f"# Risk Analysis — {pool.get('project','?')}/{pool.get('symbol','?')} on {pool.get('chain','?')}",
        f"Pool ID: `{pool.get('pool','?')}`",
        "",
        f"## Risk Classification: **{risk}**",
        "",
        "## Yield Metrics",
        f"- Current APY: **{apy:.2f}%** (base: {apy_base:.2f}% + reward: {apy_reward:.2f}%)",
        f"- 1-day change: {d1:+.2f}%" if d1 is not None else "- 1-day change: N/A",
        f"- 7-day change: {d7:+.2f}%" if d7 is not None else "- 7-day change: N/A",
        f"- 30-day change: {d30:+.2f}%" if d30 is not None else "- 30-day change: N/A",
        f"- 30-day mean APY: {mean30:.2f}%" if mean30 is not None else "- 30-day mean: N/A",
        f"- Volatility (sigma): {sigma:.4f}" if sigma is not None else "- Volatility: N/A",
        f"- APY prediction: **{trend}** (confidence: {confidence}/3)",
        "",
        "## Safety Metrics",
        f"- TVL: **${tvl:,.0f}**",
        f"- Impermanent loss risk: **{il}**",
        f"- Exposure: {pool.get('exposure', '?')}",
        f"- Stablecoin: {'Yes' if pool.get('stablecoin') else 'No'}",
        f"- Outlier APY: {'Yes — CAUTION' if pool.get('outlier') else 'No'}",
        "",
        "## Protocol Security",
        f"- Audit status: **{audit_status}**",
    ]
    if audit_links:
        lines.append(f"- Audit links: {', '.join(audit_links[:3])}")
    if proto.get("url"):
        lines.append(f"- Protocol URL: {proto['url']}")
    if proto.get("category"):
        lines.append(f"- Category: {proto['category']}")

    # Volume info
    if vol_1d is not None or vol_7d is not None:
        lines.append("")
        lines.append("## Volume")
        if vol_1d is not None:
            lines.append(f"- 24h volume: ${vol_1d:,.0f}")
        if vol_7d is not None:
            lines.append(f"- 7d volume: ${vol_7d:,.0f}")

    return "\n".join(lines)


@mcp.tool()
def compare_yields(
    amount: float = 1000,
    chains: str = "",
    stablecoins_only: bool = True,
    min_tvl: float = 10_000_000,
) -> str:
    """Compare yield opportunities for a specific deposit amount.

    Shows projected earnings across top pools for a given investment
    amount. Focuses on safe pools by default (stablecoins, high TVL).

    Args:
        amount: Amount in USD to deposit (default $1000).
        chains: Comma-separated chains to compare (e.g., "Ethereum,Polygon,Arbitrum"). Empty = all.
        stablecoins_only: Only compare stablecoin pools (default True for safety).
        min_tvl: Minimum TVL filter (default $10M).
    """
    pools = _get_pools()
    chain_list = [c.strip().lower() for c in chains.split(",") if c.strip()] if chains else []

    filtered = []
    for p in pools:
        tvl = p.get("tvlUsd") or 0
        apy = p.get("apy") or 0
        if tvl < min_tvl or apy <= 0 or p.get("outlier"):
            continue
        if chain_list and p.get("chain", "").lower() not in chain_list:
            continue
        if stablecoins_only and not p.get("stablecoin"):
            continue

        risk = _risk_tier(p)
        if risk in ("EXTREME",):
            continue
        filtered.append(p)

    filtered.sort(key=lambda x: x.get("apy", 0), reverse=True)

    chain_label = chains or "All Chains"
    lines = [
        f"# Yield Comparison — ${amount:,.0f} Deposit",
        f"Chains: {chain_label} | {'Stablecoins only' if stablecoins_only else 'All assets'} | TVL ≥ ${min_tvl:,.0f}",
        "",
        f"{'#':>3} {'Protocol/Pool':<35} {'Chain':<12} {'APY':>8} {'Risk':<8} {'Daily':>10} {'Monthly':>10} {'Yearly':>12}",
        "-" * 105,
    ]

    for i, p in enumerate(filtered[:20], 1):
        apy = p.get("apy") or 0
        daily = amount * apy / 100 / 365
        monthly = daily * 30
        yearly = amount * apy / 100
        risk = _risk_tier(p)
        name = f"{p.get('project','?')}/{p.get('symbol','?')}"[:35]

        lines.append(
            f"{i:>3} {name:<35} {p.get('chain','?'):<12} {apy:>7.2f}% {risk:<8} "
            f"${daily:>8.2f} ${monthly:>8.2f} ${yearly:>10.2f}"
        )

    if not filtered:
        lines.append("No pools match criteria.")

    lines.append("")
    lines.append(f"*Based on current APY. Rates change constantly. Past performance ≠ future results.*")

    return "\n".join(lines)


@mcp.tool()
def get_chains() -> str:
    """List all available chains with pool counts and top yields."""
    pools = _get_pools()

    chain_stats: dict[str, dict] = {}
    for p in pools:
        chain = p.get("chain", "Unknown")
        if chain not in chain_stats:
            chain_stats[chain] = {"count": 0, "total_tvl": 0, "max_apy": 0, "max_apy_pool": ""}
        chain_stats[chain]["count"] += 1
        chain_stats[chain]["total_tvl"] += p.get("tvlUsd") or 0
        apy = p.get("apy") or 0
        if apy > chain_stats[chain]["max_apy"] and not p.get("outlier"):
            chain_stats[chain]["max_apy"] = apy
            chain_stats[chain]["max_apy_pool"] = f"{p.get('project','?')}/{p.get('symbol','?')}"

    sorted_chains = sorted(chain_stats.items(), key=lambda x: x[1]["total_tvl"], reverse=True)

    lines = ["# DeFi Chains by TVL", ""]
    for chain, stats in sorted_chains[:30]:
        lines.append(
            f"- **{chain}**: {stats['count']} pools | "
            f"TVL: ${stats['total_tvl']:,.0f} | "
            f"Top yield: {stats['max_apy']:.1f}% ({stats['max_apy_pool']})"
        )

    return "\n".join(lines)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="DeFi Yield Aggregator MCP Server")
    parser.add_argument("--transport", choices=["stdio", "sse", "streamable-http"], default="stdio")
    parser.add_argument("--port", type=int, default=8052)
    args = parser.parse_args()
    mcp.run(transport=args.transport, **({"port": args.port} if args.transport != "stdio" else {}))


if __name__ == "__main__":
    main()
