import { OpenAI } from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type {
  FunctionTool,
  ResponseFunctionToolCall,
} from "openai/resources/responses/responses";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
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
  private tools: FunctionTool[] = [];
  private toolToServer: Map<string, string> = new Map();
  private localHandlers: Map<
    string,
    (name: string, args: Record<string, unknown>) => Promise<unknown>
  > = new Map();

  async connectToServers(configs: ServerConfig[]) {
    const results = await Promise.all(
      configs.map(async (cfg) => {
        const transport =
          "url" in cfg
            ? new StreamableHTTPClientTransport(new URL(cfg.url), {
                requestInit:
                  cfg.headers && Object.values(cfg.headers).some(Boolean)
                    ? {
                        headers: Object.fromEntries(
                          Object.entries(cfg.headers).filter(([, v]) => v),
                        ),
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
          .filter(
            (t) =>
              t.name !== "get-earn-portfolio" &&
              !t.name.startsWith("get-earn-"),
          )
          .map((t) => ({
            type: "function" as const,
            name: t.name,
            description: t.description,
            parameters: t.inputSchema,
            strict: false,
          }));

        return { name: cfg.name, client, serverTools };
      }),
    );

    for (const { name, client, serverTools } of results) {
      for (const t of serverTools) this.toolToServer.set(t.name, name);
      this.tools.push(...serverTools);
      this.servers.set(name, client);
      console.log(
        `Connected to "${name}" with tools:`,
        serverTools.map(({ name: n }) => n),
      );
    }
  }

  async addLocalTools(
    serverName: string,
    tools: Tool[],
    handler: (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<{ content: Array<{ type: string; text?: string }>; isError?: boolean }>,
  ) {
    for (const t of tools) {
      this.tools.push({
        type: "function" as const,
        name: t.name,
        description: t.description,
        parameters: t.inputSchema as Record<string, unknown>,
        strict: false,
      });
      this.toolToServer.set(t.name, serverName);
    }
    this.localHandlers.set(serverName, handler);
    console.log(
      `Registered local tools:`,
      tools.map(({ name: n }) => n),
    );
  }

  async processQuery(query: string) {
    const maxIterations = parseInt(process.env.AI_MAX_ITERATIONS ?? "10", 10);
    const systemMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query },
    ];

    let response:
      | (OpenAI.Responses.Response & { _request_id?: string | null })
      | undefined;

    for (let i = 0; i < maxIterations; i++) {
      response = await openai.responses.create({
        model: process.env.AI_MODEL,
        input: systemMessages,
        tools: this.tools,
        context_management: [{ type: "compaction", compact_threshold: 100000 }],
      });

      const toolCalls = response.output.filter(
        (item): item is ResponseFunctionToolCall =>
          item.type === "function_call",
      );

      if (toolCalls.length === 0) {
        const text =
          response.output_text ||
          response.output
            ?.filter((item) => item.type === "message")
            .map(
              (item) =>
                (item as { content?: { text?: string }[] }).content
                  ?.map((c) => c.text)
                  .join("") ?? "",
            )
            .join("\n") ||
          "";
        console.log("Final Answer:", text);
        if (!text) {
          console.warn(
            "Empty output_text, full response:",
            JSON.stringify(response).slice(0, 500),
          );
        }
        return text;
      }

      console.log(
        "Calling tools:",
        toolCalls.map((tc) => tc.name),
      );

      const results = await Promise.all(
        toolCalls.map(async (tc) => {
          const serverName = this.toolToServer.get(tc.name) ?? "";

          let args: Record<string, unknown>;
          try {
            args = JSON.parse(tc.arguments);
          } catch {
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
            } catch (err) {
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
          } catch (err) {
            return {
              tc,
              call_id: tc.call_id,
              output: JSON.stringify({ error: String(err) }),
            };
          }
        }),
      );

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
    const fallback =
      response!.output_text ||
      response!.output
        ?.filter((item) => item.type === "message")
        .map(
          (item) =>
            (item as { content?: { text?: string }[] }).content
              ?.map((c) => c.text)
              .join("") ?? "",
        )
        .join("\n") ||
      "";
    return fallback || "Max iterations reached without final answer.";
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
