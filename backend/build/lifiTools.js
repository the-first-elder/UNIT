const LI_FI_API = "https://api.li.quest/v1";
const CACHE_TTL = 300_000;
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
export const LIFI_TOOLS = [
    {
        name: "get-token",
        description: "Get token details (address, symbol, decimals, chainId) for a given chain and token symbol. Returns the contract address needed for swap quotes.",
        inputSchema: {
            type: "object",
            properties: {
                chain: {
                    type: "string",
                    description: "Chain ID (e.g. 1 for Ethereum, 42161 for Arbitrum, 10 for Optimism, 8453 for Base, 137 for Polygon, 43114 for Avalanche, 56 for BSC)",
                },
                token: {
                    type: "string",
                    description: "Token symbol (e.g. USDC, EURC, ETH, DAI, USDT)",
                },
            },
            required: ["chain", "token"],
        },
    },
    {
        name: "get-quote",
        description: "Get a swap quote between two tokens on the same chain. Returns transaction request data including to, data, value, and approval address.",
        inputSchema: {
            type: "object",
            properties: {
                fromChain: { type: "string", description: "Source chain ID" },
                toChain: { type: "string", description: "Destination chain ID (same as fromChain for same-chain swaps)" },
                fromToken: { type: "string", description: "Source token contract address (0x...)" },
                toToken: { type: "string", description: "Destination token contract address (0x...)" },
                fromAmount: { type: "string", description: "Amount in smallest units (wei)" },
                fromAddress: { type: "string", description: "User wallet address" },
            },
            required: ["fromChain", "toChain", "fromToken", "toToken", "fromAmount", "fromAddress"],
        },
    },
    {
        name: "get-chains",
        description: "List all chains supported by LI.FI with chain ID, name, and token info.",
        inputSchema: {
            type: "object",
            properties: {},
        },
    },
];
async function handleGetToken(args) {
    const chain = String(args.chain ?? "");
    const token = String(args.token ?? "");
    if (!chain || !token) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: "chain and token are required" }) }],
            isError: true,
        };
    }
    try {
        const url = `${LI_FI_API}/token?chain=${encodeURIComponent(chain)}&token=${encodeURIComponent(token)}`;
        const data = await cached(`token:${chain}:${token}`, async () => {
            const res = await fetch(url, {
                headers: { Accept: "application/json" },
            });
            if (!res.ok) {
                throw new Error(`LI.FI token API returned ${res.status} ${res.statusText} for chain=${chain} token=${token}`);
            }
            return res.json();
        });
        const result = data.address
            ? { address: data.address, symbol: data.symbol, decimals: data.decimals, chainId: data.chainId, name: data.name, logoURI: data.logoURI }
            : { address: null, error: `Token ${token} not found on chain ${chain}` };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    catch (e) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(e) }) }], isError: true };
    }
}
async function handleGetQuote(args) {
    const fromChain = String(args.fromChain ?? "");
    const toChain = String(args.toChain ?? "");
    const fromToken = String(args.fromToken ?? "");
    const toToken = String(args.toToken ?? "");
    const fromAmount = String(args.fromAmount ?? "");
    const fromAddress = String(args.fromAddress ?? "");
    if (!fromChain || !toChain || !fromToken || !toToken || !fromAmount || !fromAddress) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: "fromChain, toChain, fromToken, toToken, fromAmount, fromAddress are required" }) }],
            isError: true,
        };
    }
    try {
        const params = new URLSearchParams({
            fromChain,
            toChain,
            fromToken,
            toToken,
            fromAmount,
            fromAddress,
            slippage: "0.03",
        });
        const url = `${LI_FI_API}/quote?${params}`;
        const data = await cached(`quote:${fromChain}:${fromToken}:${toToken}:${fromAmount}:${fromAddress}`, async () => {
            const res = await fetch(url, {
                headers: { Accept: "application/json" },
            });
            if (!res.ok) {
                const body = await res.text().catch(() => "");
                throw new Error(`LI.FI quote API returned ${res.status}: ${body}`);
            }
            return res.json();
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
    catch (e) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(e) }) }], isError: true };
    }
}
async function handleGetChains() {
    try {
        const data = await cached("chains", async () => {
            const res = await fetch(`${LI_FI_API}/chains`, {
                headers: { Accept: "application/json" },
            });
            if (!res.ok)
                throw new Error(`LI.FI chains API returned ${res.status}`);
            return res.json();
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
    catch (e) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(e) }) }], isError: true };
    }
}
export async function callLifiTool(name, args) {
    switch (name) {
        case "get-token":
            return handleGetToken(args);
        case "get-quote":
            return handleGetQuote(args);
        case "get-chains":
            return handleGetChains();
        default:
            return { content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }], isError: true };
    }
}
export async function lifiGetToken(chain, token) {
    try {
        const res = await handleGetToken({ chain, token });
        const text = (res.content?.[0]?.text) || "{}";
        const data = JSON.parse(text);
        return data.address ? data : null;
    }
    catch {
        return null;
    }
}
export async function lifiGetQuote(fromChain, toChain, fromToken, toToken, fromAmount, fromAddress) {
    try {
        const res = await handleGetQuote({ fromChain, toChain, fromToken, toToken, fromAmount, fromAddress });
        const text = (res.content?.[0]?.text) || "{}";
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
