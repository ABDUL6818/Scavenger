import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Lifecycle status shared with the transaction-status module so async state
 * (including polling hooks) can be mapped onto the same pending/success/failed
 * UI without translation layers.
 */
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
 */
export function useAsync<T, Args extends unknown[] = []>(
  fn: (...args: Args) => Promise<T>
): UseAsyncReturn<T, Args> {
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

  // Backwards-compatibility: `status` values are unchanged ('idle' | 'loading'
  // | 'success' | 'error') and `isLoading` is still derived from `status`, so
  // existing callers keep working. New consumers (e.g. the transaction-status
  // polling hook) can map `status` directly onto pending/success/failed.

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

  // No console.* calls or commented-out code here: failures are surfaced via
  // `error` in the returned state for callers to render.

  return { ...state, isLoading: state.status === 'loading', run, reset }
}
