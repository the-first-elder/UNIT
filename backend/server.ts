import { MCPClient } from "./index.ts";
async function main() {
  const mcpClient = new MCPClient();
  try {
    await mcpClient.connectToServers([
      {
        name: "lifi",
        url: "https://mcp.li.quest/mcp",
        headers: { "X-LiFi-Api-Key": process.env.LIFI_API_KEY ?? "" },
      },
      {
        name: "defi-yield",
        command: "python",
        args: ["-m", "defi_yield_mcp"],
      },
    ]);
    await mcpClient.chatMessage("i want to swap 10 usdc to weth from ethereum to arbitrum get me the route here is my wallet address 0x748DE9BFBDD651bD461a1cf95F9D8c6F7ab93B06");
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
