import { useCallback, useEffect } from 'react'
import { useAsync, type AsyncState } from './useAsync'

export interface UseResourceReturn<T> extends AsyncState<T> {
  reload: () => Promise<T | undefined>
}

/**
 * @deprecated Use TanStack Query (`useQuery` / `useMutation`) for fetching
 * server state instead. This hook is retained for backwards compatibility and
 * should only be used for non-server (local/derived) async state that does not
 * benefit from caching, retries, or invalidation.
 *
 * Migration guide:
 * - Replace `useResource(fetcher, deps)` with `useQuery({ queryKey, queryFn })`.
 * - Replace `reload()` with `queryClient.invalidateQueries({ queryKey })` or
 *   `refetch()` from the `useQuery` result.
 * - Map `status`/`isLoading`/`error`/`data` to the equivalent `useQuery`
 *   fields (`isPending`, `isLoading`, `error`, `data`).
 *
 * Fetches an async resource on mount and whenever `deps` change, exposing
 * loading / error / success state plus a `reload` for manual refresh (e.g.
 * after a mutation). Built on `useAsync`, so stale responses and updates
 * after unmount are ignored.
 *
 * `isLoading` is true until the first fetch settles, so initial renders show
 * loading UI instead of flashing an empty state.
 */
export function useResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseResourceReturn<T> {
  const { run, reset: _reset, ...state } = useAsync(fetcher)

  // `run` is stable and always calls the latest fetcher; deps control refetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(() => run(), deps)

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    ...state,
    isLoading: state.status === 'idle' || state.status === 'loading',
    reload,
  }
}