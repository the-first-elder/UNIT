"use client";

import { useAppStore } from "@/lib/store";
import { useChat } from "@/hooks/use-chat";
import { PromptBox } from "@/components/ai/prompt-box";
import { ChatMessageBubble } from "@/components/ai/chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, PanelRightOpen, Sparkles, ArrowDown } from "lucide-react";
import { useEffect, useRef } from "react";

export default function AppPage() {
  const { messages, activeChain, walletAddress, setSidebarOpen, setExecutionPanelOpen, sidebarOpen, executionPanelOpen } = useAppStore();
  const { sendPrompt } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    sendPrompt(text, walletAddress || "0x0000000000000000000000000000000000000000", activeChain.id);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen transition-all duration-200",
        sidebarOpen && "xl:ml-60",
        executionPanelOpen && "2xl:mr-[380px]",
      )}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
              U
            </div>
            <span className="text-sm font-medium">UNIT Terminal</span>
          </div>
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
            <div className="flex flex-col items-center justify-center text-center pt-10 pb-8 space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="text-xl font-bold">Turn 10 USDC into 1000 USDC</h1>
              <p className="text-sm text-muted-foreground max-w-md">
                Tell UNIT your goal and risk tolerance.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 text-xs text-muted-foreground">
                {[
                  "Grow my 10 USDC with low risk",
                  "Turn 100 USDC into 500",
                  "Aggressive: 50 to 2000",
                  "Safe yield on 25 USDC",
                  "Best APY on Arbitrum",
                  "Compound weekly",
                ].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-secondary/50 border border-border/50">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
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
