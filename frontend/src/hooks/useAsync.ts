import { useCallback, useEffect, useRef, useState } from 'react'

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  status: AsyncStatus
  data: T | null
  error: Error | null
  isLoading: boolean
}

export interface UseAsyncReturn<T, Args extends unknown[]> extends AsyncState<T> {
  run: (...args: Args) => Promise<T | undefined>
  reset: () => void
}

/**
 * Manages the lifecycle of an on-demand async operation (loading / error /
 * success) so pages don't hand-roll `isLoading` + `error` state for every
 * action. The wrapped function is only invoked when `run` is called.
 *
 * Stale completions (a `run` superseded by a newer one) and completions after
 * unmount never update state. On failure `run` resolves to `undefined` and the
 * error is exposed via `error`.
 *
 * @deprecated For **server state** (fetching data from the API) use TanStack
 * Query instead — see `frontend/src/lib/queryClient.ts` and the hooks in
 * `frontend/src/hooks/queries/`. Query provides caching, retries,
 * invalidation and request de-duplication out of the box.
 *
 * This hook remains supported only for **non-server, imperative side effects**
 * (e.g. submitting a form, triggering a one-off mutation-like action) where
 * there is no cacheable resource to key on. Do not use it to read API data.
 */
export function useAsync<T, Args extends unknown[] = []>(
  fn: (...args: Args) => Promise<T>
): UseAsyncReturn<T, Args> {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      '[useAsync] Deprecated for server state. Use TanStack Query ' +
        '(hooks/queries) for API reads; reserve useAsync for imperative, ' +
        'non-cacheable actions.'
    )
  }
  const [state, setState] = useState<Omit<AsyncState<T>, 'isLoading'>>({
    status: 'idle',
    data: null,
    error: null,
  })

  // Always call the latest fn without invalidating `run`'s identity
  const fnRef = useRef(fn)
  fnRef.current = fn

  const mountedRef = useRef(true)
  const callIdRef = useRef(0)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const run = useCallback(async (...args: Args): Promise<T | undefined> => {
    const callId = ++callIdRef.current
    setState((prev) => ({ ...prev, status: 'loading', error: null }))
    try {
      const data = await fnRef.current(...args)
      if (mountedRef.current && callId === callIdRef.current) {
        setState({ status: 'success', data, error: null })
      }
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      if (mountedRef.current && callId === callIdRef.current) {
        setState((prev) => ({ ...prev, status: 'error', error }))
      }
      return undefined
    }
  }, [])

  const reset = useCallback(() => {
    callIdRef.current++
    setState({ status: 'idle', data: null, error: null })
  }, [])

  return { ...state, isLoading: state.status === 'loading', run, reset }
}
