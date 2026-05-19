"use client";

import { motion } from "framer-motion";
import {
  AaveLogo, CompoundLogo, SparkLogo, MorphoLogo,
  EthenaLogo, PendleLogo, CurveLogo, LifiLogo,
  UniswapLogo, BalancerLogo,
} from "./protocol-logos";

const protocols = [
  { name: "Aave", Logo: AaveLogo },
  { name: "Compound", Logo: CompoundLogo },
  { name: "Spark", Logo: SparkLogo },
  { name: "Morpho", Logo: MorphoLogo },
  { name: "Ethena", Logo: EthenaLogo },
  { name: "Pendle", Logo: PendleLogo },
  { name: "Curve", Logo: CurveLogo },
  { name: "LI.FI", Logo: LifiLogo },
  { name: "Uniswap", Logo: UniswapLogo },
  { name: "Balancer", Logo: BalancerLogo },
];

export function Protocols() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs text-muted-foreground font-medium tracking-widest uppercase block mb-3"
          >
            Powered by
          </motion.span>
          <motion.p className="text-sm text-muted-foreground/60 max-w-md mx-auto">
            The best protocols in DeFi, unified under one AI.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {protocols.map((p, i) => {
            const SvgLogo = p.Logo;
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glass rounded-xl p-4 text-center border-border/30 hover:border-blue-500/25 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-default"
              >
                <SvgLogo className="h-9 w-9 mx-auto mb-2.5" />
                <div className="font-semibold text-xs tracking-tight">{p.name}</div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 overflow-hidden"
        >
          <motion.div
            className="flex gap-8 text-[10px] text-muted-foreground/20 uppercase tracking-widest"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...protocols, ...protocols, ...protocols].map((p, i) => (
              <span key={`${p.name}-${i}`} className="shrink-0 flex items-center gap-2">
                <p.Logo className="h-3 w-3" />
                {p.name} ·
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
