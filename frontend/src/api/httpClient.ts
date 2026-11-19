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
 * @example
 * const api = createApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL })
 * const result = await api.get<Waste[]>('/contracts/wastes')
 */
export function createApiClient(options?: ApiClientOptions): ApiClient {
  return createServicesApiClient(options) as ApiClient
}

/* ────────────────────────────────────────────────────────────────
   Shared singleton (uses VITE_API_BASE_URL if set)
   ──────────────────────────────────────────────────────────────── */

export const apiClient: ApiClient = servicesApiClient as ApiClient
