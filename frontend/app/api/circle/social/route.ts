/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { encodeFunctionData } from "viem";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "createDeviceToken": {
        const { deviceId } = params;
        const idempotencyKey = crypto.randomUUID();
        const response = await fetch(
          "https://api.circle.com/v1/w3s/users/social/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
            },
            body: JSON.stringify({ idempotencyKey, deviceId }),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          return NextResponse.json(
            { error: data.message || "Circle API error" },
            { status: response.status },
          );
        }
        return NextResponse.json(data.data);
      }

      case "initializeUser": {
        const { userToken, blockchains } = params;
        const idempotencyKey = crypto.randomUUID();
        const response = await fetch(
          "https://api.circle.com/v1/w3s/user/initialize",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
            body: JSON.stringify({
              blockchains: blockchains || ["ARC-TESTNET"],
              accountType: "SCA",
              idempotencyKey,
            }),
          },
        );
        let data: any;
        try {
          data = await response.json();
        } catch {
          const text = await response.text();
          return NextResponse.json({ error: text }, { status: response.status });
        }
        if (!response.ok) {
          return NextResponse.json(
            { error: data.message || "Circle API error", code: data.code },
            { status: response.status },
          );
        }
        return NextResponse.json(data.data);
      }

      case "createWallet": {
        const { userToken, blockchains } = params;
        const idempotencyKey = crypto.randomUUID();
        const response = await fetch(
          "https://api.circle.com/v1/w3s/user/wallets",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
            body: JSON.stringify({
              blockchains: blockchains || ["ARC-TESTNET"],
              accountType: "SCA",
              idempotencyKey,
            }),
          },
        );
        let data: any;
        try {
          data = await response.json();
        } catch {
          const text = await response.text();
          return NextResponse.json({ error: text }, { status: response.status });
        }
        if (!response.ok) {
          return NextResponse.json(
            { error: data.message || "Circle API error", code: data.code },
            { status: response.status },
          );
        }
        return NextResponse.json(data.data);
      }

      case "listWallets": {
        const { userToken } = params;
        const response = await fetch(
          "https://api.circle.com/v1/w3s/wallets",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
          },
        );
        const data = await response.json();
        if (!response.ok) {
          return NextResponse.json(
            { error: data.message || "Circle API error" },
            { status: response.status },
          );
        }
        return NextResponse.json(data.data);
      }

      case "getTokenBalance": {
        const { walletId } = params;
        const response = await fetch(
          `https://api.circle.com/v1/w3s/wallets/${walletId}/balances`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
            },
          },
        );
        const data = await response.json();
        if (!response.ok) {
          return NextResponse.json(
            { error: data.message || "Circle API error" },
            { status: response.status },
          );
        }
        return NextResponse.json(data.data);
      }

      case "sendTransaction": {
        const { userToken, walletId, to, data: txData, contractInfo } = params;
        const idempotencyKey = crypto.randomUUID();

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

        const feePart: Record<string, unknown> = { feeLevel: "MEDIUM" };

        let body: Record<string, unknown>;
        if (contractInfo?.functionName && ABI_SIGNATURES[contractInfo.functionName]) {
          const fn = contractInfo.functionName as string;
          const order = ABI_PARAM_ORDER[fn] || [];
          const abiParams = order.map((key) => contractInfo.args?.[key] || "0");
          body = {
            walletId,
            contractAddress: to,
            abiFunctionSignature: ABI_SIGNATURES[fn],
            abiParameters: abiParams,
            ...feePart,
            idempotencyKey,
          };
        } else {
          body = {
            walletId,
            contractAddress: to,
            callData: txData || "0x",
            ...feePart,
            idempotencyKey,
          };
        }

        console.log("Circle contractExecution request:", JSON.stringify(body));
        const response = await fetch(
          "https://api.circle.com/v1/w3s/user/transactions/contractExecution",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
            body: JSON.stringify(body),
          },
        );
        let data: any;
        try {
          data = await response.json();
        } catch {
          const text = await response.text();
          console.error("Circle contractExecution parse error:", text);
          return NextResponse.json({ error: text }, { status: response.status });
        }
        console.log("Circle contractExecution response:", JSON.stringify(data));
        if (!response.ok) {
          return NextResponse.json(
            { error: data.message || "Circle API error", code: data.code },
            { status: response.status },
          );
        }
        return NextResponse.json(data.data);
      }

      case "sendBatchTransaction": {
        const { userToken, walletId, walletAddress, steps } = params;
        const idempotencyKey = crypto.randomUUID();

        // Pre-encode executeBatch call as callData so Circle passes raw bytes (no ABI parsing)
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

        const body = {
          walletId,
          contractAddress: walletAddress,
          callData,
          feeLevel: "MEDIUM",
          idempotencyKey,
        };

        console.log("Circle batch callData request:", JSON.stringify(body));
        const response = await fetch(
          "https://api.circle.com/v1/w3s/user/transactions/contractExecution",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
            body: JSON.stringify(body),
          },
        );
        let data: any;
        try {
          data = await response.json();
        } catch {
          const text = await response.text();
          console.error("Circle batch contractExecution parse error:", text);
          return NextResponse.json({ error: text }, { status: response.status });
        }
        console.log("Circle batch callData response:", JSON.stringify(data));
        if (!response.ok) {
          return NextResponse.json(
            { error: data.message || "Circle API error", code: data.code },
            { status: response.status },
          );
        }
        return NextResponse.json(data.data);
      }

      case "pollTransaction": {
        const { userToken, walletId } = params;
        const response = await fetch(
          `https://api.circle.com/v1/w3s/transactions?walletId=${walletId}&pageSize=10&sortBy=createDate&sortDirection=DESC`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
          },
        );
        const listData = await response.json();
        if (!response.ok) {
          return NextResponse.json(
            { error: listData.message || "Circle API error" },
            { status: response.status },
          );
        }
        return NextResponse.json(listData.data || {});
      }

      case "signTransaction": {
        const { userToken, walletId, transaction, memo } = params;
        const response = await fetch(
          "https://api.circle.com/v1/w3s/user/sign/transaction",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
            body: JSON.stringify({
              walletId,
              transaction: typeof transaction === "string" ? transaction : JSON.stringify(transaction),
              ...(memo ? { memo } : {}),
            }),
          },
        );
        let data: any;
        try {
          data = await response.json();
        } catch {
          const text = await response.text();
          return NextResponse.json({ error: text }, { status: response.status });
        }
        if (!response.ok) {
          return NextResponse.json(
            { error: data.message || "Circle API error", code: data.code },
            { status: response.status },
          );
        }
        return NextResponse.json(data.data);
      }

      case "broadcastTransaction": {
        const { signedTransaction, rpcUrl } = params;
        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_sendRawTransaction",
            params: [signedTransaction],
          }),
        });
        const rpcData = await response.json();
        if (rpcData.error) {
          return NextResponse.json({ error: rpcData.error.message || "RPC error" }, { status: 400 });
        }
        return NextResponse.json({ txHash: rpcData.result });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
