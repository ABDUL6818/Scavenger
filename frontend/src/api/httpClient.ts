/**
 * api/httpClient.ts
 *
 * Typed HTTP API client for Scavngr REST endpoints.
 * Centralises all fetch calls, auth headers, and error handling so
 * components never need to call fetch() directly.
 *
 * Usage:
 *   const client = createApiClient({ baseUrl: 'https://api.example.com' })
 *   const wastes = await client.get<Waste[]>('/contracts/wastes')
 */

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Well-known HTTP status codes used by the client and its consumers.
 * Prefer these over magic numbers when branching on `ApiError.status`.
 */
export const HttpStatus = {
  Ok: 200,
  Created: 201,
  NoContent: 204,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  Conflict: 409,
  UnprocessableEntity: 422,
  TooManyRequests: 429,
  InternalServerError: 500,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
} as const

export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus]

/**
 * Synthetic status used for client-side failures (network errors, timeouts).
 * Kept at 0 so it never collides with a real HTTP status.
 */
export const CLIENT_ERROR_STATUS = 0

/** Machine-readable error kinds, useful for retry decisions. */
export const ApiErrorKind = {
  Timeout: 'Timeout',
  NetworkError: 'NetworkError',
  Unknown: 'Unknown',
  Http: 'Http',
} as const

export type ApiErrorKind = (typeof ApiErrorKind)[keyof typeof ApiErrorKind]
=======

export interface ApiClientOptions {
  /** Base URL prepended to every request path. */
  baseUrl?: string
  /** Default headers merged into every request. */
  defaultHeaders?: Record<string, string>
  /** Request timeout in milliseconds (default: 30 000). */
  timeoutMs?: number
  /** Optional bearer token for Authorization header. */
  bearerToken?: string
}

export interface RequestOptions {
  /** Additional headers merged with the client defaults for this request. */
  headers?: Record<string, string>
  /** URL query params appended to the path. */
  params?: Record<string, string | number | boolean>
  /** Request body (serialised to JSON automatically). */
  body?: unknown
  /** Per-request timeout override. */
  timeoutMs?: number
  /** Override the bearer token for this request only. */
  bearerToken?: string
}

/** Typed API error carrying the HTTP status and parsed response body. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    message?: string,
    public readonly kind: ApiErrorKind = status === CLIENT_ERROR_STATUS
      ? ApiErrorKind.Unknown
      : ApiErrorKind.Http
  ) {
    super(message ?? `HTTP ${status} ${statusText}`)
    this.name = 'ApiError'
  }

  /** True for client-side failures (network error, timeout) with no HTTP status. */
  get isNetworkError(): boolean {
    return this.status === CLIENT_ERROR_STATUS
  }

  /** True when the request timed out. */
  get isTimeout(): boolean {
    return this.kind === ApiErrorKind.Timeout
  }

  /**
   * Whether this error is worth retrying. Aligns with TanStack Query's default
   * retry policy: never retry 4xx (except 408/429), retry 5xx and network errors.
   */
  get isRetryable(): boolean {
    if (this.isNetworkError) return true
    if (this.status === HttpStatus.TooManyRequests) return true
    return this.status >= HttpStatus.InternalServerError
  }
}
=======

/** Successful response envelope returned by every client method. */
export interface ApiResult<T> {
  data: T
  status: number
  headers: Record<string, string>
  durationMs: number
}

/* ────────────────────────────────────────────────────────────────
   Core client
   ──────────────────────────────────────────────────────────────── */

export class ApiClient {
  private readonly baseUrl: string
  private readonly defaultHeaders: Record<string, string>
  private readonly timeoutMs: number
  private bearerToken: string | undefined

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/$/, '') ?? ''
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.defaultHeaders,
    }
    this.timeoutMs = options.timeoutMs ?? 30_000
    this.bearerToken = options.bearerToken
  }

  /** Update the bearer token (e.g. after wallet connect). */
  setToken(token: string | undefined): void {
    this.bearerToken = token
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const base = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`
    if (!params || Object.keys(params).length === 0) return base
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString()
    return `${base}?${qs}`
  }

  private buildHeaders(options: RequestOptions): Record<string, string> {
    const token = options.bearerToken ?? this.bearerToken
    return {
      ...this.defaultHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiResult<T>> {
    const url = this.buildUrl(path, options.params)
    const headers = this.buildHeaders(options)
    const timeout = options.timeoutMs ?? this.timeoutMs

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    const startMs = performance.now()

    let response: Response
    try {
      response = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
        body:
          options.body !== undefined && method !== 'GET' && method !== 'DELETE'
            ? JSON.stringify(options.body)
            : undefined,
      })
    } catch (err) {
      clearTimeout(timer)
      if ((err as Error).name === 'AbortError') {
        throw new ApiError(
          CLIENT_ERROR_STATUS,
          ApiErrorKind.Timeout,
          null,
          `Request timed out after ${timeout}ms`,
          ApiErrorKind.Timeout
        )
      }
      throw new ApiError(
        CLIENT_ERROR_STATUS,
        ApiErrorKind.NetworkError,
        null,
        (err as Error).message,
        ApiErrorKind.NetworkError
      )
    } finally {
=======
      clearTimeout(timer)
    }

    const durationMs = Math.round(performance.now() - startMs)

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((v, k) => {
      responseHeaders[k] = v
    })

    // Parse body as JSON if possible, otherwise as text
    let body: unknown
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      body = await response.json()
    } else {
      body = await response.text()
    }

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, body)
    }

    return { data: body as T, status: response.status, headers: responseHeaders, durationMs }
  }

  /* ── Convenience methods ─────────────────────────────────────── */

  get<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<ApiResult<T>> {
    return this.request<T>('GET', path, options)
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('POST', path, { ...options, body })
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('PUT', path, { ...options, body })
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('PATCH', path, { ...options, body })
  }

  delete<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<ApiResult<T>> {
    return this.request<T>('DELETE', path, options)
  }
}

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
  return new ApiClient(options)
}

/* ────────────────────────────────────────────────────────────────
   Shared singleton (uses VITE_API_BASE_URL if set)
   ──────────────────────────────────────────────────────────────── */

export const apiClient = createApiClient({
  baseUrl: typeof window !== 'undefined'
    ? (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_BASE_URL ?? window.location.origin
    : '',
})

/* ────────────────────────────────────────────────────────────────
   Error normalization
   ──────────────────────────────────────────────────────────────── */

/**
 * Coerce any thrown value into an ApiError so callers can branch on a single
 * type. Errors that are already ApiError pass through unchanged.
 */
export function normalizeApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  const message = err instanceof Error ? err.message : String(err)
  return new ApiError(CLIENT_ERROR_STATUS, ApiErrorKind.Unknown, null, message, ApiErrorKind.Unknown)
}

/**
 * Default retry predicate for TanStack Query `retry` options.
 *
 * @example
 * useQuery({ queryKey, queryFn, retry: shouldRetryRequest })
 */
export function shouldRetryRequest(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3) return false
  return normalizeApiError(error).isRetryable
}
=======
