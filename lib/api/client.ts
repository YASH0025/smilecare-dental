"use client";

import type { ApiResponse } from "@/types";

/**
 * Browser-side API client. Client components ONLY talk to data through these
 * helpers (→ route handlers → services → repositories → JSON). Never `fs`.
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: Record<string, string[] | undefined>,
  ) {
    super(message);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiClientError("Network error — check your connection and try again.", 0, "NETWORK_ERROR");
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    // fall through
  }

  if (!json) throw new ApiClientError("Unexpected server response.", res.status, "BAD_RESPONSE");
  if (!json.ok) {
    if (res.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiClientError(json.error.message, res.status, json.error.code, json.error.details);
  }
  return json.data;
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body ?? {}),
  put: <T>(url: string, body?: unknown) => request<T>("PUT", url, body ?? {}),
  patch: <T>(url: string, body?: unknown) => request<T>("PATCH", url, body ?? {}),
  delete: <T>(url: string) => request<T>("DELETE", url),
};

export function errorMessage(error: unknown) {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
