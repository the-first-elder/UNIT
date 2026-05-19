"use client";

import { motion, AnimatePresence } from "framer-motion";

const reasoningSteps = [
  "Analyzing market conditions...",
  "Scanning yield opportunities...",
  "Evaluating risk profiles...",
  "Computing optimal allocations...",
  "Building execution plan...",
  "Validating transactions...",
];

interface Props {
  isStreaming: boolean;
  step?: number;
}

export function StreamingReasoning({ isStreaming, step = 0 }: Props) {
  return (
    <AnimatePresence>
      {isStreaming && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-1.5 py-2"
        >
          {reasoningSteps.slice(0, Math.min(step + 1, reasoningSteps.length)).map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.3 }}
              className="flex items-center gap-2 text-xs"
            >
              {i === Math.min(step, reasoningSteps.length - 1) ? (
                <span className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-green-400/50" />
              )}
              <span className={i === Math.min(step, reasoningSteps.length - 1) ? "text-foreground" : "text-muted-foreground"}>
                {s}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
