"use client";

import { useAppStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatMessageBubble } from "@/components/ai/chat-message";
import { X, PanelRightClose, Activity, TrendingUp, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ExecutionPanel() {
  const { executionPanelOpen, setExecutionPanelOpen, messages } = useAppStore();

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const plan = lastAssistantMessage?.executionPlan;
  const response = lastAssistantMessage?.response;

  return (
    <AnimatePresence mode="wait">
      {executionPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
            onClick={() => setExecutionPanelOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed right-0 top-0 z-50 h-full w-full sm:w-[380px] border-l border-border bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col"
          >
          <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Execution</span>
                {plan && (
                  <Badge variant="secondary" className="text-[10px]">
                    {plan.states.filter((s) => s.status === "success").length}/{plan.states.length}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setExecutionPanelOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              {!response && !plan && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center">
                    <PanelRightClose className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/80">No Active Execution</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submit a prompt to see strategy analysis and execution steps.
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Live
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Secure
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Optimized
                    </span>
                  </div>
                </div>
              )}

              {lastAssistantMessage && <ChatMessageBubble message={lastAssistantMessage} mode="panel" />}
            </ScrollArea>

            <div className="p-3 border-t border-border">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Auto-execute</span>
                <span className="text-blue-400">Ready</span>
              </div>
            </div>
          </div>
        </motion.aside>
      </>)}
    </AnimatePresence>
  );
}
