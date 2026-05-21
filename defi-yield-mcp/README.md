# DeFi Yield Aggregator MCP Server

Cross-protocol DeFi yield opportunities with risk metrics, powered by [DefiLlama](https://defillama.com). 16,000+ pools across 60+ chains.

## Install

```bash
pip install defi-yield-mcp
```

## Claude Desktop

```json
{
  "mcpServers": {
    "defi-yield": {
      "command": "python",
      "args": ["-m", "defi_yield_mcp"]
    }
  }
}
```

Then ask: *"What are the best stablecoin yields on Ethereum right now?"*

## Tools

| Tool | Description |
|------|-------------|
| `get_top_yields(chain, min_tvl, stablecoins_only, max_risk, limit)` | Find best yield opportunities with risk filtering |
| `get_pool_risk(pool_id, project, symbol)` | Deep risk analysis: IL, audit status, APY trends, predictions |
| `compare_yields(amount, chains, stablecoins_only)` | Project earnings across top pools for a deposit amount |
| `get_chains()` | List all chains with pool counts and top yields |

## Risk Tiers

Every pool is classified into a risk tier:

| Tier | Criteria |
|------|----------|
| **LOW** | High TVL, no IL, stablecoin, audited protocol |
| **MEDIUM** | Moderate TVL, some IL risk, established protocol |
| **HIGH** | Lower TVL, IL risk, high APY, less established |
| **EXTREME** | Very low TVL or APY > 1000% — likely unsustainable |

## Example

```
> get_top_yields(chain="Polygon", stablecoins_only=True, min_tvl=1000000)

# Top DeFi Yields — Polygon
Filters: TVL ≥ $1,000,000 | Risk ≤ HIGH | Stablecoins only

1. **aave-v3/USDC** on Polygon [LOW]
   APY: 4.82% (base: 3.21% + reward: 1.61%) | 7d trend: +0.3% | Outlook: Stable/Up
   TVL: $125,432,891 | IL risk: no | stablecoin
```

## Data Source

All data from [DefiLlama](https://defillama.com) (free, public, no API key). Updated every 5 minutes.

## License

MIT
