import { MCPClient } from "./index.ts";
import { OpenAI } from "openai";
async function main() {
  const mcpClient = new MCPClient();
  try {
    await mcpClient.connectToServers([
      { name: "fs", scriptPath: "https://mcp.li.quest/mcp" },
      //   { name: "db", scriptPath: "./db-server.py" },
    ]);
    await mcpClient.chatMessage("find me users created last week");
  } catch (e) {
    console.error("Error:", e);
    await mcpClient.cleanup();
    process.exit(1);
  } finally {
    await mcpClient.cleanup();
    process.exit(0);
  }
}

main();
