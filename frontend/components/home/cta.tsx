"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

function GlowRing() {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-blue-500/5"
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.2, 0, 0.2],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function GlowRingInner() {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full border border-cyan-500/8"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.05, 0.3],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
    />
  );
}

export function CTA() {
  return (
    <section className="py-32 px-6 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[160px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <div className="glass rounded-3xl border-blue-500/10 p-12 md:p-16 relative overflow-hidden">
          <GlowRing />
          <GlowRingInner />

          <motion.span
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
          />

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            className="relative"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Your money should be working
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="text-muted-foreground/70 mb-8 max-w-lg mx-auto text-lg leading-relaxed"
          >
            Stop watching from the sidelines. Let UNIT execute the strategies that grow your capital.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link href="/app">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button size="xl" className="gap-2.5 text-base px-8 h-14 rounded-2xl shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 border-0">
                  Start Growing
                  <TrendingUp className="h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground/40 flex-wrap"
          >
            {[
              { label: "No account needed", color: "bg-green-400" },
              { label: "Non-custodial", color: "bg-blue-400" },
              { label: "Open source", color: "bg-cyan-400" },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                {item.label}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
