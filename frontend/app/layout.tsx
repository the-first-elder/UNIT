import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "UNIT — Autonomous DeFi Execution",
  description:
    "UNIT researches, allocates, optimizes, and executes DeFi strategies in real time. One prompt. Instant execution. Full transparency.",
  openGraph: {
    title: "UNIT — Autonomous DeFi Execution",
    description: "AI-powered DeFi strategy execution engine.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
