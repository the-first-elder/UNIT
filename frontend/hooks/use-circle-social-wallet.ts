"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { setCookie, getCookie } from "cookies-next";
import type { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";
import { useAppStore } from "@/lib/store";
import { CHAIN_ID_TO_BLOCKCHAIN, CHAIN_ID_TO_RPC } from "@/lib/circle";

const APP_ID = process.env.NEXT_PUBLIC_CIRCLE_APP_ID || "";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

type LoginResult = {
  userToken: string;
  encryptionKey: string;
};

type Wallet = {
  id: string;
  address: string;
  blockchain: string;
};

export function useCircleSocialWallet() {
  const sdkRef = useRef<W3SSdk | null>(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [hasDeviceToken, setHasDeviceToken] = useState(false);
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready");

  const activeChain = useAppStore((s) => s.activeChain);
  const currentBlockchain = CHAIN_ID_TO_BLOCKCHAIN[activeChain.id] || "ARC-TESTNET";
  const hasConfig = Boolean(APP_ID && GOOGLE_CLIENT_ID);

  const loadWalletsFn = useCallback(async (userToken: string) => {
    setStatus("Loading wallet details...");
    setLoginError(null);

    try {
      const res = await fetch("/api/circle/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "listWallets", userToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      const walletList = (data.wallets || []).map((w: any) => ({
        id: w.id,
        address: w.address,
        blockchain: w.blockchain,
      }));

      setWallets(walletList);

      if (walletList.length > 0) {
        setStatus("Connected");
        try {
          const balRes = await fetch("/api/circle/social", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "getTokenBalance", userToken, walletId: walletList[0].id }),
          });
          const balData = await balRes.json();
          if (balRes.ok) {
            const usdc = (balData.tokenBalances || []).find((t: any) => {
              const sym = t.token?.symbol || "";
              const name = t.token?.name || "";
              return sym.startsWith("USDC") || name.includes("USDC");
            });
            setUsdcBalance(usdc?.amount || "0");
          }
        } catch {}
      } else {
        setStatus("No wallets found");
      }
    } catch (err: any) {
      setLoginError(err.message);
      setStatus("Failed to load wallets");
    }
  }, []);

  // Strip stale OAuth hash if no device token is available to process it
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const dt = typeof document !== "undefined" ? getCookie("deviceToken") : null;
      if (!dt) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);

  useEffect(() => {
    if (!hasConfig) return;
    let cancelled = false;

    const init = async () => {
      try {
        const { W3SSdk } = await import("@circle-fin/w3s-pw-web-sdk");

        const onLoginComplete = (err: any, result: any) => {
          if (cancelled) return;

          // Always strip the OAuth hash after processing (success or failure)
          if (typeof window !== "undefined" && window.location.hash) {
            history.replaceState(null, "", window.location.pathname + window.location.search);
          }

          if (err) {
            const msg = err.message || "Login failed";
            setLoginError(msg);
            setStatus("Login failed");
            if (msg.toLowerCase().includes("device token")) {
              setHasDeviceToken(false);
              setCookie("deviceToken", "");
              setCookie("deviceEncryptionKey", "");
            }
            return;
          }

          const ut = result.userToken;
          const ek = result.encryptionKey;

          // Persist login credentials to cookies so they survive page refresh
          setCookie("socialUserToken", ut);
          setCookie("socialEncryptionKey", ek);

          setLoginResult({ userToken: ut, encryptionKey: ek });
          setLoginError(null);
          setStatus("Login successful. Ready to initialize.");

          // Try to restore wallets immediately if user was already initialized
          loadWalletsFn(ut).catch(() => {});
        };

        const restoredDeviceToken = (getCookie("deviceToken") as string) || "";
        const restoredEncryptionKey =
          (getCookie("deviceEncryptionKey") as string) || "";
        const restoredGoogleClientId =
          (getCookie("google.clientId") as string) || GOOGLE_CLIENT_ID;

        const sdk = new W3SSdk(
          {
            appSettings: { appId: APP_ID },
            loginConfigs: {
              deviceToken: restoredDeviceToken,
              deviceEncryptionKey: restoredEncryptionKey,
              google: {
                clientId: restoredGoogleClientId,
                redirectUri: `${window.location.origin}/app`,
                selectAccountPrompt: true,
              },
            },
          },
          onLoginComplete,
        );

        sdkRef.current = sdk;
        setSdkReady(true);
        setHasDeviceToken(Boolean(restoredDeviceToken));

        // Restore persisted login from cookies
        const savedUserToken = getCookie("socialUserToken") as string;
        const savedEncryptionKey = getCookie("socialEncryptionKey") as string;
        if (savedUserToken && savedEncryptionKey) {
          setLoginResult({ userToken: savedUserToken, encryptionKey: savedEncryptionKey });
          setStatus("Restored session. Loading wallet...");
          loadWalletsFn(savedUserToken).catch(() => {
            // If restore fails (e.g. token expired), clear cookies
            setCookie("socialUserToken", "");
            setCookie("socialEncryptionKey", "");
            setLoginResult(null);
            setStatus("Session expired. Sign in again.");
          });
        } else {
          setStatus(
            restoredDeviceToken
              ? "SDK ready. Ready to sign in."
              : "SDK ready. Create device token to begin.",
          );
        }
      } catch (err: any) {
        if (!cancelled) {
          setStatus("SDK init failed");
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [hasConfig, loadWalletsFn]);

  const createDeviceToken = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk || !sdkReady) return;

    setStatus("Creating device token...");
    setLoginError(null);

    try {
      const deviceId = await sdk.getDeviceId();
      if (typeof window !== "undefined") {
        window.localStorage.setItem("deviceId", deviceId);
      }

      const res = await fetch("/api/circle/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createDeviceToken", deviceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setCookie("deviceToken", data.deviceToken);
      setCookie("deviceEncryptionKey", data.deviceEncryptionKey);
      setHasDeviceToken(true);
      setStatus("Device token created. Ready to sign in.");
    } catch (err: any) {
      setLoginError(err.message);
      setStatus("Device token failed");
    }
  }, [sdkReady]);

  const loginWithGoogle = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk || !hasDeviceToken) return;

    const dt = getCookie("deviceToken") as string;
    const dk = getCookie("deviceEncryptionKey") as string;
    if (!dt || !dk) {
      setStatus("Missing device token. Create one first.");
      return;
    }

    setCookie("appId", APP_ID);
    setCookie("google.clientId", GOOGLE_CLIENT_ID);
    setCookie("deviceToken", dt);
    setCookie("deviceEncryptionKey", dk);

    sdk.updateConfigs({
      appSettings: { appId: APP_ID },
      loginConfigs: {
        deviceToken: dt,
        deviceEncryptionKey: dk,
        google: {
          clientId: GOOGLE_CLIENT_ID,
          redirectUri: `${window.location.origin}/app`,
          selectAccountPrompt: true,
        },
      },
    });

    setStatus("Redirecting to Google...");
    try {
      sdk.performLogin(SocialLoginProvider.GOOGLE);
    } catch (e: any) {
      setLoginError(e?.message || "performLogin failed");
      setStatus("Google sign-in failed");
    }
  }, [hasDeviceToken]);

  const initializeUser = useCallback(async () => {
    if (!loginResult?.userToken) {
      setStatus("Sign in with Google first.");
      return;
    }

    setStatus("Initializing user...");
    setLoginError(null);

    try {
      const chain = useAppStore.getState().activeChain;
      const blockchain = CHAIN_ID_TO_BLOCKCHAIN[chain.id] || "ARC-TESTNET";
      const res = await fetch("/api/circle/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "initializeUser", userToken: loginResult.userToken, blockchains: [blockchain] }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 155106) {
          setStatus("User already initialized. Loading wallet...");
          await loadWalletsFn(loginResult.userToken);
          return;
        }
        const msg = data.code ? `[${data.code}] ${data.error || data.message}` : (data.error || data.message || "Failed");
        throw new Error(msg);
      }

      setChallengeId(data.challengeId ?? null);
      setStatus("User initialized. Execute challenge to create wallet.");
    } catch (err: any) {
      if (err?.code === 155106 && loginResult?.userToken) {
        setStatus("User already initialized. Loading wallet...");
        await loadWalletsFn(loginResult.userToken);
        return;
      }
      setLoginError(err.message);
      setStatus("Initialization failed");
    }
  }, [loginResult, loadWalletsFn]);

  const executeChallenge = useCallback(() => {
    const sdk = sdkRef.current;
    if (!sdk || !challengeId || !loginResult?.userToken || !loginResult?.encryptionKey) {
      setStatus("Missing credentials for challenge.");
      return;
    }

    sdk.setAuthentication({
      userToken: loginResult.userToken,
      encryptionKey: loginResult.encryptionKey,
    });

    setStatus("Executing challenge...");

    sdk.execute(challengeId, (error: any) => {
      if (error) {
        setLoginError(error.message || "Challenge failed");
        setStatus("Challenge failed");
        return;
      }

      setStatus("Wallet created! Loading details...");
      setChallengeId(null);

      setTimeout(async () => {
        if (loginResult?.userToken) {
          await loadWalletsFn(loginResult.userToken);
        }
      }, 2000);
    });
  }, [challengeId, loginResult, loadWalletsFn]);

  const createBatchTransactionChallenge = useCallback(async (
    steps: { to: string; data: string; value?: string }[],
    walletId: string,
    walletAddress: string,
  ): Promise<string> => {
    if (!loginResult?.userToken) throw new Error("Wallet not connected");

    const res = await fetch("/api/circle/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendBatchTransaction",
        userToken: loginResult.userToken,
        walletId,
        walletAddress,
        steps,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.code ? `[${data.code}] ${data.error || data.message}` : (data.error || data.message || "Failed");
      throw new Error(msg);
    }
    if (!data.challengeId) throw new Error("No challengeId returned");
    return data.challengeId;
  }, [loginResult]);

  const createTransactionChallenge = useCallback(async (
    stepTx: { to: string; data: string; value?: string },
    walletId: string,
    walletAddress: string,
    contractInfo?: { functionName: string; args: Record<string, string | undefined> },
    gasParams?: { gasLimit: string; maxFee: string; priorityFee: string },
  ): Promise<string> => {
    if (!loginResult?.userToken) throw new Error("Wallet not connected");

    const res = await fetch("/api/circle/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendTransaction",
        userToken: loginResult.userToken,
        walletId,
        walletAddress,
        to: stepTx.to,
        data: stepTx.data,
        value: stepTx.value || "0",
        contractInfo,
        ...gasParams,
      }),
    });
    console.log("createTransactionChallenge request body:", JSON.stringify({
      walletId,
      walletAddress,
      to: stepTx.to,
      data: stepTx.data?.slice(0, 66),
      value: stepTx.value || "0",
      contractInfo,
      gasParams,
    }, null, 2));
    const data = await res.json();
    if (!res.ok) {
      const msg = data.code ? `[${data.code}] ${data.error || data.message}` : (data.error || data.message || "Failed");
      throw new Error(msg);
    }
    if (!data.challengeId) throw new Error("No challengeId returned");
    return data.challengeId;
  }, [loginResult]);

  const executeChallengeById = useCallback((challengeId: string, walletId?: string, walletAddress?: string, expectedTo?: string): Promise<string | null> => {
    const sdk = sdkRef.current;
    if (!sdk || !loginResult?.userToken || !loginResult?.encryptionKey) {
      return Promise.reject(new Error("Wallet not connected"));
    }

    sdk.setAuthentication({
      userToken: loginResult.userToken,
      encryptionKey: loginResult.encryptionKey,
    });

    return new Promise<string | null>((resolve, reject) => {
      sdk.execute(challengeId, (error: any, result: any) => {
        if (error) {
          reject(new Error(error.message || "Transaction execution failed"));
          return;
        }
        const txHash = result?.data?.txHash || result?.data?.transactionHash;
        if (txHash && /^0x[a-fA-F0-9]+$/.test(txHash)) {
          resolve(txHash);
          return;
        }
        if (!walletId) {
          resolve(null);
          return;
        }
        // Poll Circle API for the real txHash and check transaction state
        const poll = async (attempts = 0): Promise<void> => {
          try {
            const res = await fetch("/api/circle/social", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "pollTransaction",
                userToken: loginResult!.userToken,
                walletId,
              }),
            });
            const data = await res.json();
            const txs: any[] = data?.transactions || [];
            const mined = txs.find((t: any) => t.state === "MINED" && /^0x[a-fA-F0-9]+$/.test(t.txHash));
            if (mined) { resolve(mined.txHash); return; }
            const failed = txs.find((t: any) => t.state === "FAILED");
            if (failed) {
              const reason = failed.errorReason || "";
              // ESTIMATION_ERROR is misleading — the userOp often lands on-chain anyway.
              // Don't reject; keep polling in case it eventually confirms.
              if (reason === "ESTIMATION_ERROR") {
                console.warn("Circle ESTIMATION_ERROR — transaction may still go through, continuing to poll...");
              } else {
                console.error("Circle FAILED transaction:", JSON.stringify(failed, null, 2));
                const details = failed.errorDetails ? ` — ${failed.errorDetails}` : "";
                reject(new Error(`Transaction failed: ${reason}${details}`));
                return;
              }
            }
          } catch (e) {
            reject(e instanceof Error ? e : new Error("Transaction failed"));
            return;
          }
          // After ~30s with no MINED, check explorer for the actual on-chain tx
          if (attempts === 15 && walletAddress && expectedTo) {
            const chain = useAppStore.getState().activeChain;
            const explorerApi =
              String(chain.id) === "5042002"
                ? "https://testnet.arcscan.app/api/v2"
                : undefined;
            if (explorerApi) {
              try {
                const res = await fetch(`${explorerApi}/addresses/${walletAddress}/internal-transactions`);
                const body = await res.json();
                const items: any[] = body?.items || [];
                const expectedToLower = expectedTo.toLowerCase();
                const match = items.find(
                  (t: any) =>
                    t.success === true &&
                    t.type === "call" &&
                    (t.to?.hash || "").toLowerCase() === expectedToLower &&
                    /^0x[a-fA-F0-9]+$/.test(t.transaction_hash || ""),
                );
                if (match?.transaction_hash) {
                  console.log(`Found on-chain tx to ${expectedTo}: ${match.transaction_hash}`);
                  resolve(match.transaction_hash);
                  return;
                }
              } catch {}
            }
          }
          if (attempts < 60) {
            await new Promise((r) => setTimeout(r, 2000));
            return poll(attempts + 1);
          }
          resolve(null);
        };
        poll();
      });
    });
  }, [loginResult]);

  const executeTransaction = useCallback(async (
    stepTx: { to: string; data: string; value?: string },
    walletId: string,
    walletAddress: string,
    contractInfo?: { functionName: string; args: Record<string, string | undefined> },
    gasParams?: { gasLimit: string; maxFee: string; priorityFee: string },
  ): Promise<string | null> => {
    setStatus("Creating transaction challenge...");
    setLoginError(null);
    try {
      let gp = gasParams;
      if (!gp) {
        // Query RPC for gas params to bypass Circle's gas estimation
        try {
          const chain = useAppStore.getState().activeChain;
          const rpcUrl = CHAIN_ID_TO_RPC[chain.id];
          if (rpcUrl) {
            const rpcCall = (method: string, p: any[]) =>
              fetch(rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: p }),
              }).then((r) => r.json());
            const [gasPriceRes, feeRes] = await Promise.all([
              rpcCall("eth_gasPrice", []),
              rpcCall("eth_maxPriorityFeePerGas", []),
            ]);
            const baseFee = parseInt(gasPriceRes.result || "0x0", 16);
            const priorityFeeWei = parseInt(feeRes.result || "0x989680", 16);
            // Convert wei to gwei (Circle API expects gwei)
            const toGwei = (w: number) => (w / 1e9).toFixed(9);
            const gas = contractInfo?.functionName === "approve" ? "60000" : "500000";
            gp = {
              gasLimit: gas,
              maxFee: toGwei(Math.max(baseFee, baseFee + priorityFeeWei)),
              priorityFee: toGwei(priorityFeeWei),
            };
          }
        } catch {}
      }
      const cId = await createTransactionChallenge(stepTx, walletId, walletAddress, contractInfo, gp);
      setStatus("Executing transaction...");
      const txHash = await executeChallengeById(cId, walletId, walletAddress, stepTx.to);
      if (txHash) {
        setStatus("Transaction confirmed");
      } else {
        setStatus("Transaction submitted — waiting for on-chain confirmation");
      }
      return txHash;
    } catch (err: any) {
      setLoginError(err.message);
      setStatus("Transaction failed");
      throw err;
    }
  }, [createTransactionChallenge, executeChallengeById]);

  const signAndBroadcastTransaction = useCallback(async (
    stepTx: { to: string; data: string; value?: string },
    walletId: string,
    walletAddress: string,
  ): Promise<string | null> => {
    if (!loginResult?.userToken) throw new Error("Wallet not connected");
    setStatus("Preparing transaction...");
    setLoginError(null);
    try {
      const chain = useAppStore.getState().activeChain;
      const chainId = parseInt(chain.id, 10);
      const rpcUrl = CHAIN_ID_TO_RPC[chain.id];
      if (!rpcUrl) throw new Error(`No RPC URL for chain ${chain.id}`);

      // 1. Get nonce and gas price from RPC
      const rpcPayload = (method: string, params: any[]) =>
        fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        }).then((r) => r.json());

      const [nonceRes, gasPriceRes, feeRes] = await Promise.all([
        rpcPayload("eth_getTransactionCount", [walletAddress, "latest"]),
        rpcPayload("eth_gasPrice", []),
        rpcPayload("eth_maxPriorityFeePerGas", []),
      ]);

      const nonce = parseInt(nonceRes.result || "0x0", 16);
      const baseFee = parseInt(gasPriceRes.result || "0x0", 16);
      const priorityFee = parseInt(feeRes.result || "0x989680", 16);
      const maxFeePerGas = Math.max(baseFee, baseFee + priorityFee);

      const txObj = JSON.stringify({
        nonce,
        to: stepTx.to,
        value: stepTx.value || "0",
        data: stepTx.data || "0x",
        gas: "300000",
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: priorityFee.toString(),
        chainId,
      });

      // 2. Create signing challenge
      const res = await fetch("/api/circle/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signTransaction",
          userToken: loginResult.userToken,
          walletId,
          transaction: txObj,
          memo: "Sign transaction",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create signing challenge");
      const challengeId: string = data.challengeId;
      if (!challengeId) throw new Error("No challengeId returned");

      // 3. Execute challenge via SDK (user approves via PIN/biometric)
      setStatus("Waiting for approval...");
      const signedTx = await new Promise<string>((resolve, reject) => {
        const sdk = sdkRef.current;
        if (!sdk) { reject(new Error("SDK not ready")); return; }
        sdk.setAuthentication({
          userToken: loginResult!.userToken,
          encryptionKey: loginResult!.encryptionKey,
        });
        sdk.execute(challengeId, (error: any, result: any) => {
          if (error) { reject(new Error(error.message || "Signing failed")); return; }
          const stx = result?.data?.signedTransaction || result?.data?.signed_tx || result?.data?.rawTransaction;
          if (stx) { resolve(stx); return; }
          reject(new Error("No signed transaction in result"));
        });
      });

      // 4. Broadcast signed transaction to RPC
      setStatus("Broadcasting transaction...");
      const broadcastRes = await fetch("/api/circle/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcastTransaction",
          signedTransaction: signedTx,
          rpcUrl,
        }),
      });
      const broadcastData = await broadcastRes.json();
      if (!broadcastRes.ok) throw new Error(broadcastData.error || "Broadcast failed");
      const txHash = broadcastData.txHash;
      if (txHash && /^0x[a-fA-F0-9]+$/.test(txHash)) {
        setStatus("Transaction confirmed");
        return txHash;
      }
      setStatus("Transaction broadcast — awaiting confirmation");
      return null;
    } catch (err: any) {
      setLoginError(err.message);
      setStatus("Transaction signing failed");
      throw err;
    }
  }, [loginResult]);

  const clearAllState = useCallback(() => {
    setLoginResult(null);
    setChallengeId(null);
    setWallets([]);
    setUsdcBalance(null);
    setLoginError(null);
    setHasDeviceToken(false);
    setStatus("Ready");
    setCookie("deviceToken", "");
    setCookie("deviceEncryptionKey", "");
    setCookie("google.clientId", "");
    setCookie("socialUserToken", "");
    setCookie("socialEncryptionKey", "");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("deviceId");
    }
  }, []);

  const disconnect = useCallback(() => {
    clearAllState();
  }, [clearAllState]);

  const walletForChain = wallets.find((w) => w.blockchain === currentBlockchain) || wallets[0];
  const isConnected = wallets.length > 0 && Boolean(loginResult) && Boolean(walletForChain);
  const address = walletForChain?.address ?? null;
  const walletId = walletForChain?.id ?? null;
  const setWallet = useAppStore((s) => s.setWallet);

  useEffect(() => {
    setWallet(address, address ? "social" : null);
  }, [address, setWallet]);

  return {
    isConnected,
    address,
    walletId,
    wallets,
    usdcBalance,
    loginResult,
    loginError,
    challengeId,
    sdkReady,
    hasDeviceToken,
    status,
    hasConfig,
    createDeviceToken,
    loginWithGoogle,
    initializeUser,
    executeChallenge,
    executeTransaction,
    signAndBroadcastTransaction,
    createTransactionChallenge,
    createBatchTransactionChallenge,
    executeChallengeById,
    clearAllState,
    disconnect,
  };
}
