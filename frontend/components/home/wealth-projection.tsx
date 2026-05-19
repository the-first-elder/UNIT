"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { TrendingUp, ArrowUpRight, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

type RiskLevel = "low" | "moderate" | "high";

export function WealthProjection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const [amount, setAmount] = useState<number>(1000);
  const [risk, setRisk] = useState<RiskLevel>("moderate");

  const data = useMemo(() => {
    const list = [];
    let value = amount;
    
    // Growth factors (APY) and volatility factors
    const config = {
      low: { apy: 0.085, vol: 0.005 },
      moderate: { apy: 0.22, vol: 0.02 },
      high: { apy: 0.65, vol: 0.08 },
    }[risk];

    for (let i = 0; i < 24; i++) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[i % 12];
      const label = i === 0 ? "Now" : i === 23 ? "Year 2" : `${month}`;
      
      // Calculate monthly compounding with volatility
      const baseMonthlyRate = config.apy / 12;
      const volatility = (Math.random() - 0.45) * config.vol;
      const growth = 1 + baseMonthlyRate + volatility;
      
      value = Math.max(10, Math.round(value * growth));
      list.push({ month: label, value });
    }
    return list;
  }, [amount, risk]);

  const startVal = data[0]?.value || amount;
  const endVal = data[data.length - 1]?.value || amount * 1.5;
  const growth = Math.round(((endVal - startVal) / startVal) * 100);

  const riskBadgeColor = {
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    moderate: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    high: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  }[risk];

  return (
    <section ref={ref} className="py-28 px-6 relative">
      <motion.div style={{ y }} className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs text-emerald-500 font-semibold tracking-widest uppercase mb-3 block"
          >
            Wealth projection
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground"
          >
            See your capital{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              compound automatically
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl border-border/40 p-6 space-y-6 lg:h-full flex flex-col justify-between"
          >
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                Projection Parameters
              </h3>

              {/* Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Initial Deposit</span>
                  <span className="text-foreground font-mono font-bold">${amount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground/50 font-mono">
                  <span>$100</span>
                  <span>$5,000</span>
                  <span>$10,000</span>
                </div>
              </div>

              {/* Risk selector */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground block">Risk Strategy</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "moderate", "high"] as RiskLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setRisk(level)}
                      className={`py-2 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                        risk === level
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10"
                          : "bg-secondary/40 text-muted-foreground border-border/40 hover:bg-secondary/80 hover:text-foreground"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="bg-secondary/30 rounded-2xl p-4 border border-border/30 mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold">
                {risk === "low" && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                {risk === "moderate" && <Zap className="h-4 w-4 text-blue-500" />}
                {risk === "high" && <ShieldAlert className="h-4 w-4 text-purple-500" />}
                <span className="capitalize">{risk} Risk Strategy</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {risk === "low" && "Focuses on established stablecoin lending protocols (Aave, Morpho). APY is extremely steady with close to zero principal risk."}
                {risk === "moderate" && "Allocates across yield farming, LP pools, and delta-neutral compounding. Targets higher yields with mild market volatility."}
                {risk === "high" && "Aggressive allocation including automated leveraged loops, new launch vaults, and dynamic asset swings. Maximum growth potential, higher volatility."}
              </p>
            </div>
          </motion.div>

          {/* Graph Display */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 glass rounded-3xl border-border/40 p-6 md:p-8 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Projected Portfolio Growth</div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold tracking-tight">${endVal.toLocaleString()}</span>
                  <span className={`flex items-center gap-0.5 text-xs font-mono font-bold rounded-full px-2.5 py-0.5 border ${riskBadgeColor}`}>
                    <ArrowUpRight className="h-3 w-3" />
                    +{growth}%
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border/30">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                Compounding monthly
              </div>
            </div>

            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(v: number) => `$${v.toLocaleString()}`}
                    domain={["dataMin - 100", "dataMax + 100"]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(18, 18, 20, 0.7)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fafafa",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                    }}
                    itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#wealthGradient)"
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/40">
              {[
                { label: "Initial deposit", value: `$${startVal.toLocaleString()}`, color: "text-muted-foreground" },
                { label: "Projected value", value: `$${endVal.toLocaleString()}`, color: "text-emerald-500 font-bold" },
                { label: "Total return", value: `+${growth}%`, color: "text-green-500 font-bold" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{s.label}</div>
                  <div className={`text-base font-bold mt-0.5 ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
