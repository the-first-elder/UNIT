"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles, ArrowRight, Check, ChevronRight } from "lucide-react";

const demoLines = [
  { text: "UNIT analyzing: \"Turn 500 USDC into the best low-risk yield strategy\"", delay: 0, type: "prompt" },
  { text: "Scanning yield sources...", delay: 1.2, type: "status" },
  { text: "Found 12 opportunities across Arbitrum, Base, Ethereum", delay: 2, type: "info" },
  { text: "Evaluating risk profiles...", delay: 2.8, type: "status" },
  { text: "Optimizing allocation split", delay: 3.6, type: "status" },
  { text: "✓ Strategy ready", delay: 4.4, type: "success" },
];

const strategyCards = [
  { protocol: "Aave", type: "Lending", allocation: "60%", apy: "8.2%", risk: "Low" },
  { protocol: "Morpho", type: "Vault", allocation: "25%", apy: "11.5%", risk: "Low" },
  { protocol: "Compound", type: "Supply", allocation: "15%", apy: "6.8%", risk: "Low" },
];

export function LiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  // id="live-demo" is used as a scroll anchor from hero CTA
  const [visibleLines, setVisibleLines] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -60]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    demoLines.forEach((line) => {
      timers.push(setTimeout(() => {
        setVisibleLines((prev) => Math.max(prev, demoLines.indexOf(line) + 1));
        if (line.type === "success") {
          setTimeout(() => setShowResults(true), 600);
        }
      }, (line.delay + 0.5) * 1000));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section id="live-demo" ref={ref} className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.015] to-transparent pointer-events-none" />

      <motion.div style={{ opacity, y }} className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs text-blue-400 font-medium tracking-widest uppercase mb-4 block"
          >
            See it in action
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold tracking-tight"
          >
            From prompt to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              execution plan
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-4 max-w-lg mx-auto"
          >
            Watch UNIT transform a simple sentence into a complete DeFi strategy in real time.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 glass rounded-2xl border-border/40 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
              </div>
              <span className="text-[10px] text-muted-foreground/50 font-mono ml-2">UNIT Terminal — live</span>
              <span className="ml-auto text-[10px] text-green-400/60 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                connected
              </span>
            </div>
            <div className="p-5 font-mono text-sm space-y-2.5 min-h-[320px]">
              {demoLines.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-2.5 ${line.type === "prompt" ? "text-blue-300" : line.type === "success" ? "text-green-400" : line.type === "info" ? "text-cyan-300" : "text-muted-foreground"}`}
                >
                  {line.type === "success" ? (
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  ) : line.type === "prompt" ? (
                    <ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  ) : (
                    <span className="h-4 w-4 flex items-center justify-center shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    </span>
                  )}
                  <span>{line.text}</span>
                  {i === visibleLines - 1 && line.type !== "success" && (
                    <span className="h-4 w-2 bg-blue-400/60 animate-pulse inline-block ml-0.5" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Strategy Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass rounded-2xl border-border/40 p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Strategy Breakdown</span>
              </div>

              {showResults ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-3"
                >
                  <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
                    <span className="text-green-400 font-medium">Estimated APY: 8.9%</span>
                    <span className="mx-2">·</span>
                    Risk: Low
                    <span className="mx-2">·</span>
                    Protocol: Multi
                  </div>

                  {strategyCards.map((card, i) => (
                    <motion.div
                      key={card.protocol}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-xl border border-border/40 p-3 space-y-1.5 hover:border-blue-500/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{card.protocol}</span>
                        <span className="text-xs text-green-400 font-mono">{card.apy}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{card.type}</span>
                        <span>{card.allocation}</span>
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-2"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Total allocation</span>
                      <span className="text-foreground font-medium">500 USDC</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>Expected monthly</span>
                      <span className="text-green-400 font-medium">+3.71 USDC</span>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-xs text-muted-foreground/50">
                  Waiting for analysis...
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
