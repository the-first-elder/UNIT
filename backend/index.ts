import { OpenAI } from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type {
  FunctionTool,
  ResponseFunctionToolCall,
} from "openai/resources/responses/responses";
import dotenv from "dotenv";
import { SYSTEM_PROMPT } from "./agent.js";

dotenv.config();

const AI_KEY = process.env.AI_KEY;
if (!AI_KEY) {
  throw new Error("AI_KEY is not set");
}
const openai = new OpenAI({
  baseURL: process.env.AI_URL,
  apiKey: AI_KEY,
});

export type ServerConfig =
  | { name: string; url: string; headers?: Record<string, string> }
  | { name: string; command: string; args: string[] };

export class MCPClient {
  private servers: Map<string, Client> = new Map();
  private tools: FunctionTool[] = [];
  private toolToServer: Map<string, string> = new Map();

  async connectToServers(
    configs: (
      | { name: string; url: string; headers?: Record<string, string> }
      | { name: string; command: string; args: string[] }
    )[],
  ) {
    const results = await Promise.all(
      configs.map(async (cfg) => {
        let transport;

        if ("url" in cfg) {
          const filteredHeaders: Record<string, string> = {};
          if (cfg.headers) {
            for (const [k, v] of Object.entries(cfg.headers)) {
              if (v) filteredHeaders[k] = v;
            }
          }
          transport = new StreamableHTTPClientTransport(new URL(cfg.url), {
            requestInit:
              Object.keys(filteredHeaders).length > 0
                ? { headers: filteredHeaders }
                : undefined,
          });
        } else {
          transport = new StdioClientTransport({
            command: cfg.command,
            args: cfg.args,
          });
        }

        const client = new Client({
          name: `mcp-${cfg.name}`,
          version: "1.0.0",
        });
        await client.connect(transport);

        const toolsResult = await client.listTools();
        // console.log(`Server "${cfg.name}" offers tools:`, toolsResult.tools.map((t) => t.name));
        const serverTools = toolsResult.tools
          .filter((tool) => tool.name !== "get-earn-portfolio")
          .map((tool) => {
            return {
              type: "function" as const,
              name: tool.name,
              description: tool.description,
              parameters: tool.inputSchema,
              strict: false,
            };
          });

        return { name: cfg.name, client, serverTools };
      }),
    );

    for (const { name, client, serverTools } of results) {
      for (const t of serverTools) {
        this.toolToServer.set(t.name, name);
      }
      this.tools.push(...serverTools);
      this.servers.set(name, client);
      console.log(
        `Connected to "${name}" with tools:`,
        serverTools.map(({ name: n }) => n),
      );
    }
  }

  async processQuery(query: string) {
    const maxIterations = parseInt(process.env.AI_MAX_ITERATIONS ?? "10", 10);
    let systemMessages: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

    systemMessages.push({ role: "user" as const, content: query });
    let response:
      | (OpenAI.Responses.Response & {
          _request_id?: string | null;
        })
      | undefined;
    for (let i = 0; i < maxIterations; i++) {
      response = await openai.responses.create({
        model: process.env.AI_MODEL,
        input: systemMessages,
        tools: this.tools,
        context_management: [{ type: "compaction", compact_threshold: 100000 }],
        // store: false,
        // ...(response ? { previous_response_id: response.id } : {}),
      });

      console.log(`\n--- Iteration ${i} ---`);
      console.log(
        "Output items:",
        response.output.map((o: any) => o.type),
      );

      const toolCalls = response.output.filter(
        (item: any): item is ResponseFunctionToolCall =>
          item.type === "function_call",
      );

      if (toolCalls.length === 0) {
        const text = response.output_text;
        console.log("Final Answer:", text);
        return text;
      }

      console.log(
        "Calling tools:",
        toolCalls.map((tc: any) => tc.name),
      );

      const results = await Promise.all(
        toolCalls.map(async (tc: any) => {
          const client = this.servers.get(this.toolToServer.get(tc.name) ?? "");
          if (!client) {
            return {
              tc: tc,
              call_id: tc.call_id,
              output: JSON.stringify({
                error: `No server for tool: ${tc.name}`,
              }),
            };
          }
          let args: Record<string, unknown>;
          try {
            args = JSON.parse(tc.arguments);
          } catch {
            return {
              tc: tc,
              call_id: tc.call_id,
              output: JSON.stringify({ error: "Failed to parse arguments" }),
            };
          }
          try {
            const result = await client.callTool({
              name: tc.name,
              arguments: args,
            });
            return {
              tc: tc,
              call_id: tc.call_id,
              output: JSON.stringify(result),
            };
          } catch (err) {
            return {
              tc: tc,
              call_id: tc.call_id,
              output: JSON.stringify({ error: String(err) }),
            };
          }
        }),
      );

      for (const r of results) {
        // console.log(`Tool "${r.call_id}" output:`, r.tc);
        systemMessages.push(r.tc);
        systemMessages.push({
          type: "function_call_output",
          call_id: r.call_id,
          output: r.output,
        });
      }

      //   response = await openai.responses.create({
      //     model: process.env.AI_MODEL,
      //     input: systemMessages,
      //     tools: this.tools,
      //     max_output_tokens: 4000,
      //   });
    }

    console.warn("Max iterations reached without final answer.");
    systemMessages = [];
    return (
      response!.output_text || "Max iterations reached without final answer."
    );
  }

  async chatMessage(message: string) {
    return await this.processQuery(message);
  }

  async cleanup() {
    await Promise.all(Array.from(this.servers.values()).map((c) => c.close()));
  }

  getServer(name: string): Client | undefined {
    return this.servers.get(name);
  }
}
