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
