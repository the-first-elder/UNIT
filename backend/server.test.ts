import { describe, it, expect } from "vitest";

// inline the replaceUserAddress and comment-stripping logic for testing
function replaceUserAddress(obj: unknown, addr: string): unknown {
  if (typeof obj === "string") return obj.replace(/\{\{userAddress\}\}/g, addr);
  if (Array.isArray(obj))
    return obj.map((item) => replaceUserAddress(item, addr));
  if (obj && typeof obj === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      o[k] = replaceUserAddress(v, addr);
    }
    return o;
  }
  return obj;
}

function stripComments(raw: string): string {
  return raw
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

function extractJson(raw: string): string {
  const clean = stripComments(raw);
  return clean.startsWith("```")
    ? clean.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")
    : clean;
}

describe("replaceUserAddress", () => {
  it("replaces {{userAddress}} in strings", () => {
    expect(replaceUserAddress("hello {{userAddress}}", "0xABC")).toBe("hello 0xABC");
  });

  it("replaces in nested objects", () => {
    const obj = {
      receiver: "{{userAddress}}",
      args: { owner: "{{userAddress}}" },
    };
    const result = replaceUserAddress(obj, "0xDEAD") as typeof obj;
    expect(result.receiver).toBe("0xDEAD");
    expect((result.args as Record<string, string>).owner).toBe("0xDEAD");
  });

  it("replaces in arrays", () => {
    const arr = ["{{userAddress}}", "static"];
    const result = replaceUserAddress(arr, "0x123") as string[];
    expect(result[0]).toBe("0x123");
    expect(result[1]).toBe("static");
  });

  it("does not modify unrelated strings", () => {
    expect(replaceUserAddress("hello world", "0xABC")).toBe("hello world");
  });
});

describe("comment stripping", () => {
  it("strips single-line comments", () => {
    const result = stripComments('"amount": "5000000",  // 5 USDC');
    expect(result).toBe('"amount": "5000000",  ');
  });

  it("strips multi-line comments", () => {
    const result = stripComments('"key": /* comment */ "value"');
    expect(result).toBe('"key":  "value"');
  });

  it("strips markdown code fences", () => {
    const raw = "```json\n{\"key\": \"value\"}\n```";
    expect(extractJson(raw)).toBe("{\"key\": \"value\"}");
  });

  it("passes clean JSON through", () => {
    expect(extractJson('{"key":"value"}')).toBe('{"key":"value"}');
  });
});

describe("hex address validation (as used in encodeSteps tryEncode)", () => {
  const isValidHexAddr = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s);

  it("accepts valid USDC address", () => {
    expect(isValidHexAddr("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")).toBe(true);
  });

  it("accepts real vault address", () => {
    expect(isValidHexAddr("0xcBC9B61177444A793B85442D3a953B90f6170b7D")).toBe(true);
  });

  it("rejects 0xVaultAddressFromMorpho", () => {
    expect(isValidHexAddr("0xVaultAddressFromMorpho")).toBe(false);
  });

  it("rejects 0xLiFiRouterAddressFromQuote", () => {
    expect(isValidHexAddr("0xLiFiRouterAddressFromQuote")).toBe(false);
  });

  it("rejects 0xClearstarVaultAddressPlaceholder", () => {
    expect(isValidHexAddr("0xClearstarVaultAddressPlaceholder")).toBe(false);
  });

  it("rejects {{placeholder}}", () => {
    expect(isValidHexAddr("{{approvalAddress_from_quote}}")).toBe(false);
  });

  it("rejects short address", () => {
    expect(isValidHexAddr("0x1234")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidHexAddr("")).toBe(false);
  });
});

describe("amount validation", () => {
  const isValidAmount = (s: string) => /^\d+$/.test(s);

  it("accepts numeric string", () => {
    expect(isValidAmount("10000000")).toBe(true);
  });

  it("accepts zero", () => {
    expect(isValidAmount("0")).toBe(true);
  });

  it("rejects FULL_BALANCE", () => {
    expect(isValidAmount("FULL_BALANCE")).toBe(false);
  });

  it("rejects text with numbers", () => {
    expect(isValidAmount("100ABC")).toBe(false);
  });
});

describe("approve-spender matching", () => {
  function checkApproveMatch(steps: Array<{ action: string; args?: { spender?: string }; contractAddress?: string; strategy?: string }>): string[] {
    const warnings: string[] = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.action === "approve" && i + 1 < steps.length) {
        const next = steps[i + 1];
        if (step.args?.spender && next.contractAddress && step.args.spender.toLowerCase() !== next.contractAddress.toLowerCase() && step.strategy !== "speculation" && step.strategy !== "swap") {
          warnings.push(`Mismatch at step ${i + 1}: spender ${step.args.spender} vs next ${next.contractAddress}`);
        }
      }
    }
    return warnings;
  }

  it("passes when approve spender matches next deposit", () => {
    const steps = [
      { action: "approve", args: { spender: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" }, strategy: "vault" },
      { action: "deposit", contractAddress: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
    ];
    expect(checkApproveMatch(steps)).toEqual([]);
  });

  it("catches approve spender mismatch", () => {
    const steps = [
      { action: "approve", args: { spender: "0x1234" }, strategy: "vault" },
      { action: "deposit", contractAddress: "0xABCD" },
    ];
    expect(checkApproveMatch(steps)).toHaveLength(1);
  });

  it("skips check for speculation/swap strategy", () => {
    const steps = [
      { action: "approve", args: { spender: "0x1234" }, strategy: "speculation" },
      { action: "buy", contractAddress: "0xABCD" },
    ];
    expect(checkApproveMatch(steps)).toEqual([]);
  });
});

describe("per-arg validation (address-in-amount detection)", () => {
  const addressArgs = new Set(["spender", "receiver", "owner", "asset", "onBehalfOf", "to"]);
  const amountArgs = new Set(["amount", "assets", "mintAmount", "shares", "redeemTokens", "borrowAmount", "repayAmount"]);

  function checkArg(key: string, val: string): string | null {
    if (addressArgs.has(key)) return null;
    if (amountArgs.has(key) && !/^\d+$/.test(val)) return `Invalid ${key}: must be a numeric amount`;
    if (!/^\d+$/.test(val) && !/^0x[a-fA-F0-9]{40}$/.test(val)) return `Invalid ${key}: not number or address`;
    return null;
  }

  it("passes numeric amount in 'amount' field", () => {
    expect(checkArg("amount", "40000000")).toBeNull();
  });

  it("catches address in 'amount' field", () => {
    expect(checkArg("amount", "0xcBC9B61177444A793B85442D3a953B90f6170b7D")).toBe("Invalid amount: must be a numeric amount");
  });

  it("catches address in 'assets' field", () => {
    expect(checkArg("assets", "0xcBC9B61177444A793B85442D3a953B90f6170b7D")).toBe("Invalid assets: must be a numeric amount");
  });

  it("passes address in 'receiver' field", () => {
    expect(checkArg("receiver", "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2")).toBeNull();
  });

  it("passes address in 'spender' field", () => {
    expect(checkArg("spender", "0x5f18C75AbDAe578b483E5F43f12a39cF75b5D4e1")).toBeNull();
  });

  it("passes numeric 'assets' field", () => {
    expect(checkArg("assets", "40000000")).toBeNull();
  });

  it("rejects garbage in any field", () => {
    expect(checkArg("amount", "FULL_BALANCE")).toBe("Invalid amount: must be a numeric amount");
    expect(checkArg("spender", "FULL_BALANCE")).toBeNull(); // address args are skipped
  });
});

describe("placeholder detection", () => {
  const hasPlaceholder = (s: string) => /<[^>]+>/.test(s);

  it("detects <TRENDING_TOKEN_ADDRESS>", () => {
    expect(hasPlaceholder("<TRENDING_TOKEN_ADDRESS>")).toBe(true);
  });

  it("detects <TOKEN_ADDRESS>", () => {
    expect(hasPlaceholder("<TOKEN_ADDRESS>")).toBe(true);
  });

  it("passes real 0x address", () => {
    expect(hasPlaceholder("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")).toBe(false);
  });

  it("passes known symbol USDC", () => {
    expect(hasPlaceholder("USDC")).toBe(false);
  });

  it("passes empty string", () => {
    expect(hasPlaceholder("")).toBe(false);
  });
});

describe("step type/action mismatch", () => {
  function checkTypeAction(step: { action?: string; type?: string }): string | null {
    if ((step.action === "buy" || step.action === "swap" || step.action === "execute_swap") && step.type !== "lifi") {
      return `"${step.action}" action requires type "lifi" — got "${step.type}"`;
    }
    return null;
  }

  it("passes lifi + buy", () => {
    expect(checkTypeAction({ type: "lifi", action: "buy" })).toBeNull();
  });

  it("passes lifi + swap", () => {
    expect(checkTypeAction({ type: "lifi", action: "swap" })).toBeNull();
  });

  it("catches contract + buy", () => {
    expect(checkTypeAction({ type: "contract", action: "buy" })).toBe('"buy" action requires type "lifi" — got "contract"');
  });

  it("catches contract + execute_swap", () => {
    expect(checkTypeAction({ type: "contract", action: "execute_swap" })).toBe('"execute_swap" action requires type "lifi" — got "contract"');
  });

  it("passes contract + approve", () => {
    expect(checkTypeAction({ type: "contract", action: "approve" })).toBeNull();
  });

  it("passes contract + deposit", () => {
    expect(checkTypeAction({ type: "contract", action: "deposit" })).toBeNull();
  });

  it("passes contract + supply", () => {
    expect(checkTypeAction({ type: "contract", action: "supply" })).toBeNull();
  });
});
