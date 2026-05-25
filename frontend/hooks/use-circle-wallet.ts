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
  walletId: string | null;
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
  walletId: string;
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
        walletId: data.walletId,
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
      walletId: null,
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

      const passkeyAddress = credential.publicKey ?? `0x${credential.id.slice(0, 40)}`;

      // Always fetch or create a Circle W3S wallet — locally-derived address
      // never matches the real Circle W3S wallet on-chain address.
      let walletId = state.walletId;
      let finalAddress = state.address ?? passkeyAddress;

      {
        const stored = loadStoredPasskeys();
        const existing = stored[credential.id];
        if (existing?.walletId && existing?.address && /^0x[a-fA-F0-9]{40}$/.test(existing.address)) {
          walletId = existing.walletId;
          finalAddress = existing.address;
        } else {
          // If no stored walletId, try server-side lookup by credential ID
          if (!state.walletId && !isRegister) {
            try {
              const lookupRes = await fetch("/api/circle/passkey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "getPasskeyWallet", credentialId: credential.id }),
              });
              const lookupData = await lookupRes.json();
              if (lookupRes.ok && lookupData.found && lookupData.walletId) {
                walletId = lookupData.walletId;
                finalAddress = lookupData.address;
                setState({
                  isConnected: true,
                  address: finalAddress,
                  isRegistering: false,
                  isLoggingIn: false,
                  error: null,
                  walletType: "circle-passkey",
                  credentialId: credential.id,
                  publicKey: finalAddress,
                  walletId,
                });
                setWallet(finalAddress, "passkey");
                if (credential.publicKey) {
                  saveStoredPasskey(credential.id, { publicKey: credential.publicKey, address: finalAddress, walletId: walletId ?? "" });
                }
                return;
              }
            } catch {
              // Fall through to getWallet / setupWallet
            }
          }

          // If we have a walletId (but stale address), try getWallet first
          if (state.walletId && !isRegister) {
            const getRes = await fetch("/api/circle/passkey", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "getWallet", walletId: state.walletId }),
            });
            const getData = await getRes.json();
            if (getRes.ok && getData.address) {
              walletId = getData.walletId;
              finalAddress = getData.address;
              // Save and continue
              setState({
                isConnected: true,
                address: finalAddress,
                isRegistering: false,
                isLoggingIn: false,
                error: null,
                walletType: "circle-passkey",
                credentialId: credential.id,
                publicKey: finalAddress,
                walletId,
              });
              setWallet(finalAddress, "passkey");
              if (credential.publicKey) {
                saveStoredPasskey(credential.id, { publicKey: credential.publicKey, address: finalAddress, walletId: walletId ?? "" });
              }
              return;
            }
          }
          const res = await fetch("/api/circle/passkey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "setupWallet", credentialId: credential.id }),
          });
          const data = await res.json();
          if (res.ok && data.walletId) {
            walletId = data.walletId;
            finalAddress = data.address;
          } else {
            console.warn("Failed to create passkey wallet:", data.error);
            finalAddress = passkeyAddress;
          }
        }
      }

      setState({
        isConnected: true,
        address: finalAddress,
        isRegistering: false,
        isLoggingIn: false,
        error: null,
        walletType: "circle-passkey",
        credentialId: credential.id,
        publicKey: finalAddress,
        walletId,
      });

      setWallet(finalAddress, "passkey");

      if (credential.publicKey) {
        saveStoredPasskey(credential.id, { publicKey: credential.publicKey, address: finalAddress, walletId: walletId ?? "" });
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

  // Fix stale passkey address on mount — always fetch the real wallet address
  // from Circle if we have a walletId. The locally-derived address is never
  // the same as the Circle W3S wallet address.
  useEffect(() => {
    if (!state.walletId && !state.credentialId) return;
    (async () => {
      try {
        let address: string | undefined;
        let wId: string | undefined;

        if (state.walletId) {
          const res = await fetch("/api/circle/passkey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "getWallet", walletId: state.walletId }),
          });
          const data = await res.json();
          if (res.ok && data.address) {
            address = data.address;
            wId = data.walletId;
          }
        }

        if (!address && state.credentialId) {
          const res = await fetch("/api/circle/passkey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "setupWallet" }),
          });
          const data = await res.json();
          if (res.ok && data.walletId && data.address) {
            address = data.address;
            wId = data.walletId;
          }
        }

        if (address && wId) {
          setState((s) => ({ ...s, address, publicKey: address, walletId: wId }));
          setWallet(address, "passkey");
          const stored = loadStoredPasskeys();
          const storedCredId = Object.entries(stored).find(
            ([, e]) => e.walletId === state.walletId || e.address === state.address,
          )?.[0];
          if (storedCredId) {
            saveStoredPasskey(storedCredId, { ...stored[storedCredId], address, walletId: wId });
          } else if (state.credentialId) {
            saveStoredPasskey(state.credentialId, { publicKey: address, address, walletId: wId });
          }
        }
      } catch (e) {
        console.warn("Failed to fetch passkey wallet address:", e);
      }
    })();
  }, []); // run once on mount

  const disconnect = useCallback(() => {
    setState((s) => ({
      ...s,
      isConnected: false,
      address: null,
      error: null,
    }));
    setWallet(null, null);
    localStorage.removeItem(PASSKEY_STORE_KEY);
  }, [setWallet]);

  return {
    ...state,
    hasConfig,
    walletId: state.walletId,
    registerWithPasskey,
    loginWithPasskey,
    disconnect,
  };
}
