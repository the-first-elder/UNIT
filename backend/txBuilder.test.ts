import { describe, it, expect } from "vitest";
import { resolveAddress, encodeIntent, type ExecutionIntent, type EncodedTx } from "./txBuilder.js";

describe("resolveAddress", () => {
  it("returns checksummed address for valid lowercase hex", () => {
    const result = resolveAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
    expect(result).toBe("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  });

  it("returns checksummed address for valid mixed-case hex", () => {
    const result = resolveAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
    expect(result).toBe("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  });

  it("corrects wrong checksum", () => {
    const result = resolveAddress("0xDc00456a9a0dEa6D9A05e6e6c3F0cf8bFFaA1234");
    expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("throws for non-hex string", () => {
    expect(() => resolveAddress("0xClearstarVaultAddressPlaceholder")).toThrow("Invalid address");
  });

  it("throws for short address", () => {
    expect(() => resolveAddress("0x1234")).toThrow("Invalid address");
  });
});

describe("encodeIntent", () => {
  it("encodes erc20 approve", () => {
    const intent: ExecutionIntent = {
      contractType: "erc20",
      contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      functionName: "approve",
      args: { spender: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE", amount: "1000000" },
    };
    const result: EncodedTx = encodeIntent(intent);
    expect(result.to).toBe("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
    expect(result.data).toMatch(/^0x[0-9a-fA-F]+$/);
    expect(result.value).toBe("0x0");
  });

  it("encodes erc4626 deposit", () => {
    const intent: ExecutionIntent = {
      contractType: "erc4626",
      contractAddress: "0xcBC9B61177444A793B85442D3a953B90f6170b7D",
      functionName: "deposit",
      args: { assets: "5000000", receiver: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" },
    };
    const result = encodeIntent(intent);
    expect(result.to).toBe("0xcBC9B61177444A793B85442D3a953B90f6170b7D");
    expect(result.data).toMatch(/^0x[0-9a-fA-F]+$/);
  });

  it("encodes lendingPool supply", () => {
    const intent: ExecutionIntent = {
      contractType: "lendingPool",
      contractAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
      functionName: "supply",
      args: { asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", amount: "4000000", onBehalfOf: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", referralCode: 0 },
    };
    const result = encodeIntent(intent);
    expect(result.data).toMatch(/^0x[0-9a-fA-F]+$/);
  });

  it("encodes cToken mint", () => {
    const intent: ExecutionIntent = {
      contractType: "cToken",
      contractAddress: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
      functionName: "mint",
      args: { mintAmount: "1000000" },
    };
    const result = encodeIntent(intent);
    expect(result.data).toMatch(/^0x[0-9a-fA-F]+$/);
  });

  it("throws for unknown contractType", () => {
    const intent: ExecutionIntent = {
      contractType: "unknown",
      contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      functionName: "approve",
      args: {},
    };
    expect(() => encodeIntent(intent)).toThrow("Unknown contractType");
  });

  it("throws for missing function in ABI", () => {
    const intent: ExecutionIntent = {
      contractType: "erc20",
      contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      functionName: "nonexistent",
      args: {},
    };
    expect(() => encodeIntent(intent)).toThrow("Unknown function");
  });
});
