/**
 * api/httpClient.ts
 *
 * @deprecated Compatibility shim. The implementation now lives in
 * `services/apiClient.ts` (single fetch implementation) and
 * `services/errorMapper.ts` (error normalization). This module re-exports
 * the shared types and delegates to the services client so existing imports
 * keep working. Prefer importing from `services/apiClient` directly.
 *
 * Usage:
 *   const client = createApiClient({ baseUrl: 'https://api.example.com' })
 *   const wastes = await client.get<Waste[]>('/contracts/wastes')
 */

import { config } from '@/config'
import {
  ApiClient as ServicesApiClient,
  createApiClient as createServicesApiClient,
  apiClient as servicesApiClient,
  type ApiClientOptions,
  type RequestOptions,
  type ApiResult,
  type HttpMethod,
} from '../services/apiClient'
import { ApiError, normalizeApiError } from '../services/errorMapper'

/* ────────────────────────────────────────────────────────────────
   Types (re-exported for backwards compatibility)
   ──────────────────────────────────────────────────────────────── */

export type { ApiClientOptions, RequestOptions, ApiResult, HttpMethod }
export { ApiError, normalizeApiError }

/* ────────────────────────────────────────────────────────────────
   Core client (thin alias of the services implementation)
   ──────────────────────────────────────────────────────────────── */

export class ApiClient extends ServicesApiClient {}

/* ────────────────────────────────────────────────────────────────
   Factory
   ──────────────────────────────────────────────────────────────── */

/**
 * Create a pre-configured ApiClient instance.
 *
 * When `baseUrl` / `timeoutMs` are omitted, the validated values from the
 * config module are used (VITE_API_BASE_URL / VITE_API_TIMEOUT_MS).
 *
 * @example
 * const api = createApiClient()
 * const result = await api.get<Waste[]>('/contracts/wastes')
 */
export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  return createServicesApiClient({
    baseUrl: options.baseUrl ?? config.apiBaseUrl,
    timeoutMs: options.timeoutMs ?? config.apiTimeoutMs,
    ...options,
  }) as ApiClient
}

/* ────────────────────────────────────────────────────────────────
   Shared singleton (uses validated config)
   ──────────────────────────────────────────────────────────────── */

export const apiClient: ApiClient = servicesApiClient as ApiClient
