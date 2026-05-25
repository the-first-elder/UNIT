/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { encodeFunctionData } from "viem";

export const runtime = "edge";

const API_KEY = process.env.CIRCLE_API_KEY || "";
const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET || "";
const BASE = "https://api.circle.com/v1/w3s";

// Cache the Circle public key for entity secret encryption
let cachedPublicKey: { pem: string; expiresAt: number } | null = null;

// In-memory store for credentialId → walletId mapping.
// Survives across requests in the same dev server instance.
// On Vercel production, this resets on cold starts — swap for Vercel KV if needed.
const passkeyWalletStore = new Map<string, { walletId: string; address: string }>();

async function getCirclePublicKey(): Promise<string> {
  if (cachedPublicKey && Date.now() < cachedPublicKey.expiresAt) {
    return cachedPublicKey.pem;
  }
  const res = await fetch(`${BASE}/config/entity/publicKey`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to get Circle public key");
  const pem: string = json.data?.publicKey;
  if (!pem) throw new Error("No public key from Circle");
  cachedPublicKey = { pem, expiresAt: Date.now() + 3600_000 };
  return pem;
}

async function encryptEntitySecret(): Promise<string> {
  const pem = await getCirclePublicKey();
  const b64 = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "");
  const keyBuf = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const publicKey = await crypto.subtle.importKey(
    "spki",
    keyBuf,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
  const secretBytes = new Uint8Array(
    (ENTITY_SECRET.match(/.{1,2}/g) || []).map((b) => parseInt(b, 16)),
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    secretBytes,
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

async function circleFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Circle API error: ${res.status}`);
  return json;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "setupWallet": {
        // Create a wallet set + wallet for a passkey user.
        const wsRes: any = await circleFetch("POST", "/walletSets", {
          name: `UNIT-PASSKEY-${Date.now()}`,
        });
        const walletSetId: string = wsRes.data?.walletSet?.id;
        if (!walletSetId) return NextResponse.json({ error: "No walletSetId" }, { status: 500 });

        const wRes: any = await circleFetch("POST", "/wallets", {
          walletSetId,
          blockchains: ["ARC-TESTNET"],
          accountType: "SCA",
          count: 1,
          idempotencyKey: crypto.randomUUID(),
        });
        const wallet = wRes.data?.wallets?.[0];
        if (!wallet) return NextResponse.json({ error: "No wallet created" }, { status: 500 });

        // Store credentialId → wallet mapping if credentialId was provided
        if (params.credentialId) {
          passkeyWalletStore.set(params.credentialId, {
            walletId: wallet.id,
            address: wallet.address,
          });
        }

        return NextResponse.json({ walletId: wallet.id, address: wallet.address, walletSetId });
      }

      case "storePasskeyWallet": {
        const { credentialId, walletId: pWalletId, address: pAddress } = params;
        if (!credentialId || !pWalletId) {
          return NextResponse.json({ error: "credentialId and walletId required" }, { status: 400 });
        }
        passkeyWalletStore.set(credentialId, { walletId: pWalletId, address: pAddress || "" });
        return NextResponse.json({ stored: true });
      }

      case "getPasskeyWallet": {
        const { credentialId: lookupId } = params;
        if (!lookupId) {
          return NextResponse.json({ error: "credentialId required" }, { status: 400 });
        }
        const entry = passkeyWalletStore.get(lookupId);
        if (!entry) {
          return NextResponse.json({ found: false, walletId: null, address: null });
        }
        return NextResponse.json({ found: true, walletId: entry.walletId, address: entry.address });
      }

      case "createWalletSet": {
        const wsRes: any = await circleFetch("POST", "/walletSets", {
          name: params.name || `UNIT-PASSKEY-${Date.now()}`,
        });
        const walletSetId: string = wsRes.data?.walletSet?.id;
        if (!walletSetId) return NextResponse.json({ error: "No walletSetId" }, { status: 500 });
        return NextResponse.json({ walletSetId });
      }

      case "createWallet": {
        const { walletSetId } = params;
        if (!walletSetId) return NextResponse.json({ error: "walletSetId required" }, { status: 400 });
        const wRes: any = await circleFetch("POST", "/wallets", {
          walletSetId,
          blockchains: ["ARC-TESTNET"],
          accountType: "SCA",
          count: 1,
          idempotencyKey: crypto.randomUUID(),
        });
        const wallet = wRes.data?.wallets?.[0];
        if (!wallet) return NextResponse.json({ error: "No wallet created" }, { status: 500 });
        return NextResponse.json({ walletId: wallet.id, address: wallet.address });
      }

      case "sendTransaction": {
        const { walletId, to, data: txData, contractInfo } = params;
        const idempotencyKey = crypto.randomUUID();
        const entitySecretCiphertext = await encryptEntitySecret();

        const ABI_SIGNATURES: Record<string, string> = {
          approve: "approve(address,uint256)",
          deposit: "deposit(uint256,address)",
          supply: "supply(address,uint256,address,uint16)",
          mint: "mint(uint256)",
          transfer: "transfer(address,uint256)",
        };
        const ABI_PARAM_ORDER: Record<string, string[]> = {
          approve: ["spender", "amount"],
          deposit: ["assets", "receiver"],
          supply: ["asset", "amount", "onBehalfOf", "referralCode"],
          mint: ["mintAmount"],
          transfer: ["to", "amount"],
        };

        let reqBody: Record<string, unknown>;
        if (contractInfo?.functionName && ABI_SIGNATURES[contractInfo.functionName]) {
          const fn = contractInfo.functionName as string;
          const order = ABI_PARAM_ORDER[fn] || [];
          const abiParams = order.map((key) => contractInfo.args?.[key] || "0");
          reqBody = {
            walletId,
            contractAddress: to,
            abiFunctionSignature: ABI_SIGNATURES[fn],
            abiParameters: abiParams,
            feeLevel: "MEDIUM",
            entitySecretCiphertext,
            idempotencyKey,
          };
        } else {
          reqBody = {
            walletId,
            contractAddress: to,
            callData: txData || "0x",
            feeLevel: "MEDIUM",
            entitySecretCiphertext,
            idempotencyKey,
          };
        }

        const data: any = await circleFetch("POST", "/developer/transactions/contractExecution", reqBody);
        return NextResponse.json(data.data);
      }

      case "sendBatchTransaction": {
        const { walletId, walletAddress, steps } = params;
        const idempotencyKey = crypto.randomUUID();
        const entitySecretCiphertext = await encryptEntitySecret();

        const batchAbi = [{
          type: "function" as const,
          name: "executeBatch",
          inputs: [{
            type: "tuple[]" as const,
            components: [
              { type: "address" as const, name: "target" },
              { type: "uint256" as const, name: "value" },
              { type: "bytes" as const, name: "data" },
            ],
          }],
        }] as const;

        const tuples = (steps as { to: string; data: string; value?: string }[]).map(
          (s) => [s.to as `0x${string}`, BigInt(s.value || "0"), (s.data || "0x") as `0x${string}`] as const,
        );

        const callData = encodeFunctionData({
          abi: batchAbi,
          functionName: "executeBatch",
          args: [tuples],
        });

        const data: any = await circleFetch("POST", "/developer/transactions/contractExecution", {
          walletId,
          contractAddress: walletAddress,
          callData,
          feeLevel: "MEDIUM",
          entitySecretCiphertext,
          idempotencyKey,
        });
        return NextResponse.json(data.data);
      }

      case "pollTransaction": {
        const { walletId } = params;
        const data: any = await circleFetch(
          "GET",
          `/transactions?walletId=${walletId}&pageSize=10&sortBy=createDate&sortDirection=DESC`,
        );
        return NextResponse.json(data.data || {});
      }

      case "getTokenBalance": {
        const { walletId } = params;
        const data: any = await circleFetch("GET", `/wallets/${walletId}/balances`);
        return NextResponse.json(data.data);
      }

      case "getWallet": {
        const { walletId } = params;
        if (!walletId) return NextResponse.json({ error: "walletId required" }, { status: 400 });
        const data: any = await circleFetch("GET", `/wallets/${walletId}`);
        const wallet = data.data?.wallet;
        if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        return NextResponse.json({ walletId: wallet.id, address: wallet.address, blockchain: wallet.blockchain });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
