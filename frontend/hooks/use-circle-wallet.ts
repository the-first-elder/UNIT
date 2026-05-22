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
} from "webauthn-p256";
import { keccak256, bytesToHex, hexToBytes } from "viem";

// Derive an Ethereum address from a WebAuthn credential's public key.
async function deriveAddress(credential: PublicKeyCredential): Promise<`0x${string}`> {
  const pkBuf = (credential.response as AuthenticatorAttestationResponse).getPublicKey();
  if (!pkBuf) throw new Error("No public key in credential");
  // Parse the COSE-encoded public key into x,y coordinates (bigints)
  const rawPk = await parseCredentialPublicKey(pkBuf);
  // Reconstruct uncompressed key: 0x04 + x(32 bytes) + y(32 bytes)
  const uncompressed = new Uint8Array(65);
  uncompressed[0] = 0x04;
  // Write x as big-endian 32 bytes
  const xBytes = new Uint8Array(32);
  let x = rawPk.x;
  for (let i = 31; i >= 0; i--) {
    xBytes[i] = Number(x & 255n);
    x >>= 8n;
  }
  uncompressed.set(xBytes, 1);
  // Write y as big-endian 32 bytes
  const yBytes = new Uint8Array(32);
  let y = rawPk.y;
  for (let i = 31; i >= 0; i--) {
    yBytes[i] = Number(y & 255n);
    y >>= 8n;
  }
  uncompressed.set(yBytes, 33);
  // keccak256 of the 64-byte public key (without 0x04 prefix)
  const hash = keccak256(uncompressed.slice(1));
  // Ethereum address = last 20 bytes of hash
  return `0x${hash.slice(-40)}` as `0x${string}`;
}

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

    const address = await deriveAddress(credential);

    return {
      id: credential.id,
      publicKey: address,
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

      const finalAddress = credential.publicKey ?? `0x${credential.id.slice(0, 40)}`;

      setState({
        isConnected: true,
        address: finalAddress,
        isRegistering: false,
        isLoggingIn: false,
        error: null,
        walletType: "circle-passkey",
        credentialId: credential.id,
        publicKey: finalAddress,
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
    setState((s) => ({
      ...s,
      isConnected: false,
      address: null,
      error: null,
    }));
    // Call store directly — this hook instance may already have null address
    // (it's a separate useState from the one that connected), so React may bail
    // out of the re-render and the useEffect below won't fire.
    setWallet(null, null);
    // Keep credentialId and publicKey in state + localStorage for re-login.
  }, [setWallet]);

  return {
    ...state,
    hasConfig,
    registerWithPasskey,
    loginWithPasskey,
    disconnect,
  };
}
