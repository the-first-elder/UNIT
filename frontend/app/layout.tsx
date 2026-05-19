import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNIT — Autonomous DeFi Execution",
  description:
    "UNIT researches, allocates, optimizes, and executes DeFi strategies in real time. One prompt. Instant execution. Full transparency.",
  openGraph: {
    title: "UNIT — Autonomous DeFi Execution",
    description: "AI-powered DeFi strategy execution engine.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
