"use client";

import { useAppStore } from "@/lib/store";
import { useChat } from "@/hooks/use-chat";
import { PromptBox } from "@/components/ai/prompt-box";
import { ChatMessageBubble } from "@/components/ai/chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Menu, PanelRightOpen, Sparkles, ArrowDown, Rocket, Zap, Flame, Crosshair } from "lucide-react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AppPage() {
  const { messages, activeChain, walletAddress, setSidebarOpen, setExecutionPanelOpen, sidebarOpen, executionPanelOpen } = useAppStore();
  const { sendPrompt } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const promptParam = params.get("prompt");
      if (promptParam && messages.length === 0) {
        // Auto connect simulator wallet to fast track user experience
        if (!useAppStore.getState().walletAddress) {
          useAppStore.getState().setWallet("0xUNIT30026e631259504795a2a4afc84bd23adb13", "simulator");
        }
        
        // Grab updated address
        const activeAddr = useAppStore.getState().walletAddress || "0xUNIT30026e631259504795a2a4afc84bd23adb13";
        sendPrompt(promptParam, activeAddr, activeChain.id);
        
        // Clear params to avoid triggering on manual refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [messages.length, activeChain.id, sendPrompt]);

  const handleSend = (text: string) => {
    sendPrompt(text, walletAddress || "0x0000000000000000000000000000000000000000", activeChain.id);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen transition-all duration-200",
        sidebarOpen && "lg:ml-[240px]",
        executionPanelOpen && "lg:mr-[380px]",
      )}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border/50 bg-background/60 backdrop-blur-xl z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.05)] group-hover:border-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all overflow-hidden">
              <Image src="/icon.svg" alt="UNIT" width={20} height={20} className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">UNIT Terminal</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!executionPanelOpen && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setExecutionPanelOpen(true)}
            >
              <PanelRightOpen className="h-3.5 w-3.5" />
              Execution
            </Button>
          )}
        </div>
      </header>

      {/* Chat area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center pt-16 pb-12">
              <div className="relative mb-8">
                {/* Radar/Pulse effects */}
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
                <div className="absolute -inset-4 rounded-full border border-blue-500/20 animate-[spin_4s_linear_infinite] opacity-50" />
                <div className="absolute -inset-8 rounded-full border border-cyan-500/10 animate-[spin_6s_linear_infinite_reverse] opacity-50" />
                
                <div className="relative h-20 w-20 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl" />
                  <Sparkles className="h-8 w-8 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse" />
                </div>
              </div>
              
              <h1 className="text-3xl font-black tracking-tight mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Initialize</span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">UNIT</span>
              </h1>
              <p className="text-sm text-zinc-500 max-w-md mb-8 leading-relaxed">
                Describe your financial goal, risk tolerance, and starting capital. The autonomous engine will execute the optimal path.
              </p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative z-20 w-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
                  {[
                    { title: "100x Leverage Loop", desc: "Max loop $100 USDC into the highest yield on Base", icon: Rocket, color: "text-rose-400", bg: "bg-rose-500/10", border: "group-hover:border-rose-500/50" },
                    { title: "Degen Flip", desc: "How can I turn $10 into $1,000 using flash loans?", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "group-hover:border-amber-500/50" },
                    { title: "Ape Mode", desc: "Find the highest risk/reward meme-coin staking pool", icon: Flame, color: "text-red-400", bg: "bg-red-500/10", border: "group-hover:border-red-500/50" },
                    { title: "Arbitrage Hunt", desc: "Scan for cross-chain stablecoin de-pegs to exploit", icon: Crosshair, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "group-hover:border-cyan-500/50" }
                  ].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(`${s.title}: ${s.desc}`)}
                      className={`group text-left p-4 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-zinc-800/60 hover:shadow-lg ${s.border}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${s.bg}`}>
                          <s.icon className={`h-4 w-4 ${s.color}`} />
                        </div>
                        <span className="font-bold text-zinc-200 group-hover:text-white transition-colors">{s.title}</span>
                      </div>
                      <p className="text-xs text-zinc-500 group-hover:text-zinc-400 pl-11 transition-colors leading-relaxed">
                        {s.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} mode="chat" />
          ))}

          {messages.length > 3 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                <ArrowDown className="h-3 w-3" />
                Latest
              </Button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Prompt input */}
      <div className="border-t border-border p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <PromptBox onSend={handleSend} />
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="text-[10px] text-muted-foreground/50">
              {walletAddress ? `Connected · ${activeChain.shortName}` : "Connect wallet to execute"}
            </div>
            <div className="text-[10px] text-muted-foreground/50">
              Powered by AI · Multi-chain
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
