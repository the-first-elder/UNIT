"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, ChevronDown, Globe, Shield, Gauge, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { ParticleNetwork } from "./particle-network";

function LiveWealthCounter() {
  const { ref, value } = (() => {
    const r = { ref: useRef<HTMLDivElement>(null), value: 0 };
    return r;
  })();

  return (
    <div className="glass rounded-2xl px-5 py-3 border-green-500/10 flex items-center gap-3">
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-2.5 w-2.5 rounded-full bg-green-400"
      />
      <div className="text-xs text-muted-foreground">Live P&L</div>
      <motion.div
        className="text-sm font-mono font-bold tabular-nums text-green-400"
        key="hackathon-value"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        trustless · transparent · autonomous
      </motion.div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref, offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const { theme, toggle } = useTheme();

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm border-border/50 shadow-sm"
          onClick={toggle}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      <ParticleNetwork />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[200px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[radial-gradient(ellipse,rgba(59,130,246,0.04)_0%,transparent_70%)]" />
      </div>

      <motion.div style={{ opacity, y }} className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] font-black tracking-tight leading-none mb-6"
        >
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            UNIT
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xl sm:text-2xl text-muted-foreground/80 max-w-4xl mx-auto mb-6 leading-relaxed font-light"
        >
          Type what you want — UNIT scans every chain, finds the best lending rates, yield pools, and swap routes, then executes your strategy automatically. 
          <span className="block mt-2 text-foreground/60 text-lg">
            From a single prompt to a fully optimized, multi-protocol position. Set your risk tolerance. Let the AI build and manage it.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-center gap-3 flex-wrap mb-10"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground/50 bg-muted/50 px-4 py-2 rounded-full">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            All EVM chains
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/50 bg-muted/50 px-4 py-2 rounded-full">
            <Shield className="h-3.5 w-3.5 text-green-400" />
            Non-custodial
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/50 bg-muted/50 px-4 py-2 rounded-full">
            <Gauge className="h-3.5 w-3.5 text-cyan-400" />
            Low · Medium · High risk
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link href="/app">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="xl" className="gap-2.5 text-base px-10 h-14 rounded-2xl shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0">
                <Zap className="h-5 w-5" />
                Launch Terminal
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12 flex items-center justify-center gap-4 flex-wrap"
        >
          <LiveWealthCounter />
          <div className="glass rounded-2xl px-5 py-3 border-blue-500/10 flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {["ETH", "ARB", "OP", "BASE", "MATIC", "AVAX"].map((c) => (
                <div key={c} className="h-7 w-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-[9px] font-mono text-blue-400 font-bold">
                  {c}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">7 EVM chains</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex items-center justify-center gap-8 text-xs text-muted-foreground/40"
        >
          {["Prompt-based strategies", "Cross-chain execution", "Risk-graded allocations", "Real-time tracking"].map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + i * 0.08 }}
              className="flex items-center gap-1.5"
            >
              <Zap className="h-3 w-3 text-blue-400/60" />
              {item}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="h-5 w-5 text-muted-foreground/20" />
        </motion.div>
      </motion.div>
    </section>
  );
}
