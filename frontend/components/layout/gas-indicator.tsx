"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Gauge } from "lucide-react";

export function GasIndicator() {
  const [gas, setGas] = useState<number | null>(null);

  useEffect(() => {
    async function fetchGas() {
      try {
        const res = await fetch("https://api.etherscan.io/api?module=gastracker&action=gasoracle");
        const data = await res.json();
        if (data.status === "1") {
          setGas(parseInt(data.result.ProposeGasPrice));
        }
      } catch { /* ignore */ }
    }
    fetchGas();
    const interval = setInterval(fetchGas, 30000);
    return () => clearInterval(interval);
  }, []);

  const level = gas
    ? gas < 20 ? "low" : gas < 50 ? "medium" : "high"
    : null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Gauge className="h-3 w-3" />
      {gas ? (
        <span
          className={cn(
            level === "low" && "text-green-400",
            level === "medium" && "text-yellow-400",
            level === "high" && "text-red-400"
          )}
        >
          {gas}
        </span>
      ) : (
        <span className="animate-pulse">--</span>
      )}
    </div>
  );
}
