"use client";

import { useCircleWallet } from "@/hooks/use-circle-wallet";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils";
import {
  Fingerprint,
  LogOut,
  KeyRound,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";

export function CircleWalletButton() {
  const {
    isConnected,
    address,
    isRegistering,
    isLoggingIn,
    error,
    hasConfig,
    registerWithPasskey,
    loginWithPasskey,
    disconnect,
  } = useCircleWallet();

  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [address]);

  if (!hasConfig) {
    return null;
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 w-full">
        <button
          onClick={copyAddress}
          className="flex-1 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-1.5 hover:bg-green-500/10 transition-colors group"
        >
          <Fingerprint className="h-3.5 w-3.5 text-green-400 shrink-0" />
          <span className="text-xs font-mono flex-1 text-left">{shortenAddress(address, 6)}</span>
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

  return (
    <div className="space-y-1.5 w-full">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1 text-[10px] text-red-400 px-1"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 h-8 text-xs"
          onClick={registerWithPasskey}
          disabled={isRegistering || isLoggingIn}
        >
          {isRegistering ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <KeyRound className="h-3 w-3" />
          )}
          Register
        </Button>
        <Button
          variant="premium"
          size="sm"
          className="flex-1 gap-1.5 h-8 text-xs"
          onClick={loginWithPasskey}
          disabled={isRegistering || isLoggingIn}
        >
          {isLoggingIn ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Fingerprint className="h-3 w-3" />
          )}
          Passkey Login
        </Button>
      </div>
    </div>
  );
}
