"use client";

import { useSocialWallet } from "@/components/wallet/wallet-context";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils";
import {
  Chrome,
  LogOut,
  Loader2,
  AlertCircle,
  Wallet,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";

export function CircleSocialWalletButton() {
  const {
    isConnected,
    address,
    wallets,
    loginError,
    status,
    hasConfig,
    sdkReady,
    hasDeviceToken,
    loginResult,
    challengeId,
    connectWithGoogle,
    clearAllState,
    disconnect,
  } = useSocialWallet();

  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [address]);

  if (!hasConfig) return null;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 w-full">
        <button
          onClick={copyAddress}
          className="flex-1 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 hover:bg-blue-500/10 transition-colors text-left group"
          title="Copy address"
        >
          <Wallet className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span className="text-xs font-mono truncate">{shortenAddress(address, 6)}</span>
          {copied ? (
            <Check className="h-3 w-3 text-green-400 shrink-0" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0" />
          )}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-400"
          onClick={disconnect}
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  const isLoading = status.includes("Redirecting") || status.includes("Creating device") || status.includes("Initializing") || status.includes("Creating wallet") || status.includes("Loading") || status.includes("Executing");

  return (
    <div className="space-y-1.5 w-full">
      <AnimatePresence>
        {loginError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1 text-[10px] text-red-400 px-1"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span className="truncate">{loginError}</span>
            <button
              onClick={clearAllState}
              className="ml-auto shrink-0 rounded p-0.5 hover:bg-red-500/10 transition-colors"
              title="Clear state and restart"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="premium"
        size="sm"
        className="w-full gap-2 h-9 text-xs"
        onClick={connectWithGoogle}
        disabled={!sdkReady || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Chrome className="h-3.5 w-3.5" />
        )}
        {isLoading ? (
          <span className="truncate">{status}</span>
        ) : (
          "Connect with Google"
        )}
      </Button>

      <div className="text-[10px] text-muted-foreground/50 text-center">{status}</div>

      <button
        className="text-[8px] text-muted-foreground/30 hover:text-muted-foreground/60 mt-1 block w-full text-center"
        onClick={() => setShowDebug(!showDebug)}
      >
        {showDebug ? "hide debug" : "debug"}
      </button>

      {showDebug && (
        <pre className="text-[8px] text-muted-foreground/40 leading-tight mt-1 overflow-x-auto">
          {JSON.stringify(
            {
              sdkReady,
              hasDeviceToken,
              hasLoginResult: !!loginResult,
              hasChallengeId: !!challengeId,
              walletCount: wallets.length,
              walletAddress: address,
              status,
            },
            null,
            2,
          )}
        </pre>
      )}
    </div>
  );
}
