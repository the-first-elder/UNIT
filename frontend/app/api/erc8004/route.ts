/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createPublicClient, http, parseAbiItem, keccak256, toHex } from "viem";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

// ── Config ──────────────────────────────────────────────────────────

const API_KEY = process.env.CIRCLE_API_KEY || "";
const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET || "";
const ARC_RPC = process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network";

const IDENTITY_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const;
const REPUTATION_REGISTRY =
  "0x8004B663056A597Dffe9eCcC1965A193B7388713" as const;
const VALIDATION_REGISTRY =
  "0x8004Cb1BF31DAf7788923b405b754f57acEB4272" as const;
const BLOCKCHAIN = "ARC-TESTNET" as const;

const ERC8004_AGENT_ID = process.env.ERC8004_AGENT_ID || "";
const ERC8004_VALIDATOR_WALLET_ID =
  process.env.ERC8004_VALIDATOR_WALLET_ID || "";

const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: API_KEY,
  entitySecret: ENTITY_SECRET,
});

const publicClient = createPublicClient({
  chain: {
    id: 504_2002,
    name: "Arc Testnet",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
    rpcUrls: { default: { http: [ARC_RPC] } },
    testnet: true,
  },
  transport: http(),
});

// ── Helpers ─────────────────────────────────────────────────────────

async function pollTransaction(
  txId: string,
  timeoutMs = 120_000,
): Promise<{ txHash?: string; state: string; error?: string }> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { data } = await circleClient.getTransaction({ id: txId });
    const tx = (data as any)?.transaction;
    const state = tx?.state;
    if (state === "COMPLETE") return { txHash: tx.txHash, state: "COMPLETE" };
    if (state === "FAILED")
      return { state: "FAILED", error: tx?.reason || "Onchain failure" };
    await new Promise((r) => setTimeout(r, 2_000));
  }
  return { state: "TIMEOUT" };
}

async function sendContractTx(
  walletId: string,
  contractAddress: string,
  abiFunctionSignature: string,
  abiParameters: string[],
  label: string,
) {
  const txRes = await circleClient.createContractExecutionTransaction({
    walletId,
    contractAddress,
    abiFunctionSignature,
    abiParameters,
    fee: {
      type: "level" as const,
      config: { feeLevel: "MEDIUM" as const },
    },
    idempotencyKey: crypto.randomUUID(),
  });
  const txData = (txRes as any).data;
  const txId = txData?.id;
  if (!txId) throw new Error(`No txId returned for ${label}`);

  const result = await pollTransaction(txId);
  if (result.state !== "COMPLETE")
    throw new Error(`${label} failed: ${result.error || result.state}`);
  return { txId, txHash: result.txHash! };
}

// ── Validation ABI (for reads) ──────────────────────────────────────

const validationReadAbi = [
  {
    name: "getValidationStatus",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "requestHash", type: "bytes32" }],
    outputs: [
      { name: "validatorAddress", type: "address" },
      { name: "agentId", type: "uint256" },
      { name: "response", type: "uint8" },
      { name: "responseHash", type: "bytes32" },
      { name: "tag", type: "string" },
      { name: "lastUpdate", type: "uint256" },
    ],
  },
] as const;

// ── Route ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      // ── Wallets ────────────────────────────────────────────────

      case "createWallets": {
        const wsRes = await circleClient.createWalletSet({
          name: params.walletSetName || "ERC8004 Agent Wallets",
          idempotencyKey: crypto.randomUUID(),
        });
        const walletSetId = (wsRes as any).data?.walletSet?.id;
        if (!walletSetId)
          return NextResponse.json(
            { error: "No walletSetId returned" },
            { status: 500 },
          );

        const wRes = await circleClient.createWallets({
          walletSetId,
          blockchains: [BLOCKCHAIN],
          count: 2,
          accountType: "SCA",
          idempotencyKey: crypto.randomUUID(),
        });
        const wallets = (wRes as any).data?.wallets;
        if (!wallets?.length)
          return NextResponse.json(
            { error: "No wallets returned" },
            { status: 500 },
          );

        return NextResponse.json({
          walletSetId,
          ownerWallet: wallets[0],
          validatorWallet: wallets[1],
        });
      }

      case "getWallet": {
        const { walletId } = params;
        if (!walletId)
          return NextResponse.json(
            { error: "walletId required" },
            { status: 400 },
          );
        const res = await circleClient.getWallet({ id: walletId });
        return NextResponse.json((res as any).data);
      }

      // ── Identity Registry ──────────────────────────────────────

      case "registerAgent": {
        const { walletId, metadataURI } = params;
        if (!walletId)
          return NextResponse.json(
            { error: "walletId required" },
            { status: 400 },
          );

        const uri =
          metadataURI ||
          "ipfs://bafkreifbjevvqojxsrry7a24em6r3qoncnihhu2ztccju2ubwnmhe2wn7q";

        const result = await sendContractTx(
          walletId,
          IDENTITY_REGISTRY,
          "register(string)",
          [uri],
          "agent registration",
        );

        return NextResponse.json(result);
      }

      case "getAgentId": {
        const { walletAddress } = params;
        if (!walletAddress)
          return NextResponse.json(
            { error: "walletAddress required" },
            { status: 400 },
          );

        const latestBlock = await publicClient.getBlockNumber();
        const blockRange = 10000n;
        const fromBlock =
          latestBlock > blockRange ? latestBlock - blockRange : 0n;

        const transferLogs = await publicClient.getLogs({
          address: IDENTITY_REGISTRY,
          event: parseAbiItem(
            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
          ),
          args: { to: walletAddress as `0x${string}` },
          fromBlock,
          toBlock: latestBlock,
        });

        if (transferLogs.length === 0)
          return NextResponse.json(
            { error: "No agent found for this wallet address" },
            { status: 404 },
          );

        const agentId = transferLogs[transferLogs.length - 1].args.tokenId!;

        // Verify ownership and get metadata URI
        const identityContract = {
          address: IDENTITY_REGISTRY,
          abi: [
            {
              name: "ownerOf",
              type: "function",
              stateMutability: "view",
              inputs: [{ name: "tokenId", type: "uint256" }],
              outputs: [{ name: "", type: "address" }],
            },
            {
              name: "tokenURI",
              type: "function",
              stateMutability: "view",
              inputs: [{ name: "tokenId", type: "uint256" }],
              outputs: [{ name: "", type: "string" }],
            },
          ] as const,
          client: publicClient,
        };

        const owner = await publicClient.readContract({
          ...identityContract,
          functionName: "ownerOf",
          args: [agentId],
        });
        const tokenURI = await publicClient.readContract({
          ...identityContract,
          functionName: "tokenURI",
          args: [agentId],
        });

        return NextResponse.json({
          agentId: agentId.toString(),
          owner,
          metadataURI: tokenURI,
        });
      }

      // ── Reputation Registry ────────────────────────────────────

      case "recordReputation": {
        const { walletId, agentId, score, tag } = params;
        if (!walletId || !agentId)
          return NextResponse.json(
            { error: "walletId and agentId required" },
            { status: 400 },
          );

        const feedbackTag = tag || "execution";
        const feedbackHash = keccak256(toHex(feedbackTag));

        const result = await sendContractTx(
          walletId,
          REPUTATION_REGISTRY,
          "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)",
          [
            String(agentId),
            String(score ?? 100),
            "0",
              feedbackTag,
              feedbackTag,
              "",
              "",
            feedbackHash,
          ],
          "reputation recording",
        );

        return NextResponse.json({ ...result, tag: feedbackTag, score });
      }

      case "batchRecordReputation": {
        const { walletId, records } = params;
        // records: [{ agentId, score, tag }]
        if (!walletId || !Array.isArray(records) || records.length === 0)
          return NextResponse.json(
            { error: "walletId and records[] required" },
            { status: 400 },
          );

        const results: any[] = [];
        for (const record of records) {
          const feedbackTag = record.tag || "execution";
          const feedbackHash = keccak256(toHex(feedbackTag));
          const result = await sendContractTx(
            walletId,
            REPUTATION_REGISTRY,
            "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)",
            [
              String(record.agentId),
              String(record.score ?? 100),
              "0",
              feedbackTag,
              "",
              "",
              "",
              feedbackHash,
            ],
            `reputation for agent ${record.agentId}`,
          );
          results.push({
            ...result,
            agentId: record.agentId,
            tag: feedbackTag,
            score: record.score,
          });
        }

        return NextResponse.json({ count: results.length, results });
      }

      case "getAgentReputation": {
        const { agentId } = params;
        if (!agentId)
          return NextResponse.json(
            { error: "agentId required" },
            { status: 400 },
          );

        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock > 10000n ? latestBlock - 10000n : 0n;

        const logs = await publicClient.getLogs({
          address: REPUTATION_REGISTRY,
          event: parseAbiItem(
            "event NewFeedback(uint256 indexed agentId, address indexed clientAddress, uint64 feedbackIndex, int128 value, uint8 valueDecimals, string indexed indexedTag1, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)",
          ),
          args: { agentId: BigInt(agentId) },
          fromBlock,
          toBlock: latestBlock,
        });

        const reputation = logs.map((log) => ({
          agentId: log.args.agentId?.toString(),
          validator: log.args.clientAddress,
          score: log.args.value?.toString(),
          tag: log.args.tag1,
          txHash: log.transactionHash,
        }));

        const total = reputation.length;
        const totalScore = reputation.reduce(
          (sum, r) => sum + parseInt(r.score || "0"),
          0,
        );
        const avgScore = total > 0 ? Math.round(totalScore / total) : 0;

        return NextResponse.json({
          agentId,
          totalReviews: total,
          averageScore: avgScore,
          reviews: reputation,
        });
      }

      // ── Validation Registry ────────────────────────────────────

      case "requestValidation": {
        const { walletId, agentId, validatorWalletAddress } = params;
        if (!walletId || !agentId || !validatorWalletAddress)
          return NextResponse.json(
            { error: "walletId, agentId, and validatorWalletAddress required" },
            { status: 400 },
          );

        const requestURI =
          params.requestURI || "ipfs://bafkreiexamplevalidationrequest";
        const requestHash = keccak256(
          toHex(`validation_request_agent_${agentId}_${Date.now()}`),
        );

        const result = await sendContractTx(
          walletId,
          VALIDATION_REGISTRY,
          "validationRequest(address,uint256,string,bytes32)",
          [validatorWalletAddress, String(agentId), requestURI, requestHash],
          "validation request",
        );

        return NextResponse.json({ ...result, requestHash });
      }

      case "submitValidation": {
        const { walletId, requestHash, response, tag } = params;
        // response: "100" = passed, "0" = failed
        if (!walletId || !requestHash)
          return NextResponse.json(
            { error: "walletId and requestHash required" },
            { status: 400 },
          );

        const valResponse = String(response ?? "100");
        const valTag = tag || "execution_verified";
        const nullHash = `0x${"0".repeat(64)}`;

        const result = await sendContractTx(
          walletId,
          VALIDATION_REGISTRY,
          "validationResponse(bytes32,uint8,string,bytes32,string)",
          [requestHash, valResponse, "", nullHash, valTag],
          "validation response",
        );

        return NextResponse.json({
          ...result,
          response: valResponse,
          tag: valTag,
        });
      }

      case "getValidationStatus": {
        const { requestHash } = params;
        if (!requestHash)
          return NextResponse.json(
            { error: "requestHash required" },
            { status: 400 },
          );

        const status = await publicClient.readContract({
          address: VALIDATION_REGISTRY,
          abi: validationReadAbi,
          functionName: "getValidationStatus",
          args: [requestHash as `0x${string}`],
        });

        return NextResponse.json({
          validatorAddress: status[0],
          agentId: status[1].toString(),
          response: status[2],
          responseHash: status[3],
          tag: status[4],
          lastUpdate: status[5].toString(),
        });
      }

      case "recordExecutionResult": {
        const { steps } = params;
        // steps: [{ success: boolean, tag: string }]
        if (!Array.isArray(steps) || steps.length === 0)
          return NextResponse.json(
            { error: "steps[] required" },
            { status: 400 },
          );

        if (!ERC8004_AGENT_ID || !ERC8004_VALIDATOR_WALLET_ID) {
          return NextResponse.json({
            skipped: true,
            note: "ERC8004_AGENT_ID and ERC8004_VALIDATOR_WALLET_ID not configured",
          });
        }

        const records = steps.map((s: { success: boolean; tag?: string }) => ({
          agentId: ERC8004_AGENT_ID,
          score: s.success ? 100 : 0,
          tag: s.tag || "execution",
        }));

        const results: any[] = [];
        for (const record of records) {
          const feedbackTag = record.tag;
          const feedbackHash = keccak256(toHex(feedbackTag));
          const result = await sendContractTx(
            ERC8004_VALIDATOR_WALLET_ID,
            REPUTATION_REGISTRY,
            "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)",
            [
              String(record.agentId),
              String(record.score),
              "0",
              feedbackTag,
              "",
              "",
              "",
              feedbackHash,
            ],
            `reputation for step ${feedbackTag}`,
          );
          results.push({ ...result, score: record.score, tag: feedbackTag });
        }

        const totalScore = records.reduce(
          (sum: number, r: { score: number }) => sum + r.score,
          0,
        );
        const averageScore = totalScore / records.length;

        return NextResponse.json({
          count: results.length,
          averageScore,
          results,
        });
      }

      case "setupReputation": {
        // One-shot: create wallet set + 2 wallets, register agent, resolve agent ID
        const wsRes = await circleClient.createWalletSet({
          name: "ERC8004 Agent + Validator",
          idempotencyKey: crypto.randomUUID(),
        });
        const walletSetId = (wsRes as any).data?.walletSet?.id;
        if (!walletSetId)
          return NextResponse.json(
            { error: "No walletSetId returned" },
            { status: 500 },
          );

        const wRes = await circleClient.createWallets({
          walletSetId,
          blockchains: [BLOCKCHAIN],
          count: 2,
          accountType: "SCA",
          idempotencyKey: crypto.randomUUID(),
        });
        const wallets = (wRes as any).data?.wallets;
        if (!wallets?.length)
          return NextResponse.json(
            { error: "No wallets returned" },
            { status: 500 },
          );

        const ownerWallet = wallets[0];
        const validatorWallet = wallets[1];

        // Register agent using owner wallet
        const defaultURI =
          "ipfs://bafkreibdi6623n3xpf7ymk62ckb4bo75o3qemwkpfvp5i25j66itxvsoei";
        const txResult = await sendContractTx(
          ownerWallet.id,
          IDENTITY_REGISTRY,
          "register(string)",
          [defaultURI],
          "agent registration",
        );

        // Resolve agent ID from Transfer events
        const latestBlock = await publicClient.getBlockNumber();
        const blockRange = 10000n;
        const fromBlock =
          latestBlock > blockRange ? latestBlock - blockRange : 0n;

        const transferLogs = await publicClient.getLogs({
          address: IDENTITY_REGISTRY,
          event: parseAbiItem(
            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
          ),
          args: { to: ownerWallet.address as `0x${string}` },
          fromBlock,
          toBlock: latestBlock,
        });

        const agentId = transferLogs.length > 0
          ? transferLogs[transferLogs.length - 1].args.tokenId!.toString()
          : "unknown (check explorer)";

        return NextResponse.json({
          walletSetId,
          ownerWalletId: ownerWallet.id,
          validatorWalletId: validatorWallet.id,
          agentId,
          txHash: txResult.txHash,
          envConfig: `ERC8004_AGENT_ID=${agentId}\nERC8004_VALIDATOR_WALLET_ID=${validatorWallet.id}`,
        });
      }

      // ── Utility ────────────────────────────────────────────────

      case "debugEnv": {
        const pk = await circleClient
          .getPublicKey()
          .then((r) => (r.data as any)?.publicKey?.substring(0, 30))
          .catch(() => null);
        return NextResponse.json({
          apiKey: (API_KEY || "").substring(0, 30) + "...",
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
