import { MCPClient } from "./index.js";
import { encodeIntent, } from "./txBuilder.js";
import cors from "cors";
import express from "express";
import { DEFI_YIELD_TOOLS, callDefiYieldTool } from "./defiYieldTools.js";
import { LIFI_TOOLS, callLifiTool, lifiGetToken, lifiGetQuote } from "./lifiTools.js";
import { DEFIBORROW_TOOLS, callDefiborrowTool } from "./defiborrowTools.js";
import { COINGECKO_TOOLS, callCoingeckoTool } from "./coingeckoTools.js";
const app = express();
app.use(cors());
app.use(express.json());
const mcpClient = new MCPClient();
const serverConfigs = [];
async function start() {
    const errors = [];
    try {
        await mcpClient.connectToServers(serverConfigs);
    }
    catch (e) {
        errors.push(`connectToServers: ${e instanceof Error ? e.message : String(e)}`);
    }
    try {
        await mcpClient.addLocalTools("defi-yield", DEFI_YIELD_TOOLS, callDefiYieldTool);
        await mcpClient.addLocalTools("lifi", LIFI_TOOLS, callLifiTool);
        await mcpClient.addLocalTools("defiborrow", DEFIBORROW_TOOLS, callDefiborrowTool);
        await mcpClient.addLocalTools("coingecko", COINGECKO_TOOLS, callCoingeckoTool);
    }
    catch (e) {
        errors.push(`addLocalTools: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (errors.length)
        console.warn("Init completed with errors:", errors);
    const PORT = parseInt(process.env.PORT ?? "3001", 10);
    if (process.env.VERCEL !== "1") {
        app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    }
}
let initDone = false;
let initError = null;
start()
    .then(() => {
    initDone = true;
    console.log("Server initialization complete");
})
    .catch((e) => {
    initError = e instanceof Error ? e.message : String(e);
    console.error("Init failed:", e);
});
app.use((_req, _res, next) => {
    if (initDone)
        return next();
    if (initError) {
        console.warn("Init had errors, proceeding anyway:", initError);
        initDone = true;
        return next();
    }
    setImmediate(() => {
        if (initDone)
            return next();
        initDone = true;
        next();
    });
});
// Cache for find_best_yield results — reset per request
let yieldsCache = null;
let yieldsChain = "Ethereum";
let yieldsAsset = "USDC";
async function getYields(useCache = true) {
    if (useCache && yieldsCache)
        return yieldsCache;
    try {
        const result = await callDefiborrowTool("find_best_yield", {
            asset: yieldsAsset,
            chain: yieldsChain,
            top_n: 10,
        });
        const text = (result.content || [])
            .map((c) => c.text)
            .filter(Boolean)
            .join("\n");
        if (!text)
            return [];
        const data = JSON.parse(text);
        yieldsCache = data.best_yields ?? data.markets ?? [];
    }
    catch {
        yieldsCache = [];
    }
    return yieldsCache;
}
async function resolveVaultAddress(vaultName) {
    const yields = await getYields();
    if (!yields || !yields.length)
        return null;
    const nameLower = vaultName.toLowerCase();
    const extract = (url) => url.match(/\/vault\/(0x[a-fA-F0-9]{40})/)?.[1] ??
        url.match(/0x[a-fA-F0-9]{40}/)?.[0];
    const match = yields.find((y) => y.platform && nameLower.includes(y.platform.toLowerCase()));
    if (match?.url) {
        const addr = extract(match.url);
        if (addr)
            return addr;
    }
    for (const y of yields) {
        if (y.url) {
            const addr = extract(y.url);
            if (addr)
                return addr;
        }
    }
    return null;
}
function replaceUserAddress(obj, addr) {
    if (typeof obj === "string")
        return obj.replace(/\{\{userAddress\}\}/g, addr);
    if (Array.isArray(obj))
        return obj.map((item) => replaceUserAddress(item, addr));
    if (obj && typeof obj === "object") {
        const o = {};
        for (const [k, v] of Object.entries(obj))
            o[k] = replaceUserAddress(v, addr);
        return o;
    }
    return obj;
}
const isValidHexAddr = (s) => /^0x[a-fA-F0-9]{40}$/.test(s);
async function resolveStepAddress(address, vaultName) {
    if (isValidHexAddr(address))
        return null;
    return resolveVaultAddress(vaultName);
}
async function encodeSteps(obj, userAddress, chainId) {
    if (Array.isArray(obj))
        return Promise.all(obj.map((item) => encodeSteps(item, userAddress, chainId)));
    if (!obj || typeof obj !== "object")
        return obj;
    const o = obj;
    if (o.contractType && o.contractAddress && o.functionName) {
        const addr = o.contractAddress;
        if (/<[^>]+>/.test(addr)) {
            return {
                ...o,
                error: `Placeholder address "${addr}" — must resolve from a tool call`,
            };
        }
        const args = o.args ?? {};
        for (const val of Object.values(args)) {
            if (typeof val === "string" && /<[^>]+>/.test(val)) {
                return {
                    ...o,
                    error: `Placeholder "${val}" in args — must resolve from a tool call`,
                };
            }
        }
        try {
            const intent = {
                contractType: o.contractType,
                contractAddress: o.contractAddress,
                functionName: o.functionName,
                args: o.args ?? {},
            };
            const vaultName = o.description || o.protocol || "";
            const resolvedAddr = await resolveStepAddress(intent.contractAddress, vaultName);
            if (resolvedAddr)
                intent.contractAddress = resolvedAddr;
            for (const [key, val] of Object.entries(intent.args)) {
                if (typeof val === "string" && !isValidHexAddr(val)) {
                    const resolved = await resolveStepAddress(val, vaultName);
                    if (resolved)
                        intent.args[key] = resolved;
                }
            }
            return { ...o, tx: encodeIntent(intent) };
        }
        catch (e) {
            return { ...o, error: e.message };
        }
    }
    if (o.type === "lifi" &&
        ["buy", "swap", "execute_swap"].includes(o.action) &&
        o.fromToken &&
        o.toToken &&
        o.fromAmount &&
        userAddress) {
        try {
            const [fromSymbol, toSymbol, fromAmount] = [
                o.fromToken,
                o.toToken,
                o.fromAmount,
            ];
            const lifiChain = chainId || "1";
            const resolveToken = async (symbol) => {
                if (/^0x[a-fA-F0-9]{40}$/.test(symbol))
                    return symbol;
                const result = await lifiGetToken(lifiChain, symbol);
                return result?.address || null;
            };
            const [fromAddr, toAddr] = await Promise.all([
                resolveToken(fromSymbol),
                resolveToken(toSymbol),
            ]);
            if (!toAddr) {
                const vaultAddr = await resolveVaultAddress(toSymbol);
                if (vaultAddr) {
                    const intent = {
                        contractType: "erc4626",
                        contractAddress: vaultAddr,
                        functionName: "deposit",
                        args: { assets: fromAmount, receiver: userAddress },
                    };
                    return {
                        ...o,
                        type: "contract",
                        contractType: "erc4626",
                        contractAddress: vaultAddr,
                        functionName: "deposit",
                        args: { assets: fromAmount, receiver: userAddress },
                        tx: encodeIntent(intent),
                        fromToken: undefined,
                        toToken: undefined,
                        fromAmount: undefined,
                    };
                }
                return { ...o, error: `Cannot resolve token: ${toSymbol}` };
            }
            if (!fromAddr)
                return { ...o, error: `Cannot resolve token: ${fromSymbol}` };
            const quoteData = await lifiGetQuote(lifiChain, lifiChain, fromAddr, toAddr, fromAmount, userAddress);
            if (!quoteData) {
                return { ...o, error: "LI.FI quote returned empty response" };
            }
            const qd = quoteData;
            const txReq = qd.transactionRequest ||
                qd.estimate?.transactionRequest;
            if (!txReq) {
                return {
                    ...o,
                    error: "LI.FI quote did not include transactionRequest data",
                };
            }
            o.tx = {
                to: txReq.to,
                data: txReq.data,
                value: txReq.value || "0x0",
                chainId: qd.action?.fromChainId || parseInt(lifiChain) || 1,
            };
            const approvalAddr = qd.estimate?.approvalAddress;
            if (approvalAddr)
                o._approvalAddress = approvalAddr;
        }
        catch (e) {
            return {
                ...o,
                error: `LI.FI auto-resolve failed: ${e.message}`,
                ...(o.tx ? { tx: o.tx } : {}),
            };
        }
    }
    const encoded = {};
    for (const [k, v] of Object.entries(o))
        encoded[k] = await encodeSteps(v, userAddress, chainId);
    return encoded;
}
const CHAIN_NAMES = {
    "1": "Ethereum",
    "42161": "Arbitrum",
    "10": "Optimism",
    "8453": "Base",
    "137": "Polygon",
    "43114": "Avalanche",
    "56": "BSC",
    "11155111": "Sepolia",
    "5042002": "Arc Testnet",
};
app.post("/v1/begin", async (req, res) => {
    const { userPrompt, userWallet, chainId } = req.body;
    const missing = [];
    if (!userPrompt)
        missing.push("userPrompt");
    if (!userWallet)
        missing.push("userWallet");
    if (!chainId)
        missing.push("chainId");
    if (missing.length) {
        res.status(400).json({
            message: `Missing required fields: ${missing.join(", ")}`,
            status: 400,
        });
        return;
    }
    const chainIdStr = String(chainId);
    const chainName = CHAIN_NAMES[chainIdStr] || `Chain-${chainIdStr}`;
    console.log("userPrompt:", userPrompt, "userWallet:", userWallet, "chainId:", chainId);
    yieldsCache = null;
    yieldsChain = CHAIN_NAMES[chainIdStr] || chainIdStr;
    yieldsAsset = "USDC";
    try {
        let result = await mcpClient.chatMessage(`User wants: ${userPrompt}. Wallet: ${userWallet}. Chain: "${chainName}" (chainId: ${chainId}). STRICT RULE: You MUST use this chain for ALL tool calls and output it in EVERY step's chain field. Never output "Ethereum" unless chainId is 1. Execute the optimal strategy — call tools, return JSON execution plan. Do not refuse or give warnings.`);
        let responseData = result;
        if (typeof result === "string") {
            const clean = result
                .trim()
                .replace(/\/\*[\s\S]*?\*\//g, "")
                .replace(/^```(?:json)?\s*/, "")
                .replace(/\s*```$/, "")
                .split("\n")
                .filter((line) => !/^\s*\/\//.test(line))
                .join("\n");
            const jsonStr = clean.startsWith("{") || clean.startsWith("[")
                ? clean
                : clean.replace(/^[^{[]+/, "");
            try {
                let parsed = JSON.parse(jsonStr);
                if (userWallet)
                    parsed = replaceUserAddress(parsed, userWallet);
                responseData = await encodeSteps(parsed, userWallet, String(chainId));
                const steps = responseData?.steps;
                if (steps) {
                    for (let i = 0; i < steps.length; i++) {
                        const step = steps[i];
                        const args = step.args;
                        if (args) {
                            const addressArgs = new Set([
                                "spender",
                                "receiver",
                                "owner",
                                "asset",
                                "onBehalfOf",
                                "to",
                            ]);
                            const amountArgs = new Set([
                                "amount",
                                "assets",
                                "mintAmount",
                                "shares",
                                "redeemTokens",
                                "borrowAmount",
                                "repayAmount",
                            ]);
                            for (const [key, val] of Object.entries(args)) {
                                if (typeof val !== "string")
                                    continue;
                                if (addressArgs.has(key))
                                    continue;
                                if (amountArgs.has(key) && !/^\d+$/.test(val)) {
                                    let corrected = false;
                                    let correctAmount;
                                    if (!correctAmount &&
                                        step.functionName === "borrow" &&
                                        i + 1 < steps.length) {
                                        const nextStep = steps[i + 1];
                                        correctAmount = nextStep.fromAmount;
                                    }
                                    if (!correctAmount) {
                                        const allocations = responseData?.allocations;
                                        const allocation = allocations?.find((a) => a.strategy === step.strategy);
                                        correctAmount = allocation?.amount;
                                    }
                                    if (correctAmount && /^\d+$/.test(correctAmount)) {
                                        args[key] = correctAmount;
                                        corrected = true;
                                    }
                                    if (corrected) {
                                        if (step.type === "lifi" &&
                                            step.action === "approve" &&
                                            i + 1 < steps.length) {
                                            const nextStep = steps[i + 1];
                                            const approvalAddr = nextStep
                                                ._approvalAddress;
                                            if (approvalAddr)
                                                args.spender =
                                                    approvalAddr;
                                        }
                                        try {
                                            const intent = {
                                                contractType: step.contractType,
                                                contractAddress: step.contractAddress,
                                                functionName: step.functionName,
                                                args: step.args,
                                            };
                                            step.tx = encodeIntent(intent);
                                        }
                                        catch (e) {
                                            steps[i] = {
                                                ...step,
                                                error: `Re-encode failed: ${e.message}`,
                                            };
                                        }
                                    }
                                    else {
                                        steps[i] = {
                                            ...step,
                                            error: `Invalid ${key}: "${val}" — must be a numeric amount`,
                                        };
                                    }
                                }
                                else if (!/^\d+$/.test(val) &&
                                    !/^0x[a-fA-F0-9]{40}$/.test(val)) {
                                    steps[i] = {
                                        ...step,
                                        error: `Invalid ${key}: "${val}" — not a number or valid address`,
                                    };
                                }
                            }
                        }
                        if ((step.action === "buy" ||
                            step.action === "swap" ||
                            step.action === "execute_swap") &&
                            step.type !== "lifi") {
                            if (!step.error)
                                steps[i] = {
                                    ...step,
                                    error: `"${step.action}" action requires type "lifi" — got "${step.type}"`,
                                };
                        }
                        if (step.action === "approve" && i + 1 < steps.length) {
                            const nextStep = steps[i + 1];
                            const spender = args
                                ?.spender;
                            const nextAddr = nextStep.contractAddress;
                            if (spender &&
                                nextAddr &&
                                spender.toLowerCase() !== nextAddr.toLowerCase() &&
                                step.strategy !== "speculation" &&
                                step.strategy !== "swap") {
                                if (!step.error)
                                    step.warning = `Approve spender ${spender} ≠ next address ${nextAddr}`;
                            }
                        }
                        const tx = step.tx;
                        if (tx &&
                            typeof tx.data === "string" &&
                            tx.data.length > 0 &&
                            tx.data.length < 10) {
                            if (!step.error)
                                steps[i] = {
                                    ...step,
                                    error: `Placeholder tx data: "${tx.data}" — step not resolved`,
                                };
                        }
                    }
                }
            }
            catch (err) {
                console.warn("Failed to parse/encode AI response, sending raw result:", err);
            }
        }
        else if (result === null || result === undefined) {
            console.warn("AI returned null/undefined response");
            responseData = {
                error: "AI returned empty response",
                raw: String(result ?? ""),
            };
        }
        if (responseData === null || responseData === undefined) {
            responseData = {
                error: "Empty response from AI",
                raw: String(result ?? ""),
            };
        }
        if (typeof responseData === "string") {
            console.warn("responseData is still a raw string — wrapping in fallback object");
            responseData = {
                strategy: {
                    summary: responseData.slice(0, 200),
                    reasoning: "",
                    risk_level: "moderate",
                    estimated_apy: "",
                    protocol: "",
                    realistic_expectation_note: "",
                },
                options: [],
                allocations: [],
                steps: [],
            };
        }
        console.log("response:", responseData);
        res.json({ message: responseData });
    }
    catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(e);
        res.status(500).json({ message: errMsg || "Processing error" });
    }
});
app.use((_req, res) => {
    res
        .status(404)
        .json({ message: "Unknown endpoint. Use POST /v1/begin", status: 404 });
});
export default app;
