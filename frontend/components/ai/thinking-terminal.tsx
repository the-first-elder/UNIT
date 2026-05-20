"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Cpu, Search, Compass, CheckCircle2, Loader2,
  ChevronRight
} from "lucide-react";

interface LogItem {
  id: string;
  category: "research" | "routing" | "security" | "success" | "info";
  message: string;
  timestamp: string;
}

const STATUS_PHASES = [
  { label: "INITIALIZING", color: "text-purple-400" },
  { label: "SCANNING", color: "text-cyan-400" },
  { label: "ANALYZING", color: "text-blue-400" },
  { label: "ROUTING", color: "text-amber-400" },
  { label: "FINALIZING", color: "text-emerald-400" },
  { label: "READY", color: "text-green-400" },
];

const AWAITING_PHASE = { label: "AWAITING RESPONSE", color: "text-amber-400" };

const THINKING_LOGS = [
  { category: "info" as const, message: "UNIT agent instantiated on EVM mainnets..." },
  { category: "research" as const, message: "Analyzing user risk-tolerance parameter..." },
  { category: "research" as const, message: "Scanning market yields across Aave v3, Morpho, and Compound..." },
  { category: "research" as const, message: "Comparing gas cost vs yield optimization on Arbitrum, Base, and Ethereum..." },
  { category: "routing" as const, message: "Quoting LI.FI bridge pathways for multi-chain routing..." },
  { category: "security" as const, message: "Simulating pool health factor and check liquidation levels..." },
  { category: "security" as const, message: "Encoding transaction payload with ERC-20 approvals and swap limits..." },
  { category: "success" as const, message: "DeFi strategy compiled successfully. Directing payload to execution graph." },
];

function Particle({ index, total }: { index: number; total: number }) {
  const angle = (index / total) * Math.PI * 2;
  const radius = 24 + Math.random() * 12;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const size = 1.5 + Math.random() * 2;
  const duration = 2 + Math.random() * 3;
  const delay = Math.random() * 2;

  return (
    <motion.div
      className="absolute rounded-full bg-blue-400/60"
      style={{
        width: size,
        height: size,
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
      }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0, 1, 0],
        x: [0, Math.sin(angle + 0.5) * 40],
        y: [0, Math.cos(angle + 0.5) * 40],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

function PulseRing({ delay, size }: { delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width: size,
        height: size,
        left: `calc(50% - ${size / 2}px)`,
        top: `calc(50% - ${size / 2}px)`,
        borderColor: "rgba(59, 130, 246, 0.15)",
      }}
      animate={{
        scale: [1, 2.2, 1],
        opacity: [0.3, 0, 0.3],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

function OrbitingDot({ index, radius, color }: { index: number; radius: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 3,
        height: 3,
        backgroundColor: color,
        boxShadow: `0 0 6px ${color}`,
      }}
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 4 + index * 0.5,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 3,
          height: 3,
          backgroundColor: color,
          left: -radius,
          top: -1.5,
        }}
      />
    </motion.div>
  );
}

export function ThinkingTerminal({ isBackendLoading = true }: { isBackendLoading?: boolean }) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = THINKING_LOGS.length > 0
    ? Math.min((currentStep + 1) / THINKING_LOGS.length * 100, 100)
    : 0;
  const animComplete = currentStep >= THINKING_LOGS.length - 1;
  const isReady = animComplete && !isBackendLoading;
  const phaseIndex = Math.min(
    Math.floor((currentStep / (THINKING_LOGS.length - 1)) * (STATUS_PHASES.length - 1)),
    STATUS_PHASES.length - 1
  );
  const currentPhase = animComplete && isBackendLoading ? AWAITING_PHASE : STATUS_PHASES[phaseIndex];

  useEffect(() => {
    const getTimestamp = () => {
      const now = new Date();
      return now.toTimeString().split(" ")[0];
    };

    setLogs([{
      id: `log-0`,
      category: THINKING_LOGS[0].category,
      message: THINKING_LOGS[0].message,
      timestamp: getTimestamp(),
    }]);

    const timers: NodeJS.Timeout[] = [];
    THINKING_LOGS.slice(1).forEach((item, index) => {
      const delay = (index + 1) * 7500 + Math.floor(Math.random() * 1000);
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
      case "research": return <Search className="h-3 w-3 text-cyan-400" />;
      case "routing": return <Compass className="h-3 w-3 text-blue-400" />;
      case "security": return <Cpu className="h-3 w-3 text-amber-500" />;
      case "success": return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      default: return <Loader2 className="h-3 w-3 text-purple-400 animate-spin" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "research": return "text-cyan-400";
      case "routing": return "text-blue-400";
      case "security": return "text-amber-500";
      case "success": return "text-emerald-400 font-medium";
      default: return "text-purple-400";
    }
  };

  return (
    <div className="w-full max-w-2xl border border-border/80 bg-[#08080a] text-zinc-300 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/15 relative">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)",
          backgroundSize: "100% 2px",
        }}
      />

      {/* Top Header bar */}
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-border/40 bg-zinc-950/80">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute h-5 w-5 rounded-full bg-blue-500/20"
              animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <Terminal className="h-4 w-4 text-blue-400 relative z-10" />
          </div>
          <span className="text-xs font-mono font-bold tracking-tight text-zinc-400">
            UNIT AUTONOMOUS PIPELINE
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <motion.div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-wider"
            style={{
              borderColor: isReady ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.3)",
              backgroundColor: isReady ? "rgba(34,197,94,0.08)" : "rgba(59,130,246,0.08)",
            }}
            animate={{
              boxShadow: isReady
                ? ["0 0 0px rgba(34,197,94,0)", "0 0 8px rgba(34,197,94,0.15)", "0 0 0px rgba(34,197,94,0)"]
                : ["0 0 0px rgba(59,130,246,0)", "0 0 8px rgba(59,130,246,0.15)", "0 0 0px rgba(59,130,246,0)"],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {!isReady && (
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {isReady && (
              <CheckCircle2 className="h-2.5 w-2.5 text-green-400" />
            )}
            <span className={currentPhase.color}>{currentPhase.label}</span>
          </motion.div>

          {/* Traffic dots */}
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500/50" />
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-green-500"
              animate={{ opacity: isReady ? [1, 0.4, 1] : [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border/30">
        {/* Left Side: Orbital Visualization */}
        <div className="md:col-span-2 p-5 flex flex-col items-center justify-center bg-zinc-950/30 min-h-[240px] relative overflow-hidden">
          {/* Subtle grid bg */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <Particle key={i} index={i} total={12} />
          ))}

          {/* Pulse rings */}
          <PulseRing delay={0} size={80} />
          <PulseRing delay={0.8} size={120} />
          <PulseRing delay={1.6} size={56} />

          {/* Orbiting dots */}
          <OrbitingDot index={0} radius={30} color="rgba(59,130,246,0.4)" />
          <OrbitingDot index={1} radius={46} color="rgba(6,182,212,0.3)" />
          <OrbitingDot index={2} radius={20} color="rgba(168,85,247,0.4)" />

          {/* Center icon */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20"
              animate={{
                scale: isReady ? [1, 1.05, 1] : [1, 1.04, 1],
                boxShadow: isReady
                  ? ["0 0 20px rgba(34,197,94,0.2)", "0 0 40px rgba(34,197,94,0.3)", "0 0 20px rgba(34,197,94,0.2)"]
                  : ["0 0 20px rgba(59,130,246,0.2)", "0 0 40px rgba(59,130,246,0.3)", "0 0 20px rgba(59,130,246,0.2)"],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {isReady ? (
                <CheckCircle2 className="h-7 w-7 text-white" />
              ) : (
                <Cpu className="h-7 w-7 text-white" />
              )}
            </motion.div>

            <div className="flex items-center gap-1.5 mt-3">
              {!isReady && (
                <>
                  <motion.span
                    className="h-1 w-1 rounded-full bg-blue-500"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="h-1 w-1 rounded-full bg-cyan-500"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                  />
                  <motion.span
                    className="h-1 w-1 rounded-full bg-blue-400"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
                  />
                </>
              )}
            </div>

            <motion.span
              className="text-[10px] font-mono mt-2 text-center uppercase tracking-widest font-bold"
              style={{ color: isReady ? "rgba(34,197,94,0.7)" : "rgba(59,130,246,0.7)" }}
            >
              {isReady ? "COMPLETE" : "PROCESSING"}
            </motion.span>
          </div>

          {/* Bottom progress */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="relative h-1 rounded-full bg-zinc-800 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: isReady
                    ? "linear-gradient(90deg, #22c55e, #16a34a)"
                    : "linear-gradient(90deg, #3b82f6, #06b6d4)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Log Feed */}
        <div
          ref={containerRef}
          className="md:col-span-3 p-4 font-mono text-xs leading-relaxed space-y-1.5 h-[260px] overflow-y-auto scrollbar-thin select-none"
        >
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -12, filter: "blur(2px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-start gap-2 py-1 px-1.5 rounded hover:bg-zinc-900/40 transition-colors group"
              >
                {/* Step number */}
                <span className="text-zinc-700 text-[10px] w-4 shrink-0 text-right select-none font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Chevron */}
                <ChevronRight className="h-3 w-3 text-zinc-700 mt-0.5 shrink-0 group-hover:text-zinc-500 transition-colors" />

                {/* Icon */}
                <span className="shrink-0 mt-0.5">{getIcon(log.category)}</span>

                {/* Message */}
                <span className={getCategoryColor(log.category)}>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Animation still playing */}
          {!animComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 pl-9 pt-2"
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-blue-500"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-cyan-500"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-violet-500"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              />
              <span className="text-zinc-600 text-[10px] ml-1 animate-pulse">_</span>
            </motion.div>
          )}

          {/* Animation done, waiting for backend */}
          {animComplete && isBackendLoading && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 pl-9 pt-2 text-amber-400/70"
            >
              <motion.div
                className="h-2.5 w-2.5 rounded-full border border-amber-400/50"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-[10px] font-semibold tracking-wider">AWAITING RESPONSE</span>
            </motion.div>
          )}

          {/* All done */}
          {isReady && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 pl-9 pt-2 text-emerald-500/80"
            >
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-[10px] font-semibold tracking-wider">STRATEGY READY</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
