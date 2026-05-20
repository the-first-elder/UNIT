"use client";

import type { Strategy } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  strategy: Strategy;
  index?: number;
}

export function StrategyCard({ strategy, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="rounded-xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-50" />
        <CardContent className="p-3 relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center border border-white/5">
                <Lightbulb className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white tracking-wide">{strategy.protocol}</div>
                <Badge variant={strategy.risk_level === "low" ? "success" : strategy.risk_level === "high" ? "destructive" : "warning"} className="mt-0.5 text-[8px] px-1.5 py-0 shadow-sm leading-tight h-4">
                  {strategy.risk_level}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                {strategy.estimated_apy}
              </div>
              <div className="text-[8px] text-zinc-400 uppercase tracking-widest font-bold">Est. APY</div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[10px] text-zinc-300 bg-white/5 p-2 rounded-lg border border-white/5">
            <FileText className="h-3 w-3 mt-0.5 shrink-0 text-blue-400" />
            <p className="leading-relaxed">{strategy.summary}</p>
          </div>

          {strategy.reasoning && (
            <div className="flex items-start gap-2 text-[9px] text-zinc-400 bg-white/5 p-2 rounded-lg border border-white/5">
              <TrendingUp className="h-3 w-3 mt-0.5 shrink-0 text-cyan-400" />
              <p className="leading-relaxed">{strategy.reasoning}</p>
            </div>
          )}

          {strategy.realistic_expectation_note && (
            <div className="text-[9px] text-zinc-500 italic px-1">
              * {strategy.realistic_expectation_note}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
