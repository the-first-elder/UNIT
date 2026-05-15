import { OpenAI } from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type {
  FunctionTool,
  ResponseFunctionToolCall,
} from "openai/resources/responses/responses";
import dotenv from "dotenv";

dotenv.config();

const AI_KEY = process.env.AI_KEY;
if (!AI_KEY) {
  throw new Error("AI_KEY is not set");
}
const openai = new OpenAI({
  baseURL: process.env.AI_URL,
  apiKey: AI_KEY,
});

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
          transport = new StreamableHTTPClientTransport(new URL(cfg.url), {
            requestInit: cfg.headers ? { headers: cfg.headers } : undefined,
          });
        } else {
          transport = new StdioClientTransport({
            command: cfg.command,
            args: cfg.args,
          });
        }

        const client = new Client({ name: `mcp-${name}`, version: "1.0.0" });
        await client.connect(transport);

        const toolsResult = await client.listTools();
        // console.log(`Server "${name}" offers tools:`, toolsResult.tools.map((t) => t.name));
        const serverTools = toolsResult.tools.map((tool) => {
          return {
            type: "function" as const,
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
            strict: false,
          };
        });

        return { name, client, serverTools };
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
    const maxIterations = 10;

    let response = await openai.responses.create({
      model: process.env.AI_MODEL,
      input: [{ role: "user" as const, content: query }],
      tools: this.tools,
    });

    for (let i = 0; i < maxIterations; i++) {
      const toolCalls = response.output.filter(
        (item): item is ResponseFunctionToolCall =>
          item.type === "function_call",
      );

      if (toolCalls.length === 0) {
        const text = response.output_text;
        if (text) console.log("Final Answer:", text);
        return text;
      }

      const results = await Promise.all(
        toolCalls.map(async (tc) => {
          const client = this.servers.get(this.toolToServer.get(tc.name) ?? "");
          if (!client) {
            return {
              type: "function_call_output" as const,
              call_id: tc.call_id,
              output: JSON.stringify({ error: `No server for tool: ${tc.name}` }),
            };
          }
          let args: Record<string, unknown>;
          try { args = JSON.parse(tc.arguments); } catch {
            return {
              type: "function_call_output" as const,
              call_id: tc.call_id,
              output: JSON.stringify({ error: "Failed to parse arguments" }),
            };
          }
          try {
            const result = await client.callTool({ name: tc.name, arguments: args });
            return {
              type: "function_call_output" as const,
              call_id: tc.call_id,
              output: JSON.stringify(result),
            };
          } catch (err) {
            return {
              type: "function_call_output" as const,
              call_id: tc.call_id,
              output: JSON.stringify({ error: String(err) }),
            };
          }
        }),
      );

      response = await openai.responses.create({
        model: process.env.AI_MODEL,
        previous_response_id: response.id,
        input: results,
        tools: this.tools,
      });
    }

    console.warn("Max iterations reached without final answer.");
    return response.output_text || "Max iterations reached without final answer.";
  }

  async chatMessage(message: string) {
    return await this.processQuery(message);
  }

  async cleanup() {
    await Promise.all(
      Array.from(this.servers.values()).map((c) => c.close()),
    );
  }
}
