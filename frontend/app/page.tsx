import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/hooks/use-theme";
import { Hero } from "@/components/home/hero";
import { LiveDemo } from "@/components/home/live-demo";
import { Stats } from "@/components/home/stats";
import { WealthProjection } from "@/components/home/wealth-projection";
import { Features } from "@/components/home/features";
import { HowItWorks } from "@/components/home/how-it-works";
import { Protocols } from "@/components/home/protocols";
import { Security } from "@/components/home/security";
import { CTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <ThemeProvider>
      <Providers>
        <main className="min-h-screen bg-background">
          <Hero />
          <Stats />
          <LiveDemo />
          <WealthProjection />
          <HowItWorks />
          <Features />
          <Protocols />
          <Security />
          <CTA />

          <footer className="border-t border-border/40 py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="relative h-7 w-7">
                      <div className="absolute inset-0 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 opacity-80 blur-sm" />
                      <div className="relative h-full w-full rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                        U
                      </div>
                    </div>
                    <span className="font-semibold text-sm">UNIT</span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-xs">
                    Autonomous DeFi execution engine. Describe what you want — UNIT researches,
                    allocates, and executes across every EVM chain.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-4 text-foreground/80">Product</h4>
                  <ul className="space-y-2.5 text-xs text-muted-foreground/60">
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Terminal</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Strategies</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Execution</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Pricing</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-4 text-foreground/80">Chains</h4>
                  <ul className="space-y-2.5 text-xs text-muted-foreground/60">
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Ethereum</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Arbitrum</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Base</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Optimism</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Polygon</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Avalanche</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-4 text-foreground/80">Resources</h4>
                  <ul className="space-y-2.5 text-xs text-muted-foreground/60">
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Docs</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">GitHub</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">X / Twitter</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Discord</li>
                    <li className="hover:text-foreground/80 transition-colors cursor-pointer">Blog</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/40">
                <div>
                  &copy; {new Date().getFullYear()} UNIT — Autonomous DeFi Execution
                </div>
                <div className="flex gap-6">
                  <span className="hover:text-foreground/60 transition-colors cursor-pointer">Terms</span>
                  <span className="hover:text-foreground/60 transition-colors cursor-pointer">Privacy</span>
                  <span className="hover:text-foreground/60 transition-colors cursor-pointer">Security</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </Providers>
    </ThemeProvider>
  );
}
