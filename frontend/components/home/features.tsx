"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Route, Shield, TrendingUp, Wallet, Cpu, GitBranch, Sparkles } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: TrendingUp,
    title: "Multiply your funds",
    description: "UNIT scans every yield surface, lending pool, and opportunity to compound your capital automatically.",
    gradient: "from-blue-500/20 to-blue-600/10",
    glow: "rgba(59,130,246,0.08)",
    iconColor: "text-blue-400",
  },
  {
    icon: Route,
    title: "Cross-chain by default",
    description: "Bridge and swap across 6 chains via LI.FI. No manual routing — UNIT finds the best path.",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    glow: "rgba(6,182,212,0.08)",
    iconColor: "text-cyan-400",
  },
  {
    icon: Shield,
    title: "Risk-aware execution",
    description: "Real-time scoring, slippage protection, health monitoring — your capital is protected.",
    gradient: "from-emerald-500/20 to-emerald-600/10",
    glow: "rgba(16,185,129,0.08)",
    iconColor: "text-emerald-400",
  },
  {
    icon: GitBranch,
    title: "Parallel transactions",
    description: "Independent txns execute simultaneously. Dependency graphs ensure correct ordering automatically.",
    gradient: "from-violet-500/20 to-violet-600/10",
    glow: "rgba(139,92,246,0.08)",
    iconColor: "text-violet-400",
  },
  {
    icon: Wallet,
    title: "Your wallet, your rules",
    description: "EOA, MetaMask, Rabby, passkeys — connect however you want. Non-custodial at all times.",
    gradient: "from-orange-500/20 to-orange-600/10",
    glow: "rgba(249,115,22,0.08)",
    iconColor: "text-orange-400",
  },
  {
    icon: Cpu,
    title: "AI that executes",
    description: "Not just chat — UNIT builds, encodes, and submits real transactions. From prompt to on-chain.",
    gradient: "from-rose-500/20 to-rose-600/10",
    glow: "rgba(244,63,94,0.08)",
    iconColor: "text-rose-400",
  },
];

function FeatureCard({ feature, i }: { feature: typeof features[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative"
    >
      <div
        className="glass rounded-2xl p-6 h-full border-border/40 hover:border-blue-500/20 transition-all duration-500 relative overflow-hidden"
      >
        {/* Glow on hover */}
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${feature.glow}, transparent)` }}
        />

        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${feature.gradient} border border-border/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-300`}>
          <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
        </div>
        <h3 className="font-semibold mb-2 tracking-tight text-lg">{feature.title}</h3>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">{feature.description}</p>

        <motion.div
          className="flex items-center gap-1.5 mt-4 text-[10px] text-blue-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -5 }}
          whileInView={{ x: 0 }}
        >
          <Sparkles className="h-3 w-3" />
          Active
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.015] to-transparent pointer-events-none" />

      <motion.div style={{ opacity }} className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs text-cyan-400 font-medium tracking-widest uppercase mb-4 block"
          >
            Why UNIT
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold tracking-tight"
          >
            The DeFi engine that{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              works for you
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground/70 mt-4 max-w-lg mx-auto"
          >
            Most tools make you work for DeFi. UNIT does the opposite.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} i={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
