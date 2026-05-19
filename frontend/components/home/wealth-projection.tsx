"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

function generateData() {
  const data = [];
  let value = 1000;
  for (let i = 0; i < 24; i++) {
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i % 12];
    const year = 2025 + Math.floor(i / 12);
    const label = i === 0 ? "Now" : i === 23 ? "Year 2" : `${month}`;
    const growth = 1 + (Math.random() * 0.04 + 0.025);
    value = Math.round(value * growth);
    data.push({ month: label, value });
  }
  return data;
}

export function WealthProjection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const data = useMemo(generateData, []);
  const startVal = data[0]?.value || 1000;
  const endVal = data[data.length - 1]?.value || 3000;
  const growth = Math.round(((endVal - startVal) / startVal) * 100);

  return (
    <section ref={ref} className="py-28 px-6 relative">
      <motion.div style={{ y }} className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs text-emerald-400 font-medium tracking-widest uppercase mb-4 block"
          >
            Wealth projection
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold tracking-tight"
          >
            See your capital{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              compound
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl border-border/40 p-6 md:p-8 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Projected Portfolio Growth</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">${endVal.toLocaleString()}</span>
                <span className="flex items-center gap-0.5 text-sm text-green-400 bg-green-500/10 rounded-full px-2.5 py-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +{growth}%
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Compounding monthly
            </div>
          </div>

          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  domain={["dataMin - 500", "dataMax + 500"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#121214",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#wealthGradient)"
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/40">
            {[
              { label: "Initial deposit", value: `$${startVal.toLocaleString()}`, color: "text-muted-foreground" },
              { label: "Projected value", value: `$${endVal.toLocaleString()}`, color: "text-green-400" },
              { label: "Total return", value: `+${growth}%`, color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{s.label}</div>
                <div className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
