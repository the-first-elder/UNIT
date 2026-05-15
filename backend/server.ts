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
      //   https://mcpservers.org/servers/rjw34/defi-yield-mcp
      // updates every 5 minutes
      {
        name: "defi-yield",
        command: "python",
        args: ["-m", "defi_yield_mcp"],
      },
      //   https://mcpservers.org/servers/qingfeng/defi-rates-mcp
      //   note this runs hourly.. data may be stale
      {
        name: "defiborrow",
        url: "https://defiborrow.loan/mcp",
        // headers: { "X-LiFi-Api-Key": process.env.LIFI_API_KEY ?? "" },
      },
      {
        name: "coingecko",
        url: "https://mcp.api.coingecko.com/mcp",
      },
      //   https://github.com/lazy-dinosaur/ccxt-mcp
      //   real-time prices, order books, tickers from 100+ exchanges
      {
        name: "ccxt",
        command: "node",
        args: ["./node_modules/@lazydino/ccxt-mcp/bin/ccxt-mcp.js"],
      },
      //   https://github.com/hiveintelligencexyz/hive-mcp-social-sentiment
      //   social sentiment, community growth, trending topics, FUD/FOMO detection
      //   no API key needed
      {
        name: "hive-sentiment",
        url: "https://mcp.hiveintelligence.xyz/mcp",
        headers: { Authorization: `Bearer ${process.env.HIVE_API_KEY ?? ""}` },
      },
      //   Twitter/X data needs Twitter API credentials (dev account)
      //   search "x-mcp github" for options if needed later
      //   CoinDesk MCP uses OAuth 2.0 PKCE (browser flow) — not usable headless
      //   https://mcp.coindesk.com/
      //   https://github.com/Philidor-Labs/philidor-mcp
      //   DeFi vault risk analytics, no API key needed
      {
        name: "philidor",
        url: "https://mcp.philidor.io/api/mcp",
      },
      //   https://github.xcom/dennisonbertram/mcp-etherscan-server
      //   on-chain data: balances, tx history, ENS, gas prices, 72 networks
      //   needs free Etherscan API key from https://etherscan.io/apis
      //   set ETHERSCAN_API_KEY in .env
      //   clone + build:
      //     git clone https://github.com/dennisonbertram/mcp-etherscan-server.git etherscan-mcp
      //     cd etherscan-mcp && npm install && npm run build
      // {
      //   name: "etherscan",
      //   command: "node",
      //   args: ["./etherscan-mcp/build/index.js"],
      // },
    ]);
    await mcpClient.chatMessage(
      "what are the best eth yield opportunities on ethereum mainnet right now? show me top 5 with apy, tvl, and risk level",
    );
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
