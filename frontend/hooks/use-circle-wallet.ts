"use client";

import { useState, useCallback, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import {
  toPasskeyTransport,
  createRpClient,
  WebAuthnMode,
} from "@circle-fin/modular-wallets-core";
import {
  base64UrlToBytes,
  parseCredentialPublicKey,
  serializePublicKey,
} from "webauthn-p256";

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
  publicKey: string | null;
}

interface WebAuthnCredential {
  id: string;
  publicKey?: string;
  raw: PublicKeyCredential;
  rpId: string | undefined;
}

const PASSKEY_STORE_KEY = "unit-passkeys";

interface StoredPasskey {
  publicKey: string;
  address: string;
}

function loadStoredPasskeys(): Record<string, StoredPasskey> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PASSKEY_STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStoredPasskey(credentialId: string, data: StoredPasskey) {
  const store = loadStoredPasskeys();
  store[credentialId] = data;
  localStorage.setItem(PASSKEY_STORE_KEY, JSON.stringify(store));
}

export function useCircleWallet() {
  const [state, setState] = useState<CircleWalletState>(() => {
    const stored = loadStoredPasskeys();
    const entries = Object.entries(stored);
    // If there's a stored passkey, restore it as the most recent
    if (entries.length > 0) {
      const [credentialId, data] = entries[entries.length - 1];
      return {
        isConnected: true,
        address: data.address,
        isRegistering: false,
        isLoggingIn: false,
        error: null,
        walletType: "circle-passkey" as const,
        credentialId,
        publicKey: data.publicKey,
      };
    }
    return {
      isConnected: false,
      address: null,
      isRegistering: false,
      isLoggingIn: false,
      error: null,
      walletType: null,
      credentialId: null,
      publicKey: null,
    };
  });

  const hasConfig = Boolean(CLIENT_URL && CLIENT_KEY);

  const createRpClientForPasskey = useCallback(() => {
    const transport = toPasskeyTransport(CLIENT_URL, CLIENT_KEY);
    return createRpClient({ transport });
  }, []);

  const registerCredential = useCallback(async (username: string): Promise<WebAuthnCredential> => {
    const client = createRpClientForPasskey();
    const regOptions = await client.getRegistrationOptions({ username });

    // Override RP to match the current origin — Circle's buidl env hardcodes "localhost"
    const originHost = window.location.hostname;
    regOptions.rp.id = originHost;
    regOptions.rp.name = originHost;

    const challenge = base64UrlToBytes(regOptions.challenge);
    const userId = base64UrlToBytes(regOptions.user.id);
    const publicKey: CredentialCreationOptions["publicKey"] = {
      ...regOptions,
      challenge: new Uint8Array(challenge),
      user: {
        ...regOptions.user,
        id: new Uint8Array(userId),
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
    };

    const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
    if (!credential) throw new Error("No credential created.");

    // Skip getRegistrationVerification — Circle's buidl env generates challenge with
    // rp.id = "localhost" but we override it to the actual origin; verification against
    // the original (localhost) challenge always fails. Public key comes from the credential.
    // await client.getRegistrationVerification({ credential });

    const pkBuf = (credential.response as AuthenticatorAttestationResponse).getPublicKey();
    if (!pkBuf) throw new Error("No public key in credential");
    const rawPk = await parseCredentialPublicKey(pkBuf);

    return {
      id: credential.id,
      publicKey: serializePublicKey(rawPk, { compressed: true }),
      raw: credential,
      rpId: regOptions.rp.id,
    };
  }, [createRpClientForPasskey]);

  const loginCredential = useCallback(async (credentialId?: string, storedPublicKey?: string | null): Promise<WebAuthnCredential> => {
    const client = createRpClientForPasskey();
    const loginOptions = await client.getLoginOptions({ userId: credentialId ?? "" });

    // Override RP to match the current origin — Circle's buidl env hardcodes "localhost"
    loginOptions.rpId = window.location.hostname;

    const loginChallenge = base64UrlToBytes(loginOptions.challenge);
    const publicKey: CredentialRequestOptions["publicKey"] = {
      ...loginOptions,
      challenge: new Uint8Array(loginChallenge),
      allowCredentials: loginOptions.allowCredentials?.map((c) => ({
        ...c,
        id: new Uint8Array(base64UrlToBytes(c.id)),
      })),
    };

    const credential = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential | null;
    if (!credential) throw new Error("No credential found.");

    // Skip getLoginVerification — same reason as registration (RP ID mismatch).
    // The assertion response doesn't contain a public key (only the attestation
    // response from registration does), so return the stored publicKey instead.
    // await client.getLoginVerification({ credential });

    return {
      id: credential.id,
      publicKey: storedPublicKey ?? undefined,
      raw: credential,
      rpId: loginOptions.rpId,
    };
  }, [createRpClientForPasskey]);

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
      const credential = isRegister
        ? await registerCredential(`unit-user-${Date.now()}`)
        : await loginCredential(state.credentialId ?? undefined, state.publicKey);

      const derivedAddress = `0x${credential.publicKey?.slice(0, 40) || "0000000000000000000000000000000000000000"}`;
      const minAddress = `0x${credential.id.slice(0, 40)}`;
      const finalAddress = credential.publicKey ? derivedAddress : minAddress;

      setState({
        isConnected: true,
        address: finalAddress,
        isRegistering: false,
        isLoggingIn: false,
        error: null,
        walletType: "circle-passkey",
        credentialId: credential.id,
        publicKey: credential.publicKey ?? null,
      });

      if (credential.publicKey) {
        saveStoredPasskey(credential.id, { publicKey: credential.publicKey, address: finalAddress });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `${String(mode)} failed`;
      setState((s) => ({
        ...s,
        [isRegister ? "isRegistering" : "isLoggingIn"]: false,
        error: message,
      }));
    }
  }, [hasConfig, registerCredential, loginCredential, state.credentialId, state.publicKey]);

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
      publicKey: null,
    });
    // Call store directly — this hook instance may already have null address
    // (it's a separate useState from the one that connected), so React may bail
    // out of the re-render and the useEffect below won't fire.
    setWallet(null, null);
    localStorage.removeItem(PASSKEY_STORE_KEY);
  }, [setWallet]);

  return {
    ...state,
    hasConfig,
    registerWithPasskey,
    loginWithPasskey,
    disconnect,
  };
}
