"use client";

import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/hooks/use-theme";
import { SocialWalletProvider } from "@/components/wallet/wallet-context";
import { Sidebar } from "@/components/layout/sidebar";
import { ExecutionPanel } from "@/components/layout/execution-panel";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SocialWalletProvider>
        <Providers>
          <div className="min-h-screen bg-background">
            <Sidebar />
            {children}
            <ExecutionPanel />
          </div>
        </Providers>
      </SocialWalletProvider>
    </ThemeProvider>
  );
}
