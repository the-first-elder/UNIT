import { MCPClient, type ServerConfig } from "./index.js";
import cors from "cors";
import express from "express";
import type { Request, Response } from "express";

const app = express();
app.use(cors());
app.use(express.json());

const mcpClient = new MCPClient();

const serverConfigs: ServerConfig[] = [
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
  {
    name: "defiborrow",
    url: "https://defiborrow.loan/mcp",
  },
  {
    name: "coingecko",
    url: "https://mcp.api.coingecko.com/mcp",
  },
  {
    name: "ccxt",
    command: "node",
    args: ["./node_modules/@lazydino/ccxt-mcp/bin/ccxt-mcp.js"],
  },
  {
    name: "hive-sentiment",
    url: "https://mcp.hiveintelligence.xyz/mcp",
    headers: { Authorization: `Bearer ${process.env.HIVE_API_KEY ?? ""}` },
  },
  {
    name: "philidor",
    url: "https://mcp.philidor.io/api/mcp",
  },
];

async function start() {
  try {
    await mcpClient.connectToServers(serverConfigs);
    const PORT = parseInt(process.env.PORT ?? "3001", 10);
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (e) {
    console.error("Failed to start:", e);
    process.exit(1);
  }
}

app.post("/v1/begin", async (req: Request, res: Response) => {
  const { userPrompt } = req.body;
  console.log("userPrompt:", userPrompt);
  try {
    const result = await mcpClient.chatMessage(userPrompt);
    console.log("response:", result);
    res.json({ message: result });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error(e);
    res.status(500).json({
      message:
        errMsg ||
        "An error occurred while processing your request... please try again later.",
    });
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message:
      "Oops! You've reached an unknown endpoint. The Uniclaw API is currently only listening at POST /v1/begin.",
    status: 404,
  });
});

start();
