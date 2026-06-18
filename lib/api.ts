import type { ApiResponse } from '@/types/bpa.types';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}/api/v1${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
    ...options,
  });

  const body = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? 'API request failed', body);
  }

  return body as ApiResponse<T>;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return request<T>(path, options);
}

export async function apiPost<T>(
  path: string,
  data: unknown,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}
