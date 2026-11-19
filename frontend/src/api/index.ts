export * from './types'
export * from './client'
export * from './httpClient'

// Centralized typed API client and error mapper (see #1670).
// Re-exported here so existing imports of '@/api' continue to resolve.
// Backwards-compatibility note: the legacy `httpClient` above remains as a
// shim; new code should prefer the typed client and error mapper below.
export * from '@/services/apiClient'
export * from '@/services/errorMapper'