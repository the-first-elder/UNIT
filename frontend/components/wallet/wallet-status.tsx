"use client";

import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Chrome, Fingerprint } from "lucide-react";

export function WalletStatus() {
  const walletAddress = useAppStore((s) => s.walletAddress);
  const walletType = useAppStore((s) => s.walletType);
  const connected = Boolean(walletAddress);

  return (
    <div className="flex flex-col gap-1">
      {connected ? (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-green-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {walletType === "social" ? <Chrome className="h-2.5 w-2.5" /> : <Fingerprint className="h-2.5 w-2.5" />}
          <span>Connected</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
          <span>Not connected</span>
        </div>
      )}
    </div>
  );
}
