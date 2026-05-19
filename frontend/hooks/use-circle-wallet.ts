"use client";

import { useState, useCallback, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import {
  toPasskeyTransport,
  toWebAuthnCredential,
  WebAuthnMode,
} from "@circle-fin/modular-wallets-core";

const CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL || "";
const CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || "";

export type WalletType = "eoa" | "circle-passkey";

interface CircleWalletState {
  isConnected: boolean;
  address: string | null;
  isRegistering: boolean;
  isLoggingIn: boolean;
  error: string | null;
  walletType: WalletType | null;
  credentialId: string | null;
}

export function useCircleWallet() {
  const [state, setState] = useState<CircleWalletState>({
    isConnected: false,
    address: null,
    isRegistering: false,
    isLoggingIn: false,
    error: null,
    walletType: null,
    credentialId: null,
  });

  const hasConfig = Boolean(CLIENT_URL && CLIENT_KEY);

  const connectPasskey = useCallback(async (mode: WebAuthnMode) => {
    if (!hasConfig) {
      setState((s) => ({ ...s, error: "Circle client not configured" }));
      return;
    }

    const isRegister = mode === WebAuthnMode.Register;
    setState((s) => ({
      ...s,
      [isRegister ? "isRegistering" : "isLoggingIn"]: true,
      error: null,
    }));

    try {
      const transport = toPasskeyTransport(CLIENT_URL, CLIENT_KEY);
      
      const credential = await toWebAuthnCredential({
        mode,
        transport,
        ...(isRegister ? { username: `unit-user-${Date.now()}` } : {}),
      });

      const address = `0x${credential.publicKey?.slice(0, 40) || "0000000000000000000000000000000000000000"}`;
      const minAddress = `0x${credential.id.slice(0, 40)}`;

      setState({
        isConnected: true,
        address: credential.publicKey ? address : minAddress,
        isRegistering: false,
        isLoggingIn: false,
        error: null,
        walletType: "circle-passkey",
        credentialId: credential.id,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `${String(mode)} failed`;
      setState((s) => ({
        ...s,
        [isRegister ? "isRegistering" : "isLoggingIn"]: false,
        error: message,
      }));
    }
  }, [hasConfig]);

  const registerWithPasskey = useCallback(
    () => connectPasskey(WebAuthnMode.Register),
    [connectPasskey]
  );

  const loginWithPasskey = useCallback(
    () => connectPasskey(WebAuthnMode.Login),
    [connectPasskey]
  );

  const setWallet = useAppStore((s) => s.setWallet);

  useEffect(() => {
    setWallet(state.address, state.address ? "passkey" : null);
  }, [state.address, setWallet]);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      isRegistering: false,
      isLoggingIn: false,
      error: null,
      walletType: null,
      credentialId: null,
    });
  }, []);

  return {
    ...state,
    hasConfig,
    registerWithPasskey,
    loginWithPasskey,
    disconnect,
  };
}
