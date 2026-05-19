"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Key, CheckCircle } from "lucide-react";

const items = [
  {
    Icon: Lock,
    title: "Non-Custodial",
    description: "Your funds never leave your wallet. UNIT generates transactions for you to approve and sign.",
    gradient: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    Icon: Eye,
    title: "100% Transparent",
    description: "Every decision, every transaction, every hash — visible on-chain. No black boxes.",
    gradient: "from-blue-500/20 to-blue-600/10",
  },
  {
    Icon: Shield,
    title: "Battle-Tested",
    description: "Integrated protocols are audited by top firms. Your capital stays in battle-hardened contracts.",
    gradient: "from-violet-500/20 to-violet-600/10",
  },
  {
    Icon: Key,
    title: "You Stay in Control",
    description: "Connect with EOA, smart account, or passkey. You sign every transaction. We never hold funds.",
    gradient: "from-orange-500/20 to-orange-600/10",
  },
];

export function Security() {
  return (
    <section className="py-28 px-6 relative">
      <motion.div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs text-emerald-400 font-medium tracking-widest uppercase mb-4 block"
          >
            Peace of mind
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold tracking-tight"
          >
            Your money,{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              your rules
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(({ Icon, title, description, gradient }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative"
            >
              <div className="glass rounded-2xl p-6 border-border/40 h-full hover:border-emerald-500/20 transition-all duration-500 relative overflow-hidden">
                <motion.div
                  className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent)" }}
                />

                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} border border-border/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-300`}>
                  <Icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-2 tracking-tight text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground/70 leading-relaxed">{description}</p>
                <motion.div
                  className="flex items-center gap-1.5 mt-4 text-[10px] text-emerald-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <CheckCircle className="h-3 w-3" />
                  Guaranteed
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
