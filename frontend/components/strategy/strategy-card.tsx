"use client";

import type { Strategy } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "./risk-badge";
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
      <Card className="glass border-blue-500/10 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium">{strategy.protocol}</div>
                <Badge variant={strategy.risk_level === "low" ? "success" : strategy.risk_level === "high" ? "destructive" : "warning"}>
                  {strategy.risk_level}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-green-400">
                {strategy.estimated_apy}
              </div>
              <div className="text-[10px] text-muted-foreground">Est. APY</div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>{strategy.summary}</p>
          </div>

          {strategy.reasoning && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground/70 bg-muted/30 rounded-lg p-2.5">
              <TrendingUp className="h-3 w-3 mt-0.5 shrink-0" />
              <p>{strategy.reasoning}</p>
            </div>
          )}

          {strategy.realistic_expectation_note && (
            <div className="text-[10px] text-muted-foreground/50 italic">
              {strategy.realistic_expectation_note}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
