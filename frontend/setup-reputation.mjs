#!/usr/bin/env node

/**
 * One-shot ERC-8004 reputation setup:
 * 1. Creates developer wallet set + 2 wallets (owner + validator)
 * 2. Registers agent on IdentityRegistry
 * 3. Resolves agent ID from Transfer events
 * 4. Outputs env vars for .env.local
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

// Load .env manually (no dotenv dep needed)
const envPath = resolve(dirname(fileURLToPath(import.meta.url)), ".env");
const envRaw = readFileSync(envPath, "utf-8");
for (const line of envRaw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq);
  let value = trimmed.slice(eq + 1);
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.env[key] = value || "";
}

const API_KEY = process.env.CIRCLE_API_KEY || "";
const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET || "";
const RPC = process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network";

const IDENTITY = "0x8004A818BFB912233c491871b3d84c89A494BD9e";

const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: API_KEY,
  entitySecret: ENTITY_SECRET,
});

async function rpc(method, params = []) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Step 1: Create wallet set + wallets ──────────────────────────
console.log("Creating wallet set...");
const wsRes = await circleClient.createWalletSet({
  name: "UNIT ERC8004 Reputation",
});

const walletSetId = wsRes.data?.walletSet?.id;
if (!walletSetId) {
  console.error("No walletSetId returned");
  process.exit(1);
}
console.log("  Wallet set:", walletSetId);

console.log("Creating 2 SCA wallets...");
const wRes = await circleClient.createWallets({
  walletSetId,
  blockchains: ["ARC-TESTNET"],
  count: 2,
  accountType: "SCA",
});
const wallets = wRes.data?.wallets;
if (!wallets?.length) {
  console.error("No wallets returned");
  process.exit(1);
}
const ownerWallet = wallets[0];
const validatorWallet = wallets[1];
console.log("  Owner wallet ID:   ", ownerWallet.id);
console.log("  Owner address:     ", ownerWallet.address);
console.log("  Validator wallet ID:", validatorWallet.id);
console.log("  Validator address: ", validatorWallet.address);

// ── Step 2: Register agent ───────────────────────────────────────
console.log("\nRegistering agent on IdentityRegistry...");
const regRes = await circleClient.createContractExecutionTransaction({
  walletId: ownerWallet.id,
  contractAddress: IDENTITY,
  abiFunctionSignature: "register(string)",
  abiParameters: [
    "ipfs://bafkreifbjevvqojxsrry7a24em6r3qoncnihhu2ztccju2ubwnmhe2wn7q",
  ],
  fee: { type: "level", config: { feeLevel: "MEDIUM" } },
});
const txId = regRes.data?.id;
if (!txId) {
  console.error("No transaction ID returned");
  process.exit(1);
}
console.log("  Transaction ID:", txId);

// Poll until complete
console.log("  Waiting for transaction.");
let txHash = null;
for (let i = 0; i < 60; i++) {
  const txRes = await circleClient.getTransaction({ id: txId });
  const tx = txRes.data?.transaction;
  const state = tx?.state;
  txHash = tx?.txHash;
  if (state === "COMPLETE") {
    console.log("\n  Agent registered! Tx hash:", txHash);
    break;
  }
  if (state === "FAILED") {
    console.error("\n  Transaction failed:", tx?.reason);
    process.exit(1);
  }
  if (i % 5 === 0 && i > 0) console.log(`  Still waiting... (${i * 2}s)`);
  process.stdout.write(".");
  await sleep(2000);
}
console.log();

if (!txHash) {
  console.log(
    "\n  Transaction may still be pending. Trying to resolve agent ID anyway...",
  );
}

// ── Step 3: Resolve agent ID from Transfer events ────────────────
console.log("Resolving agent ID from Transfer events...");
const latestBlock = await rpc("eth_blockNumber");
const num = BigInt(latestBlock);
const fromBlock = num > 10000n ? "0x" + (num - 10000n).toString(16) : "0x0";

const logs = await rpc("eth_getLogs", [
  {
    address: IDENTITY,
    fromBlock,
    toBlock: latestBlock,
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      null,
      "0x000000000000000000000000" + ownerWallet.address.slice(2).toLowerCase(),
      null,
    ],
  },
]);

let agentId = "1";
if (logs.length > 0) {
  agentId = BigInt(logs[logs.length - 1].topics[3]).toString();
}
console.log("  Agent ID:", agentId);

// ── Output ───────────────────────────────────────────────────────
console.log("\n─────────── Add to .env.local ───────────");
console.log(`ERC8004_AGENT_ID=${agentId}`);
console.log(`ERC8004_AGENT_OWNER_WALLET_ID=${ownerWallet.id}`);
console.log(`ERC8004_AGENT_OWNER_ADDRESS=${ownerWallet.address}`);
console.log(`ERC8004_CLIENT_ADDRESS=${validatorWallet.address}`);
console.log(`ERC8004_VALIDATOR_WALLET_ID=${validatorWallet.id}`);
console.log("──────────────────────────────────────────");
