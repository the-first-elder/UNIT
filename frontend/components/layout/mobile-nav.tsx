"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Menu } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function MobileNav() {
  const { setSidebarOpen } = useAppStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[8px] font-bold text-white">
            U
          </div>
          <span className="text-xs font-medium">UNIT</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
