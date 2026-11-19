/**
 * useApi — returns a ready-to-use ScavengerClient built from the current
 * ContractContext config and Stellar network settings.
 *
 * The client is memoized on the relevant config values so it stays stable
 * across renders. A stable client instance is important for TanStack Query:
 * it keeps `queryFn` references consistent and avoids unnecessary refetches.
 *
 * Standardized query pattern (TanStack Query conventions):
 *   const api = useApi()
 *   const { data } = useQuery({
 *     queryKey: queryKeys.participant(addr),
 *     queryFn: () => api.getParticipant(addr),
 *     // Caching, retries, and staleTime defaults are configured globally
 *     // in the QueryClient (see lib/queryClient.ts). Override per-query only
 *     // when necessary.
 *   })
 *
 * Invalidation convention:
 *   const queryClient = useQueryClient()
 *   // After a mutation, invalidate the affected keys:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.participant(addr) })
 *
 * Backwards compatibility:
 *   The hook signature is unchanged — existing callers continue to work.
 *   Only the memoization dependencies were tightened to include the network
 *   passphrase, ensuring the client is rebuilt if network settings change.
 */
import { useMemo } from 'react'
import { ScavengerClient } from '@/api/client'
import { useContract } from '@/context/ContractContext'
import { networkConfig } from '@/lib/stellar'

export function useApi(): ScavengerClient {
  const { config } = useContract()
  const { rpcUrl, contractId } = config
  const { networkPassphrase } = networkConfig

  return useMemo(
    () =>
      new ScavengerClient({
        rpcUrl,
        networkPassphrase,
        contractId,
      }),
    [rpcUrl, contractId, networkPassphrase]
  )
}