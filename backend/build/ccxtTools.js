const BINANCE_API = "https://api.binance.com/api/v3";
const COINGECKO_API = "https://api.coingecko.com/api/v3";
const CACHE_TTL = 60_000;
const cache = new Map();
function cached(key, fetcher) {
    const now = Date.now();
    const existing = cache.get(key);
    if (existing && now - existing.ts < CACHE_TTL)
        return Promise.resolve(existing.data);
    return fetcher().then((data) => {
        cache.set(key, { data, ts: now });
        return data;
    });
}
export const CCXT_TOOLS = [
    {
        name: "fetchTicker",
        description: "Fetch current ticker/price data for a cryptocurrency trading pair from a centralized exchange (CEX). Returns bid, ask, last price, 24h change, and volume.",
        inputSchema: {
            type: "object",
            properties: {
                symbol: {
                    type: "string",
                    description: "Trading pair symbol (e.g. BTC/USDT, ETH/USDT, SOL/USDT, USDC/USDT). Use forward slash format.",
                },
                exchange: {
                    type: "string",
                    description: "Exchange to fetch from (e.g. binance, coinbase). Defaults to binance.",
                },
            },
            required: ["symbol"],
        },
    },
];
async function binanceTicker(symbol) {
    const pair = symbol.replace("/", "").toUpperCase();
    const url = `${BINANCE_API}/ticker/24hr?symbol=${pair}`;
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`Binance API: ${res.status} for ${pair}`);
    const data = (await res.json());
    return {
        symbol,
        exchange: "binance",
        last: data.lastPrice,
        bid: data.bidPrice,
        ask: data.askPrice,
        high: data.highPrice,
        low: data.lowPrice,
        volume: data.volume,
        change: data.priceChange,
        changePercent: data.priceChangePercent,
    };
}
async function coinGeckoTicker(symbol) {
    const base = symbol.split("/")[0]?.toLowerCase() || symbol.toLowerCase();
    const vs = symbol.split("/")[1]?.toLowerCase() || "usd";
    const url = `${COINGECKO_API}/simple/price?ids=${base}&vs_currencies=${vs}&include_24hr_vol=true&include_24hr_change=true`;
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`CoinGecko API: ${res.status}`);
    const data = (await res.json());
    const coin = data[base];
    if (!coin)
        return null;
    return {
        symbol,
        exchange: "coingecko",
        last: String(coin[vs] ?? ""),
        changePercent: coin[`${vs}_24h_change`] != null ? String(coin[`${vs}_24h_change`]) : undefined,
        volume: coin[`${vs}_24h_vol`] != null ? String(coin[`${vs}_24h_vol`]) : undefined,
    };
}
async function handleFetchTicker(args) {
    const symbol = String(args.symbol ?? "");
    const exchange = String(args.exchange ?? "binance").toLowerCase();
    if (!symbol) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: "symbol is required (e.g. BTC/USDT)" }) }],
            isError: true,
        };
    }
    try {
        const key = `ticker:${exchange}:${symbol}`;
        let ticker = await cached(key, async () => {
            if (exchange === "binance")
                return binanceTicker(symbol);
            if (exchange === "coingecko")
                return coinGeckoTicker(symbol);
            return binanceTicker(symbol);
        });
        if (!ticker) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: `Ticker not found for ${symbol} on ${exchange}` }) }],
                isError: true,
            };
        }
        return { content: [{ type: "text", text: JSON.stringify(ticker, null, 2) }] };
    }
    catch (e) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(e) }) }], isError: true };
    }
}
export async function callCcxtTool(name, args) {
    if (name === "fetchTicker")
        return handleFetchTicker(args);
    return { content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }], isError: true };
}
