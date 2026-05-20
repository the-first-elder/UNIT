import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function weiToHuman(wei: string, decimals = 6): string {
  if (!wei) return "0";
  const num = BigInt(wei);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const remainder = num % divisor;
  const remainderStr = remainder.toString().padStart(decimals, "0");
  const trimmed = remainderStr.replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole.toString();
}

export function humanToWei(amount: string, decimals = 6): string {
  const [whole, frac = ""] = amount.split(".");
  const padded = frac.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + padded).toString();
}

export function formatApy(apy: string): string {
  const num = parseFloat(apy);
  if (isNaN(num)) return apy;
  return `${num.toFixed(2)}%`;
}

export function explorerUrl(chainId: string, hash: string): string {
  const bases: Record<string, string> = {
    "1": "https://etherscan.io",
    "10": "https://optimistic.etherscan.io",
    "137": "https://polygonscan.com",
    "42161": "https://arbiscan.io",
    "8453": "https://basescan.org",
    "43114": "https://snowtrace.io",
    "5042002": "https://testnet.arcscan.app",
  };
  const base = bases[chainId] || "https://etherscan.io";
  return `${base}/tx/${hash}`;
}

export function chainName(id: string): string {
  const names: Record<string, string> = {
    "1": "Ethereum",
    "10": "Optimism",
    "137": "Polygon",
    "42161": "Arbitrum",
    "8453": "Base",
    "43114": "Avalanche",
    "5042002": "Arc Testnet",
  };
  return names[id] || `Chain ${id}`;
}
