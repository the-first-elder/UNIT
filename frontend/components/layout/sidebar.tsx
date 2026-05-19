"use client";

import { useAppStore } from "@/lib/store";
import { useTheme } from "@/hooks/use-theme";
import { WalletButton } from "@/components/wallet/wallet-button";
import { WalletStatus } from "@/components/wallet/wallet-status";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GasIndicator } from "./gas-indicator";
import { ChainSelect } from "./chain-select";

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { theme, toggle } = useTheme();

  return (
    <AnimatePresence mode="wait">
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="fixed left-0 top-0 z-40 h-full border-r border-border bg-background/95 backdrop-blur-xl overflow-hidden"
        >
          <div className="flex h-full flex-col w-[240px]">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2.5">
                <div className="relative h-8 w-8">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 opacity-80 blur-sm" />
                  <div className="relative h-full w-full rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-lg tracking-tight">UNIT</span>
                  <div className="text-[10px] text-muted-foreground/50 leading-none -mt-0.5">Terminal</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggle}
                >
                  {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSidebarOpen(false)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="px-3 space-y-2">
              <WalletButton />
            </div>

            <div className="flex items-center gap-3 px-4 py-2">
              <WalletStatus />
              <GasIndicator />
            </div>

            <div className="px-3">
              <ChainSelect />
            </div>

            <div className="mt-auto p-4 border-t border-border">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
                <span className="h-1 w-1 rounded-full bg-blue-400" />
                autonomous execution
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
