"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, ChevronDown, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { ParticleNetwork } from "./particle-network";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref, offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  useTheme();
  const [prompt, setPrompt] = useState("");

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      window.location.href = `/app?prompt=${encodeURIComponent(prompt.trim())}`;
    } else {
      window.location.href = "/app";
    }
  };

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-[#030305] text-white">
      {/* Dynamic Backgrounds */}
      <ParticleNetwork />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] right-[20%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/10 blur-[150px]" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Top App Link */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          onClick={() => window.location.href = '/app'}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md rounded-full px-6 shadow-[0_0_15px_rgba(255,255,255,0.05)] font-semibold transition-all"
        >
          Launch App <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <motion.div style={{ opacity, y, scale }} className="relative z-20 text-center max-w-5xl mx-auto px-6 w-full mt-10">
        
        {/* Massive Project Name */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-8xl sm:text-[9rem] md:text-[12rem] lg:text-[16rem] font-black tracking-tighter leading-[0.8] mb-6"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            UNIT
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl sm:text-3xl text-blue-400 max-w-2xl mx-auto mb-12 font-medium tracking-wide"
        >
          Autonomous DeFi Execution
        </motion.p>

        {/* Interactive Prompt Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-2xl mx-auto w-full relative z-30"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <form
            onSubmit={handlePromptSubmit}
            className="relative flex flex-col sm:flex-row gap-2 bg-zinc-950/80 border border-white/10 p-2.5 rounded-3xl shadow-2xl backdrop-blur-xl"
          >
            <div className="flex-1 flex items-center px-4">
              <Zap className="h-5 w-5 text-blue-400 mr-3 animate-pulse" />
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                type="text"
                placeholder="Ask UNIT to execute a strategy..."
                className="w-full bg-transparent text-white placeholder:text-zinc-600 text-lg focus:outline-none focus:ring-0 h-12"
              />
            </div>
            <Button
              type="submit"
              className="group h-12 px-8 bg-blue-600 text-white hover:bg-blue-500 rounded-2xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center gap-2"
            >
              Initialize
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

        </motion.div>

      </motion.div>

      {/* Bottom Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <a href="#stats" className="flex flex-col items-center gap-2 cursor-pointer group">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold group-hover:text-white transition-colors">Discover</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
}
