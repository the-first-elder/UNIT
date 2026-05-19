import { NextResponse } from "next/server";
import crypto from "crypto";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const API_KEY = process.env.CIRCLE_API_KEY || "";
const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET || "";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: API_KEY,
  entitySecret: ENTITY_SECRET,
});

const IDENTITY_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
const REPUTATION_REGISTRY = "0x8004B663056A597Dffe9eCcC1965A193B7388713";
const VALIDATION_REGISTRY = "0x8004Cb1BF31DAf7788923b405b754f57acEB4272";
const BLOCKCHAIN = "ARC-TESTNET" as const;

async function pollTransaction(txId: string, timeoutMs = 120_000): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { data } = await client.getTransaction({ id: txId });
    const tx = (data as any)?.transaction;
    const state = tx?.state;
    if (state === "COMPLETE") return { txHash: tx.txHash, state: "COMPLETE" };
    if (state === "FAILED") return { state: "FAILED", error: tx.reason || "Onchain failure" };
    await new Promise((r) => setTimeout(r, 2000));
  }
  return { state: "TIMEOUT", txId };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {

      case "createValidatorWallet": {
        const wsRes = await client.createWalletSet({
          name: "UNIT ERC8004 Validator",
          idempotencyKey: crypto.randomUUID(),
        });
        const wsData = (wsRes as any).data;
        const walletSetId = wsData?.walletSet?.id;
        if (!walletSetId) return NextResponse.json({ error: "No walletSetId returned" }, { status: 500 });

        const wRes = await client.createWallets({
          walletSetId,
          blockchains: [BLOCKCHAIN],
          count: 1,
          accountType: "SCA",
          idempotencyKey: crypto.randomUUID(),
        });
        const walletsData = (wRes as any).data;
        const wallet = walletsData?.wallets?.[0];
        if (!wallet) return NextResponse.json({ error: "No wallet returned" }, { status: 500 });

        return NextResponse.json({
          walletSetId,
          walletId: wallet.id,
          address: wallet.address,
          blockchain: wallet.blockchain,
        });
      }

      case "registerAgent": {
        const { walletId, metadataURI } = params;
        if (!walletId) return NextResponse.json({ error: "walletId required" }, { status: 400 });

        const txRes = await client.createContractExecutionTransaction({
          walletId,
          contractAddress: IDENTITY_REGISTRY,
          abiFunctionSignature: "register(string)",
          abiParameters: [metadataURI || "ipfs://bafkreibdi6623n3xpf7ymk62ckb4bo75o3qemwkpfvp5i25j66itxvsoei"],
          fee: { type: "level" as const, config: { feeLevel: "MEDIUM" as const } },
          idempotencyKey: crypto.randomUUID(),
        });
        const txData = (txRes as any).data;
        const txId = txData?.id;
        if (!txId) return NextResponse.json({ error: "No txId returned" }, { status: 500 });

        const result = await pollTransaction(txId);
        return NextResponse.json(result);
      }

      case "recordReputation": {
        const { walletId, agentId, score, tag } = params;
        if (!walletId || !agentId) return NextResponse.json({ error: "walletId and agentId required" }, { status: 400 });

        const feedbackHash = "0x" + sha256Hex(tag || "execution");

        const txRes = await client.createContractExecutionTransaction({
          walletId,
          contractAddress: REPUTATION_REGISTRY,
          abiFunctionSignature: "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)",
          abiParameters: [String(agentId), String(score ?? 100), "0", tag || "execution", "", "", "", feedbackHash],
          fee: { type: "level" as const, config: { feeLevel: "MEDIUM" as const } },
          idempotencyKey: crypto.randomUUID(),
        });
        const txData = (txRes as any).data;
        const txId = txData?.id;
        if (!txId) return NextResponse.json({ error: "No txId returned" }, { status: 500 });

        const result = await pollTransaction(txId);
        return NextResponse.json(result);
      }

      case "getWallet": {
        const { walletId } = params;
        if (!walletId) return NextResponse.json({ error: "walletId required" }, { status: 400 });
        const res = await client.getWallet({ id: walletId });
        return NextResponse.json((res as any).data);
      }

      case "debugEnv": {
        const pk = await client.getPublicKey().then(r => (r.data as any)?.publicKey?.substring(0, 30)).catch(() => null);
        return NextResponse.json({
          apiKey: (API_KEY || "").substring(0, 30) + "...",
          entitySecret: (ENTITY_SECRET || "").substring(0, 15) + "...",
          publicKey: pk,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}
