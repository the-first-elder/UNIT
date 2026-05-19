"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, Globe, Zap, Shield } from "lucide-react";

const stats = [
  { value: 7, suffix: "+", label: "Data Sources", sub: "yields · sentiment · risk", icon: Globe },
  { value: 6, suffix: "", label: "Chains", sub: "Ethereum · Arbitrum · Base · more", icon: Zap },
  { value: 5, suffix: "s", label: "Response Time", sub: "prompt to execution plan", icon: TrendingUp },
  { value: 100, suffix: "%", label: "On-Chain", sub: "every transaction verifiable", icon: Shield },
];

function AnimatedNumber({ target, suffix, delay }: { target: number; suffix: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const steps = 30;
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
    <div ref={ref} className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent mb-1 tabular-nums">
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
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [3, 0, -3]);

  return (
    <section ref={ref} className="py-28 px-6 relative perspective-[800px]">
      <motion.div style={{ y, rotateX }} className="max-w-5xl mx-auto">
        <div className="glass rounded-3xl border-border/40 p-10 md:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-cyan-500/3 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -4 }}
                  className="text-center group"
                >
                  <div className="flex justify-center mb-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-300">
                      <Icon className="h-5 w-5 text-blue-400/60 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} delay={i * 0.15} />
                  <div className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium mt-0.5">
                    {stat.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground/40 mt-0.5">
                    {stat.sub}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
