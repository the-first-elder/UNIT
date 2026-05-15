import { OpenAI } from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type {
  FunctionTool,
  ResponseFunctionToolCall,
} from "openai/resources/responses/responses";
import type { ResponseInputItem } from "openai/resources/responses/responses";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}
const openai = new OpenAI({
  baseURL: process.env.AI_URL,
  apiKey: process.env.AI_KEY,
});

export class MCPClient {
  private servers: Map<string, Client> = new Map();
  private tools: FunctionTool[] = [];
  private toolToServer: Map<string, string> = new Map();

  async connectToServers(
    configs: { name: string; scriptPath: string }[],
  ) {
    const results = await Promise.all(
      configs.map(async ({ name, scriptPath }) => {
        const isJs = scriptPath.endsWith(".js");
        const isPy = scriptPath.endsWith(".py");
        if (!isJs && !isPy) {
          throw new Error(`Server "${name}" script must be a .js or .py file`);
        }
        const command = isPy
          ? process.platform === "win32"
            ? "python"
            : "python3"
          : process.execPath;

        const transport = new StdioClientTransport({
          command,
          args: [scriptPath],
        });
        const client = new Client({ name: `mcp-${name}`, version: "1.0.0" });
        await client.connect(transport);

        const toolsResult = await client.listTools();
        const serverTools = toolsResult.tools.map((tool) => {
          return {
            type: "function" as const,
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
            strict: true,
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
    let input: ResponseInputItem[] = [{ role: "user", content: query }];

    for (let i = 0; i < maxIterations; i++) {
      let response;
      try {
        response = await openai.responses.create({
          model: process.env.AI_MODEL,
          input,
          tools: this.tools,
        });
      } catch (err) {
        console.error("OpenAI API error:", err);
        return "Retry... Aurum AI Provider Error";
      }

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
          const serverName = this.toolToServer.get(tc.name);
          const client = serverName ? this.servers.get(serverName) : undefined;

          if (!client) {
            console.error(`No server found for tool: ${tc.name}`);
            return {
              call_id: tc.call_id,
              output: JSON.stringify({ error: `No server found for tool: ${tc.name}` }),
            };
          }

          let args: Record<string, unknown>;
          try {
            args = JSON.parse(tc.arguments);
          } catch {
            console.error("Failed to parse arguments for:", tc.name);
            return {
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
              call_id: tc.call_id,
              output: JSON.stringify(result),
            };
          } catch (err) {
            console.error(`Tool ${tc.name} failed:`, err);
            return {
              call_id: tc.call_id,
              output: JSON.stringify({ error: String(err) }),
            };
          }
        }),
      );

      input = results.map((r) => ({
        type: "function_call_output" as const,
        call_id: r.call_id,
        output: r.output,
      }));
    }

    console.warn("Max iterations reached without final answer.");
    return "Max iterations reached without final answer.";
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
