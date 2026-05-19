import { http, createConfig } from "wagmi";
import { mainnet, arbitrum, optimism, base, polygon, avalanche, arcTestnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "";

export function getWagmiConfig() {
  const connectors = [injected()];

  if (typeof window !== "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { coinbaseWallet } = require("wagmi/connectors");
      connectors.push(coinbaseWallet({ appName: "UNIT" }));
    } catch {
      // ignore
    }
    if (projectId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { walletConnect } = require("wagmi/connectors");
        connectors.push(walletConnect({ projectId }));
      } catch {
        // ignore
      }
    }
  }

  return createConfig({
    chains: [mainnet, arbitrum, optimism, base, polygon, avalanche, arcTestnet] as const,
    connectors,
    transports: {
      [mainnet.id]: http(),
      [arbitrum.id]: http(),
      [optimism.id]: http(),
      [base.id]: http(),
      [polygon.id]: http(),
      [avalanche.id]: http(),
      [arcTestnet.id]: http(),
    },
  });
}
