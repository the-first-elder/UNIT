"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCircleSocialWallet } from "@/hooks/use-circle-social-wallet";

type SocialWalletValue = ReturnType<typeof useCircleSocialWallet>;

const SocialWalletContext = createContext<SocialWalletValue | null>(null);

export function SocialWalletProvider({ children }: { children: ReactNode }) {
  const wallet = useCircleSocialWallet();
  return (
    <SocialWalletContext.Provider value={wallet}>
      {children}
    </SocialWalletContext.Provider>
  );
}

export function useSocialWallet(): SocialWalletValue {
  const ctx = useContext(SocialWalletContext);
  if (!ctx) throw new Error("useSocialWallet must be used within SocialWalletProvider");
  return ctx;
}
