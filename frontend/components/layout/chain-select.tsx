"use client";

import { useAppStore } from "@/lib/store";
import { SUPPORTED_CHAINS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChainSelect() {
  const { activeChain, setActiveChain } = useAppStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between gap-2 h-8 text-xs"
        >
          <span>{activeChain.icon} {activeChain.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {SUPPORTED_CHAINS.map((chain) => (
          <DropdownMenuItem
            key={chain.id}
            onClick={() => setActiveChain(chain)}
            className="gap-2"
          >
            <span>{chain.icon}</span>
            <span>{chain.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {chain.shortName}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
