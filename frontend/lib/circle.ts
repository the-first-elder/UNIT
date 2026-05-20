export const CHAIN_ID_TO_BLOCKCHAIN: Record<string, string> = {
  "1": "ETH",
  "42161": "ARB",
  "10": "OP",
  "8453": "BASE",
  "137": "MATIC",
  "43114": "AVAX",
  "11155111": "ETH-SEPOLIA",
  "5042002": "ARC-TESTNET",
};

export const CHAIN_ID_TO_RPC: Record<string, string> = {
  "1": "https://eth.llamarpc.com",
  "42161": "https://arbitrum.llamarpc.com",
  "10": "https://optimism.llamarpc.com",
  "8453": "https://base.llamarpc.com",
  "137": "https://polygon.llamarpc.com",
  "43114": "https://avalanche.llamarpc.com",
  "11155111": "https://ethereum-sepolia.publicnode.com",
  "5042002": "https://rpc.testnet.arc.network",
};
