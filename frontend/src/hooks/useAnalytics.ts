import { useCallback } from 'react'
import { analytics, type EventCategory } from '@/lib/analyticsService'

/**
 * Hook that exposes event tracking helpers bound to an optional userId.
 *
 * NOTE: This is intentionally NOT a TanStack Query hook. Analytics event
 * tracking is a fire-and-forget side effect, not a data-fetching concern, so
 * it must not be wrapped in `useQuery`/`useMutation` (which would introduce
 * caching, retries, and invalidation semantics that do not apply here).
 * Data fetching in this codebase is standardized on TanStack Query; keep
 * analytics tracking separate from that layer.
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

  return { track, pageView }
}