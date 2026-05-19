import { OpenAI } from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
// No responses import needed for standard chat completions
import dotenv from "dotenv";
import { SYSTEM_PROMPT } from "./agent.js";

dotenv.config();

const AI_KEY = process.env.AI_KEY;
if (!AI_KEY) throw new Error("AI_KEY is not set");

const openai = new OpenAI({
  baseURL: process.env.AI_URL,
  apiKey: AI_KEY,
});

export type ServerConfig =
  | { name: string; url: string; headers?: Record<string, string> }
  | { name: string; command: string; args: string[] };

export class MCPClient {
  private servers: Map<string, Client> = new Map();
  private tools: any[] = [];
  private toolToServer: Map<string, string> = new Map();

  async connectToServers(configs: ServerConfig[]) {
    const results = await Promise.all(
      configs.map(async (cfg) => {
        const transport = "url" in cfg
          ? new StreamableHTTPClientTransport(new URL(cfg.url), {
              requestInit: cfg.headers && Object.values(cfg.headers).some(Boolean)
                ? { headers: Object.fromEntries(Object.entries(cfg.headers).filter(([, v]) => v)) }
                : undefined,
            })
          : new StdioClientTransport({ command: cfg.command, args: cfg.args });

        const client = new Client({ name: `mcp-${cfg.name}`, version: "1.0.0" });
        await client.connect(transport);

        const toolsResult = await client.listTools();
        const serverTools = toolsResult.tools
          .filter((t) => t.name !== "get-earn-portfolio" && !t.name.startsWith("get-earn-"))
          .map((t) => ({
            type: "function" as const,
            function: {
              name: t.name,
              description: t.description,
              parameters: t.inputSchema,
            },
          }));

        return { name: cfg.name, client, serverTools };
      }),
    );

    for (const { name, client, serverTools } of results) {
      for (const t of serverTools) this.toolToServer.set(t.function.name, name);
      this.tools.push(...serverTools);
      this.servers.set(name, client);
      console.log(`Connected to "${name}" with tools:`, serverTools.map(({ function: f }) => f.name));
    }
  }

  async processQuery(query: string) {
    const maxIterations = parseInt(process.env.AI_MAX_ITERATIONS ?? "10", 10);
    const systemMessages: any[] = [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: query }];

    let lastMessage: any = null;

    for (let i = 0; i < maxIterations; i++) {
      const response = await openai.chat.completions.create({
        model: process.env.AI_MODEL || "google/gemini-2.5-flash:free",
        messages: systemMessages,
        tools: this.tools,
      });

      const message = response.choices[0].message;
      systemMessages.push(message);
      lastMessage = message;

      const toolCalls = message.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        const text = message.content || "";
        console.log("Final Answer:", text);
        return text;
      }

      console.log("Calling tools:", toolCalls.map((tc) => tc.function.name));

      const results = await Promise.all(
        toolCalls.map(async (tc) => {
          const client = this.servers.get(this.toolToServer.get(tc.function.name) ?? "");
          if (!client) {
            return {
              role: "tool" as const,
              tool_call_id: tc.id,
              content: JSON.stringify({ error: `No server for: ${tc.function.name}` }),
            };
          }

          let args: Record<string, unknown>;
          try {
            args = JSON.parse(tc.function.arguments);
          } catch {
            return {
              role: "tool" as const,
              tool_call_id: tc.id,
              content: JSON.stringify({ error: "Failed to parse arguments" }),
            };
          }

          try {
            const result = await client.callTool({ name: tc.function.name, arguments: args });
            const MAX_OUTPUT = 4000;
            let output = JSON.stringify(result);
            if (output.length > MAX_OUTPUT) {
              output = output.slice(0, MAX_OUTPUT) + `\n... [truncated ${output.length - MAX_OUTPUT} more chars]`;
            }
            return {
              role: "tool" as const,
              tool_call_id: tc.id,
              content: output,
            };
          } catch (err) {
            return {
              role: "tool" as const,
              tool_call_id: tc.id,
              content: JSON.stringify({ error: String(err) }),
            };
          }
        }),
      );

      for (const r of results) {
        systemMessages.push(r);
      }
    }

    console.warn("Max iterations reached without final answer.");
    return lastMessage?.content || "Max iterations reached without final answer.";
  }

  async chatMessage(message: string) {
    return this.processQuery(message);
  }

  async cleanup() {
    await Promise.all(Array.from(this.servers.values()).map((c) => c.close()));
  }

  getServer(name: string): Client | undefined {
    return this.servers.get(name);
  }
}
