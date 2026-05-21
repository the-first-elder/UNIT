const CACHE_TTL = 300_000;
let cachedSentiment = null;
let lastFetch = 0;
async function fetchFearGreedIndex() {
    const now = Date.now();
    if (cachedSentiment && now - lastFetch < CACHE_TTL)
        return cachedSentiment;
    try {
        const res = await fetch("https://api.alternative.me/fng/?limit=1");
        const data = (await res.json());
        if (data?.data?.[0]) {
            cachedSentiment = {
                index: parseInt(data.data[0].value || "50"),
                classification: data.data[0].value_classification || "Neutral",
                timestamp: data.data[0].timestamp,
                source: "alternative.me (Fear & Greed Index)",
            };
            lastFetch = now;
            return cachedSentiment;
        }
    }
    catch {
        // fall through to default
    }
    cachedSentiment = {
        index: 50,
        classification: "Neutral",
        note: "Could not fetch live data, using default",
    };
    lastFetch = now;
    return cachedSentiment;
}
export const HIVE_TOOLS = [
    {
        name: "get_market_sentiment",
        description: "Get current market sentiment and mood analysis. Returns Fear & Greed Index, market classification, and overall sentiment trend.",
        inputSchema: {
            type: "object",
            properties: {},
        },
    },
];
async function handleGetMarketSentiment() {
    const fng = await fetchFearGreedIndex();
    const index = fng.index;
    let marketMood;
    if (index <= 25)
        marketMood = "extreme_fear";
    else if (index <= 40)
        marketMood = "fear";
    else if (index <= 60)
        marketMood = "neutral";
    else if (index <= 75)
        marketMood = "greed";
    else
        marketMood = "extreme_greed";
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    marketMood,
                    fearGreedIndex: index,
                    classification: fng.classification,
                    note: "DeFi yields tend to be higher in fear markets (less competition), lower in greed markets (more capital chasing yield).",
                    source: fng.source,
                }, null, 2),
            },
        ],
    };
}
export async function callHiveTool(name, _args) {
    if (name === "get_market_sentiment")
        return handleGetMarketSentiment();
    return { content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }], isError: true };
}
