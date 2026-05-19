import { NextResponse } from "next/server";

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
        const { userToken } = params;
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
              blockchains: ["ARC-TESTNET"],
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
        const { userToken } = params;
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
              blockchains: ["ARC-TESTNET"],
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
        const { userToken, walletId } = params;
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
        const { userToken, walletId, walletAddress, to, data: txData, value } = params;
        const idempotencyKey = crypto.randomUUID();
        // The SCA wallet's execute(address,uint256,bytes) wraps the raw call
        const response = await fetch(
          "https://api.circle.com/v1/w3s/user/transactions/contractExecution",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
            body: JSON.stringify({
              walletId,
              contractAddress: walletAddress,
              abiFunctionSignature: "execute(address,uint256,bytes)",
              abiParameters: [to, value || "0", txData || "0x"],
              amount: "0",
              fee: { type: "level", level: "MEDIUM" },
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

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
