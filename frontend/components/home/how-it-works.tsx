"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { MessageSquare, Search, Route, TrendingUp } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    icon: MessageSquare,
    title: "Say what you want",
    description: '"Turn 500 USDC into the best yield" or "Find high upside AI tokens." Plain English works.',
    gradient: "from-blue-500/20 to-blue-600/10",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-400",
    stat: "1 prompt",
  },
  {
    icon: Search,
    title: "AI finds the edge",
    description: "Scans yields, sentiment, liquidity, and risk across 7+ data sources to find your best play.",
    gradient: "from-indigo-500/20 to-indigo-600/10",
    borderColor: "border-indigo-500/20",
    iconColor: "text-indigo-400",
    stat: "7 sources",
  },
  {
    icon: Route,
    title: "Plan is optimized",
    description: "Allocations, approvals, swaps, deposits — every step computed and encoded for execution.",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    borderColor: "border-cyan-500/20",
    iconColor: "text-cyan-400",
    stat: "auto-planned",
  },
  {
    icon: TrendingUp,
    title: "Your money grows",
    description: "Execute sequentially or in parallel. Track everything on-chain with full transparency.",
    gradient: "from-emerald-500/20 to-emerald-600/10",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    stat: "real returns",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.02] to-transparent pointer-events-none" />

      <motion.div style={{ opacity }} className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs text-blue-400 font-medium tracking-widest uppercase mb-4 block"
          >
            How it works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight"
          >
            From intent to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              income
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mt-4 max-w-xl mx-auto"
          >
            Four steps between you and better returns. No dashboards. No complexity.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -6 }}
              className="group relative"
            >
              <div className={`glass rounded-2xl p-7 h-full border ${step.borderColor} hover:border-opacity-40 transition-all duration-500 relative overflow-hidden`}>
                {/* Hover shimmer */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, transparent 0%, ${step.iconColor.replace('text-', 'rgba(').replace('-400', ', 0.03)')} 50%, transparent 100%)`,
                  }}
                />

                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${step.gradient} border border-border/50 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-300`}>
                  <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-mono text-muted-foreground/50">0{i + 1}</span>
                  <div className="h-px flex-1 bg-border/30" />
                  <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">{step.stat}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2.5 tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground/70 leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <motion.div
                  className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-muted-foreground/20">
                    <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
