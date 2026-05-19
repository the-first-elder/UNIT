"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, Globe, Zap, Shield } from "lucide-react";

const stats = [
  { value: 7, suffix: "+", label: "Data Sources", sub: "Yields, sentiment, risk", icon: Globe, color: "from-blue-400 to-blue-600", shadow: "shadow-blue-500/20" },
  { value: 6, suffix: "", label: "EVM Chains", sub: "Ethereum, Arbitrum, Base...", icon: Zap, color: "from-cyan-400 to-cyan-600", shadow: "shadow-cyan-500/20" },
  { value: 5, suffix: "s", label: "Response Time", sub: "Prompt to execution plan", icon: TrendingUp, color: "from-emerald-400 to-emerald-600", shadow: "shadow-emerald-500/20" },
  { value: 100, suffix: "%", label: "On-Chain", sub: "Fully transparent tracking", icon: Shield, color: "from-indigo-400 to-indigo-600", shadow: "shadow-indigo-500/20" },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="text-5xl md:text-6xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent mb-2 tabular-nums tracking-tighter drop-shadow-xl">
      {count}{suffix}
    </div>
  );
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section id="stats" ref={ref} className="py-32 px-6 relative bg-[#030305]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[300px] bg-blue-500/10 blur-[120px] rounded-[100%] pointer-events-none" />

      <motion.div style={{ y }} className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 80, damping: 20 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group relative bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 overflow-hidden ${stat.shadow}`}
              >
                {/* Glow behind the card on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${stat.color} p-[1px] group-hover:scale-110 transition-transform duration-500`}>
                    <div className="w-full h-full bg-zinc-950/90 rounded-2xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white/80 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-white/20 group-hover:bg-white/80 transition-colors" />
                </div>

                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mt-4">
                  {stat.label}
                </h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  {stat.sub}
                </p>

                {/* Animated corner accent */}
                <div className={`absolute -bottom-1 -right-1 w-16 h-16 bg-gradient-to-tl ${stat.color} blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700`} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
