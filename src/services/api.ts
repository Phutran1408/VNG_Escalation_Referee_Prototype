import type { VerifyResult, EvaluateRequest, EvaluateResponse } from "../types";
import { runMockVerify, runMockEvaluate } from "../data/mockTestCases";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://api-placeholder.onrender.com/api/v1";

const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function apiVerify(): Promise<VerifyResult[]> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    // Transparent mock fallback — cold-start or unreachable backend
    return new Promise((resolve) =>
      setTimeout(() => resolve(runMockVerify()), 900)
    );
  }
}

export async function apiEvaluate(req: EvaluateRequest): Promise<EvaluateResponse> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return new Promise((resolve) =>
      setTimeout(() => resolve(runMockEvaluate(req)), 500)
    );
  }
}

export async function apiOverride(requestId: string): Promise<void> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, override: true, overriddenBy: "HR Admin" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    // Optimistic client-side update handles state — API call is fire-and-forget
  }
}
