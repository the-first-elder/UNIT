"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Search, Code, Zap, CheckCircle } from "lucide-react";

const stages = [
  { icon: MessageSquare, label: "You type a prompt", desc: "\"Turn 500 USDC into yield\"", color: "text-blue-400", border: "border-blue-500/20" },
  { icon: Search, label: "AI researches", desc: "7+ data sources scanned", color: "text-indigo-400", border: "border-indigo-500/20" },
  { icon: Code, label: "Plan encoded", desc: "ABI-ready transactions", color: "text-cyan-400", border: "border-cyan-500/20" },
  { icon: Zap, label: "You execute", desc: "One click · Sequential or parallel", color: "text-emerald-400", border: "border-emerald-500/20" },
];

export function ExecutionFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.015] to-transparent pointer-events-none" />
      <motion.div style={{ opacity }} className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs text-cyan-400 font-medium tracking-widest uppercase mb-4 block"
          >
            Execution pipeline
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold tracking-tight"
          >
            From thought to{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              on-chain
            </span>
          </motion.h2>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[32px] top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/30 via-cyan-500/30 to-emerald-500/30 hidden md:block" />

          <div className="space-y-8">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative pl-16 md:pl-20"
              >
                {/* Step number */}
                <div className={`absolute left-0 top-0 h-16 w-16 rounded-2xl border ${stage.border} bg-card flex items-center justify-center`}>
                  <stage.icon className={`h-6 w-6 ${stage.color}`} />
                </div>

                <div className="glass rounded-2xl p-5 border-border/40 ml-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground/50">Step 0{i + 1}</span>
                    <div className="h-px flex-1 bg-border/20" />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                    >
                      <CheckCircle className={`h-3.5 w-3.5 ${stage.color}`} />
                    </motion.div>
                  </div>
                  <h3 className="font-semibold text-lg tracking-tight">{stage.label}</h3>
                  <p className="text-sm text-muted-foreground/70 mt-0.5">{stage.desc}</p>

                  {/* Mini progress bar */}
                  <div className="mt-3 h-1 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${i <= 1 ? "bg-blue-500" : i <= 2 ? "bg-cyan-500" : "bg-emerald-500"}`}
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 1 + i * 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
