"use client";

import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Zap, Clock, ExternalLink, Trash2, BarChart3, Activity, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CHAIN_COLORS: Record<string, string> = {
  ethereum: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  base: "bg-blue-600/20 text-blue-300 border-blue-600/30",
  arbitrum: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  optimism: "bg-red-500/20 text-red-400 border-red-500/30",
  polygon: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  avalanche: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const STRATEGY_COLORS: Record<string, string> = {
  vault: "from-emerald-500 to-green-400",
  lending: "from-blue-500 to-cyan-400",
  speculation: "from-rose-500 to-orange-400",
};

function getStrategyGradient(apy: string) {
  const lower = apy.toLowerCase();
  if (lower.includes("vault")) return STRATEGY_COLORS.vault;
  if (lower.includes("lend")) return STRATEGY_COLORS.lending;
  return STRATEGY_COLORS.speculation;
}

function getChainColor(chain: string) {
  const lower = chain.toLowerCase();
  for (const key of Object.keys(CHAIN_COLORS)) {
    if (lower.includes(key)) return CHAIN_COLORS[key];
  }
  return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function PortfolioDashboard() {
  const { activePositions, removeActivePosition } = useAppStore();

  if (activePositions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="relative h-16 w-16 rounded-2xl bg-card border border-border flex items-center justify-center">
            <BarChart3 className="h-7 w-7 text-muted-foreground/50" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Active Positions</h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Execute a DeFi strategy from the Terminal tab to see your positions tracked here in real-time.
        </p>
      </motion.div>
    );
  }

  const totalPositions = activePositions.length;
  const activeCount = activePositions.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-6 pb-8">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Positions", value: totalPositions, icon: Activity, color: "text-blue-400" },
          { label: "Active Now", value: activeCount, icon: Zap, color: "text-emerald-400" },
          { label: "Chains Used", value: new Set(activePositions.map((p) => p.chain)).size, icon: Globe, color: "text-purple-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-3 flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-1.5">
              <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Position cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Active Positions
        </h3>
        <AnimatePresence mode="popLayout">
          {activePositions.map((pos) => (
            <motion.div
              key={pos.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="group relative bg-card border border-border rounded-2xl p-4 hover:border-border/80 hover:shadow-lg transition-all duration-200"
            >
              {/* Status indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  pos.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-zinc-400"
                )} />
                <span className="text-[10px] text-muted-foreground">{pos.status}</span>
              </div>

              <div className="flex items-start gap-3">
                {/* Gradient icon */}
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br",
                  getStrategyGradient(pos.apy)
                )}>
                  <TrendingUp className="h-4.5 w-4.5 text-white" />
                </div>

                <div className="flex-1 min-w-0 pr-16">
                  <p className="text-sm font-semibold text-foreground truncate">{pos.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{pos.protocol}</p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                      getChainColor(pos.chain)
                    )}>
                      {pos.chain}
                    </span>
                    {pos.apy && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <TrendingUp className="h-2.5 w-2.5" />
                        {pos.apy}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(pos.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground flex-1"
                  onClick={() => {
                    const url = `https://etherscan.io/tx/${pos.id.split("-")[0]}`;
                    window.open(url, "_blank");
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                  View on Explorer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  onClick={() => removeActivePosition(pos.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
