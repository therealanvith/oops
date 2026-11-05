const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export interface HealthResponse {
  status: "UP" | "DOWN";
  service?: string;
  time?: string;
}

/**
 * Pings backend health endpoint, safely handling unreachable host or network errors.
 */
export async function checkBackendHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: "DOWN" };
    }

    const data = (await response.json()) as {
      status: string;
      service: string;
      time: string;
    };

    return {
      status: data.status === "UP" ? "UP" : "DOWN",
      service: data.service,
      time: data.time,
    };
  } catch {
    return { status: "DOWN" };
  }
}

/**
 * Lightweight typed fetch wrapper for REST communication with Spring Boot backend.
 */
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as T;
}
