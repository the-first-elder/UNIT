import type { PromptResponse, ExecutionStep } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function submitPrompt(
  userPrompt: string,
  userWallet: string,
  chainId: string
): Promise<PromptResponse> {
  const res = await fetch(`${API_BASE}/v1/begin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userPrompt, userWallet, chainId }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.message;
}

export function stepsFromResponse(steps?: ExecutionStep[]): ExecutionStep[] {
  if (!steps) return [];
  return steps.filter((s) => !s.error);
}
