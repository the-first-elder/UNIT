#!/bin/bash
# ERC-8004 Setup Script — creates validator wallet + registers UNIT agent
# Usage: ./scripts/setup-erc8004.sh <base_url>
# Example: ./scripts/setup-erc8004.sh http://localhost:3000

BASE=${1:-http://localhost:3000}

echo "═══ ERC-8004 Setup ═══"
echo ""

# Step 1: Create validator wallet
echo "── Step 1: Creating validator wallet ──"
WALLET_RESP=$(curl -s -X POST "$BASE/api/erc8004" \
  -H "Content-Type: application/json" \
  -d '{"action":"createValidatorWallet"}')
echo "$WALLET_RESP" | jq .

WALLET_ID=$(echo "$WALLET_RESP" | jq -r '.walletId')
WALLET_ADDR=$(echo "$WALLET_RESP" | jq -r '.address')

if [ "$WALLET_ID" = "null" ] || [ -z "$WALLET_ID" ]; then
  echo "ERROR: Failed to create wallet"
  echo "$WALLET_RESP"
  exit 1
fi

echo ""
echo "Wallet created: $WALLET_ADDR ($WALLET_ID)"
echo ""

# Step 2: Register UNIT agent
echo "── Step 2: Registering UNIT agent ──"
REG_RESP=$(curl -s -X POST "$BASE/api/erc8004" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"registerAgent\",\"walletId\":\"$WALLET_ID\"}")
echo "$REG_RESP" | jq .

TX_HASH=$(echo "$REG_RESP" | jq -r '.txHash')
STATE=$(echo "$REG_RESP" | jq -r '.state')

if [ "$STATE" = "COMPLETE" ]; then
  echo ""
  echo "UNIT agent registered!"
  echo "Tx: https://testnet.arcscan.app/tx/$TX_HASH"
  echo ""
  echo "═══ Setup Complete ═══"
  echo "Validator Wallet: $WALLET_ADDR ($WALLET_ID)"
  echo "Note: Save wallet ID — you'll need it for recordReputation calls"
else
  echo "Registration state: $STATE"
  echo "You may need to fund the wallet from faucet first: https://faucet.circle.com/"
fi
