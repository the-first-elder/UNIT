"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Cpu, Search, Layers, Compass, CheckCircle2, Loader2 } from "lucide-react";

interface LogItem {
  id: string;
  category: "research" | "routing" | "security" | "success" | "info";
  message: string;
  timestamp: string;
}

const THINKING_LOGS = [
  { category: "info" as const, message: "UNIT agent instantiated on EVM mainnets..." },
  { category: "research" as const, message: "Analyzing user risk-tolerance parameter..." },
  { category: "research" as const, message: "Scanning market yields across Aave v3, Morpho, and Compound..." },
  { category: "research" as const, message: "Comparing gas cost vs yield optimization on Arbitrum, Base, and Ethereum..." },
  { category: "routing" as const, message: "Quoting LI.FI bridge pathways for multi-chain routing..." },
  { category: "security" as const, message: "Simulating pool health factor and check liquidation levels..." },
  { category: "security" as const, message: "Encoding transaction payload with ERC-20 approvals and swap limits..." },
  { category: "success" as const, message: "DeFi strategy compiled successfully. Directing payload to execution graph." }
];

export function ThinkingTerminal() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start with the first log
    const getTimestamp = () => {
      const now = new Date();
      return now.toTimeString().split(" ")[0];
    };

    setLogs([
      {
        id: `log-0`,
        category: THINKING_LOGS[0].category,
        message: THINKING_LOGS[0].message,
        timestamp: getTimestamp(),
      },
    ]);

    const timers: NodeJS.Timeout[] = [];

    // Schedule remaining logs
    THINKING_LOGS.slice(1).forEach((item, index) => {
      const delay = (index + 1) * 800; // staggered output
      const timer = setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${index + 1}`,
            category: item.category,
            message: item.message,
            timestamp: getTimestamp(),
          },
        ]);
        setCurrentStep(index + 1);
        
        // Auto scroll to bottom of logs
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case "research":
        return <Search className="h-3 w-3 text-cyan-400" />;
      case "routing":
        return <Compass className="h-3 w-3 text-blue-400" />;
      case "security":
        return <Cpu className="h-3 w-3 text-amber-500" />;
      case "success":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <Loader2 className="h-3 w-3 text-purple-400 animate-spin" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "research":
        return "text-cyan-400";
      case "routing":
        return "text-blue-400";
      case "security":
        return "text-amber-500";
      case "success":
        return "text-emerald-400 font-medium";
      default:
        return "text-purple-400";
    }
  };

  return (
    <div className="w-full max-w-2xl border border-border/80 bg-[#08080a] text-zinc-300 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10">
      {/* Top Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-zinc-950/80">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-blue-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-tight text-zinc-400">
            UNIT AUTONOMOUS PIPELINE
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500/50" />
          <span className="h-2 w-2 rounded-full bg-amber-500/50" />
          <span className="h-2 w-2 rounded-full bg-green-500/80 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/30">
        {/* Left Side: Pulse Animation */}
        <div className="md:col-span-1 p-5 flex flex-col items-center justify-center bg-zinc-950/30 min-h-[160px]">
          <div className="relative flex items-center justify-center h-20 w-20">
            {/* Pulsing rings */}
            <motion.div
              animate={{ scale: [1, 2, 1], opacity: [0.1, 0, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-blue-500/20 border border-blue-500/30"
            />
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute inset-2 rounded-full bg-cyan-500/20 border border-cyan-500/30"
            />
            <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="h-6 w-6 text-white animate-pulse" />
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-3 text-center uppercase tracking-wider">
            Optimization Engine
          </span>
          <span className="text-[11px] font-mono text-cyan-400/80 mt-1 font-bold">
            {currentStep < THINKING_LOGS.length - 1 ? "COMPUTING..." : "READY"}
          </span>
        </div>

        {/* Right Side: Log Feed */}
        <div 
          ref={containerRef}
          className="md:col-span-3 p-5 font-mono text-xs leading-relaxed space-y-2 h-[220px] overflow-y-auto scrollbar-thin select-none"
        >
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-2.5 hover:bg-zinc-900/30 py-0.5 px-1 rounded transition-colors"
              >
                <span className="text-zinc-600 text-[10px] shrink-0 mt-0.5 select-none">{log.timestamp}</span>
                <span className="shrink-0 mt-0.5">{getIcon(log.category)}</span>
                <span className={getCategoryColor(log.category)}>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {currentStep < THINKING_LOGS.length - 1 && (
            <div className="flex items-center gap-1.5 pl-14 pt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "300ms" }} />
              <span className="h-4 w-1.5 bg-zinc-500/80 animate-pulse ml-0.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
