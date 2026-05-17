// Thin typed fetch client for the HeartHealth FastAPI backend.
// All endpoints live under VITE_API_URL/api (default: http://localhost:8000).

import type {
  BarcodeLookupResult,
  ChatResponse,
  FullState,
  MealLogRequest,
  NutritionToday,
  ProfilePatch,
} from "./types";

const API_URL = (import.meta.env?.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, public detail: string) {
    super(`API ${status}: ${detail}`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = typeof j?.detail === "string" ? j.detail : JSON.stringify(j);
    } catch {
      // ignore
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // --- profile / state ---
  getProfile: () => request<FullState>("/api/profile"),
  updateProfile: (patch: ProfilePatch) =>
    request<FullState>("/api/profile", { method: "PUT", body: JSON.stringify(patch) }),

  // --- nutrition ---
  getToday: () => request<NutritionToday>("/api/nutrition/today"),
  logMeal: (meal: MealLogRequest) =>
    request<NutritionToday>("/api/nutrition/log", {
      method: "POST",
      body: JSON.stringify(meal),
    }),
  lookupBarcode: (barcode: string, nameHint?: string) => {
    const qs = nameHint ? `?name_hint=${encodeURIComponent(nameHint)}` : "";
    return request<BarcodeLookupResult>(`/api/nutrition/barcode/${encodeURIComponent(barcode)}${qs}`);
  },
  lookupByName: (q: string) =>
    request<BarcodeLookupResult>(`/api/nutrition/lookup_name?q=${encodeURIComponent(q)}`),

  // --- chat ---
  sendChat: (message: string, language: "en" | "es" = "en") =>
    request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, language }),
    }),
  resetChat: () => request<ChatResponse>("/api/chat/history", { method: "DELETE" }),
};

export { ApiError, API_URL };
