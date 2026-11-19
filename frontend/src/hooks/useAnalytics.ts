import { useCallback, useMemo } from 'react'
import { analytics, type EventCategory } from '@/lib/analyticsService'

/**
 * Hook that exposes event tracking helpers bound to an optional userId.
 *
 * The returned helpers are memoized so their references stay stable across
 * renders as long as `userId` does not change. This lets consumers safely use
 * them in dependency arrays (e.g. `useEffect`, `useMemo`, `useCallback`)
 * without triggering unnecessary re-runs or re-renders.
 */
export function useAnalytics(userId?: string) {
  const track = useCallback(
    (
      category: EventCategory,
      action: string,
      options: { label?: string; value?: number; metadata?: Record<string, unknown> } = {},
    ) => analytics.track(category, action, { ...options, userId }),
    [userId],
  )

  const pageView = useCallback(
    (page: string) => analytics.pageView(page, userId),
    [userId],
  )

  return useMemo(() => ({ track, pageView }), [track, pageView])
}