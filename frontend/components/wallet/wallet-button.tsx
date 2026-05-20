"use client";

import { useCircleWallet } from "@/hooks/use-circle-wallet";
import { useSocialWallet } from "@/components/wallet/wallet-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils";
import {
  LogOut,
  ChevronDown,
  Fingerprint,
  Chrome,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { CircleWalletButton } from "./circle-wallet-button";
import { CircleSocialWalletButton } from "./circle-social-button";

export function WalletButton() {
  const walletAddress = useAppStore((s) => s.walletAddress);
  const walletType = useAppStore((s) => s.walletType);
  const connected = Boolean(walletAddress);
  const activeAddress = walletAddress || "";
  const isSocial = walletType === "social";
  const isSimulator = walletType === "simulator";
  const circleWallet = useCircleWallet();
  const social = useSocialWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(() => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [activeAddress]);

  if (connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 w-full border-emerald-500/20 bg-emerald-500/5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="flex-1 text-left font-medium">
              {isSimulator ? "Simulator Wallet" : shortenAddress(activeAddress, 6)}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 space-y-1">
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 text-xs w-full hover:bg-accent rounded-md px-1 py-1 transition-colors group"
            >
              {isSocial ? (
                <Chrome className="h-3.5 w-3.5 text-blue-400" />
              ) : isSimulator ? (
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              ) : (
                <Fingerprint className="h-3.5 w-3.5 text-green-400" />
              )}
              <span className="font-mono flex-1 text-left">{shortenAddress(activeAddress, 8)}</span>
              {copied ? (
                <Check className="h-3 w-3 text-green-400 shrink-0" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0" />
              )}
            </button>
          </div>
          <DropdownMenuItem
            onClick={() => {
              if (isSimulator) {
                useAppStore.getState().setWallet(null, null);
              } else if (isSocial) {
                social.disconnect();
              } else {
                circleWallet.disconnect();
              }
            }}
            className="gap-2 text-red-400 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-2"
      >
        <CircleWalletButton />
        <CircleSocialWalletButton />
      </motion.div>
    </AnimatePresence>
  );
}
