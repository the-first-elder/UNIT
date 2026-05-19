"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { setCookie, getCookie } from "cookies-next";
import type { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";
import { useAppStore } from "@/lib/store";

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
      const res = await fetch("/api/circle/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "initializeUser", userToken: loginResult.userToken }),
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

  const createTransactionChallenge = useCallback(async (
    stepTx: { to: string; data: string; value?: string },
    walletId: string,
    walletAddress: string,
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

  const executeChallengeById = useCallback((challengeId: string): Promise<string> => {
    const sdk = sdkRef.current;
    if (!sdk || !loginResult?.userToken || !loginResult?.encryptionKey) {
      return Promise.reject(new Error("Wallet not connected"));
    }

    sdk.setAuthentication({
      userToken: loginResult.userToken,
      encryptionKey: loginResult.encryptionKey,
    });

    return new Promise<string>((resolve, reject) => {
      sdk.execute(challengeId, (error: any, result: any) => {
        if (error) {
          reject(new Error(error.message || "Transaction execution failed"));
          return;
        }
        const txHash = result?.data?.txHash || result?.data?.transactionHash || challengeId;
        resolve(txHash);
      });
    });
  }, [loginResult]);

  const executeTransaction = useCallback(async (
    stepTx: { to: string; data: string; value?: string },
    walletId: string,
    walletAddress: string,
  ): Promise<string> => {
    setStatus("Creating transaction challenge...");
    setLoginError(null);
    try {
      const cId = await createTransactionChallenge(stepTx, walletId, walletAddress);
      setStatus("Executing transaction...");
      const txHash = await executeChallengeById(cId);
      setStatus("Transaction confirmed");
      return txHash;
    } catch (err: any) {
      setLoginError(err.message);
      setStatus("Transaction failed");
      throw err;
    }
  }, [createTransactionChallenge, executeChallengeById]);

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

  const isConnected = wallets.length > 0 && Boolean(loginResult);
  const address = wallets[0]?.address ?? null;
  const setWallet = useAppStore((s) => s.setWallet);

  useEffect(() => {
    setWallet(address, address ? "social" : null);
  }, [address, setWallet]);

  return {
    isConnected,
    address,
    walletId: wallets[0]?.id ?? null,
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
    createTransactionChallenge,
    executeChallengeById,
    clearAllState,
    disconnect,
  };
}
