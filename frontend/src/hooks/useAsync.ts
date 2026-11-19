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
 * Contract:
 * - Input: `fn` is the async operation. It is read through a ref, so passing a
 *   new `fn` identity on every render does not invalidate `run`/`reset`.
 * - Output: `{ status, data, error, isLoading, run, reset }`. `isLoading` is
 *   derived from `status === 'loading'` and is always consistent with it.
 * - `run(...args)` sets `status` to `'loading'` (clearing `error`), then
 *   resolves to the operation's value on success (`status: 'success'`) or to
 *   `undefined` on failure (`status: 'error'`, error exposed via `error`).
 * - `reset()` returns to the initial `idle` state and invalidates in-flight
 *   calls.
 *
 * Stale-response semantics: only the most recent `run` call may update state;
 * completions from superseded calls are ignored. Unmount semantics: state is
 * never updated after unmount (no "setState on unmounted component" warnings).
 *
 * @deprecated Prefer the consolidated generic async hook exported from
 * `frontend/src/hooks` (see `useAsyncOperation`). This hook remains as a thin
 * backwards-compatible re-export with identical behaviour; existing imports
 * keep working and will be migrated incrementally.
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

/**
 * Backwards-compatible alias for the consolidated generic async hook.
 * @deprecated Use `useAsync` (or the consolidated `useAsyncOperation`).
 */
export const useAsyncOperation = useAsync
