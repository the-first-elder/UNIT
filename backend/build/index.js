import { OpenAI } from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import dotenv from "dotenv";
import { SYSTEM_PROMPT } from "./agent.js";
dotenv.config();
const AI_KEY = process.env.AI_KEY;
if (!AI_KEY)
    throw new Error("AI_KEY is not set");
const openai = new OpenAI({
    baseURL: process.env.AI_URL,
    apiKey: AI_KEY,
});
export class MCPClient {
    servers = new Map();
    tools = [];
    toolToServer = new Map();
    localHandlers = new Map();
    async connectToServers(configs) {
        const results = await Promise.allSettled(configs.map(async (cfg) => {
            const transport = "url" in cfg
                ? new StreamableHTTPClientTransport(new URL(cfg.url), {
                    requestInit: cfg.headers && Object.values(cfg.headers).some(Boolean)
                        ? {
                            headers: Object.fromEntries(Object.entries(cfg.headers).filter(([, v]) => v)),
                        }
                        : undefined,
                })
                : new StdioClientTransport({
                    command: cfg.command,
                    args: cfg.args,
                });
            const client = new Client({
                name: `mcp-${cfg.name}`,
                version: "1.0.0",
            });
            await client.connect(transport);
            const toolsResult = await client.listTools();
            const serverTools = toolsResult.tools
                .filter((t) => t.name !== "get-earn-portfolio" &&
                !t.name.startsWith("get-earn-"))
                .map((t) => ({
                type: "function",
                name: t.name,
                description: t.description,
                parameters: t.inputSchema,
                strict: false,
            }));
            return { name: cfg.name, client, serverTools };
        }));
        for (const result of results) {
            if (result.status === "rejected") {
                console.warn("Failed to connect server:", result.reason);
                continue;
            }
            const { name, client, serverTools } = result.value;
            for (const t of serverTools)
                this.toolToServer.set(t.name, name);
            this.tools.push(...serverTools);
            this.servers.set(name, client);
            console.log(`Connected to "${name}" with tools:`, serverTools.map(({ name: n }) => n));
        }
    }
    async addLocalTools(serverName, tools, handler) {
        for (const t of tools) {
            this.tools.push({
                type: "function",
                name: t.name,
                description: t.description,
                parameters: t.inputSchema,
                strict: false,
            });
            this.toolToServer.set(t.name, serverName);
        }
        this.localHandlers.set(serverName, handler);
        console.log(`Registered local tools:`, tools.map(({ name: n }) => n));
    }
    async processQuery(query) {
        const maxIterations = parseInt(process.env.AI_MAX_ITERATIONS ?? "10", 10);
        const systemMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: query },
        ];
        let response;
        for (let i = 0; i < maxIterations; i++) {
            response = await openai.responses.create({
                model: process.env.AI_MODEL,
                input: systemMessages,
                tools: this.tools,
                context_management: [{ type: "compaction", compact_threshold: 100000 }],
            });
            const toolCalls = response.output.filter((item) => item.type === "function_call");
            if (toolCalls.length === 0) {
                const text = response.output_text ||
                    response.output
                        ?.filter((item) => item.type === "message")
                        .map((item) => item.content
                        ?.map((c) => c.text)
                        .join("") ?? "")
                        .join("\n") ||
                    "";
                console.log("Final Answer:", text);
                if (!text) {
                    console.warn("Empty output_text, full response:", JSON.stringify(response).slice(0, 500));
                }
                return text;
            }
            console.log("Calling tools:", toolCalls.map((tc) => tc.name));
            const results = await Promise.all(toolCalls.map(async (tc) => {
                const serverName = this.toolToServer.get(tc.name) ?? "";
                let args;
                try {
                    args = JSON.parse(tc.arguments);
                }
                catch {
                    return {
                        tc,
                        call_id: tc.call_id,
                        output: JSON.stringify({ error: "Failed to parse arguments" }),
                    };
                }
                const localHandler = serverName ? this.localHandlers.get(serverName) : undefined;
                if (localHandler) {
                    try {
                        const result = await localHandler(tc.name, args);
                        const MAX_OUTPUT = 4000;
                        let output = JSON.stringify(result);
                        if (output.length > MAX_OUTPUT)
                            output =
                                output.slice(0, MAX_OUTPUT) +
                                    `\n... [truncated ${output.length - MAX_OUTPUT} more chars]`;
                        return { tc, call_id: tc.call_id, output };
                    }
                    catch (err) {
                        return {
                            tc,
                            call_id: tc.call_id,
                            output: JSON.stringify({ error: String(err) }),
                        };
                    }
                }
                const client = this.servers.get(serverName);
                if (!client)
                    return {
                        tc,
                        call_id: tc.call_id,
                        output: JSON.stringify({ error: `No server for: ${tc.name}` }),
                    };
                try {
                    const result = await client.callTool({
                        name: tc.name,
                        arguments: args,
                    });
                    const MAX_OUTPUT = 4000;
                    let output = JSON.stringify(result);
                    if (output.length > MAX_OUTPUT)
                        output =
                            output.slice(0, MAX_OUTPUT) +
                                `\n... [truncated ${output.length - MAX_OUTPUT} more chars]`;
                    return { tc, call_id: tc.call_id, output };
                }
                catch (err) {
                    return {
                        tc,
                        call_id: tc.call_id,
                        output: JSON.stringify({ error: String(err) }),
                    };
                }
            }));
            for (const r of results) {
                systemMessages.push(r.tc);
                systemMessages.push({
                    type: "function_call_output",
                    call_id: r.call_id,
                    output: r.output,
                });
            }
        }
        console.warn("Max iterations reached without final answer.");
        const fallback = response.output_text ||
            response.output
                ?.filter((item) => item.type === "message")
                .map((item) => item.content
                ?.map((c) => c.text)
                .join("") ?? "")
                .join("\n") ||
            "";
        return fallback || "Max iterations reached without final answer.";
    }
    async chatMessage(message) {
        return this.processQuery(message);
    }
    async cleanup() {
        await Promise.all(Array.from(this.servers.values()).map((c) => c.close()));
    }
    getServer(name) {
        return this.servers.get(name);
    }
}
