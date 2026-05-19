"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Mic, Square } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSend: (text: string) => void;
  placeholder?: string;
}

const quickActions = [
  "Safe yield on USDC",
  "AI tokens with momentum",
  "Stablecoin farming",
  "Cross-chain arbitrage",
  "Bridge to Base",
  "Meme momentum",
];

export function PromptBox({ onSend, placeholder = "Ask UNIT to execute a strategy..." }: Props) {
  const [text, setText] = useState("");
  const [showActions, setShowActions] = useState(true);
  const { isProcessing } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!text.trim() || isProcessing) return;
    onSend(text.trim());
    setText("");
    setShowActions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showActions && text.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3"
          >
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    setText(action);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center glass rounded-2xl border border-border/50 focus-within:border-blue-500/30 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300">
        <div className="pl-4 pr-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
        </div>

        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isProcessing}
          className="flex-1 border-0 bg-transparent h-12 pl-2 pr-2 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <div className="flex items-center gap-1 pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Mic className="h-4 w-4" />
          </Button>

          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button disabled size="icon" className="h-9 w-9">
                  <Square className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  size="icon"
                  className="h-9 w-9 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md shadow-blue-500/20"
                  onClick={handleSend}
                  disabled={!text.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
