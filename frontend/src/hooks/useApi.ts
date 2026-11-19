/**
 * useApi — returns a ready-to-use ScavengerClient built from the current
 * ContractContext config and Stellar network settings.
 *
 * Contract:
 *   Inputs:  none (reads `config` from `ContractContext`).
 *   Outputs: a memoized `ScavengerClient` instance.
 *   Semantics:
 *     - The client is re-created only when `config.rpcUrl` or
 *       `config.contractId` change; otherwise the same instance is returned.
 *     - `networkPassphrase` is taken from `networkConfig` (Stellar network
 *       settings) and is not part of the memoization key.
 *
 * Backwards compatibility:
 *   `useApi` is the canonical hook. `useContractQuery` / `useContractQueries`
 *   are deprecated aliases that delegate to the consolidated generic
 *   implementations in `useResource` / `useAsync` (see those modules).
 *
 * Usage:
 *   const api = useApi()
 *   const { data } = useQuery({ queryKey: ['participant', addr], queryFn: () => api.getParticipant(addr) })
 */
import { useMemo } from 'react'
import { ScavengerClient } from '@/api/client'
import { useContract } from '@/context/ContractContext'
import { networkConfig } from '@/lib/stellar'

export function useApi(): ScavengerClient {
  const { config } = useContract()
  return useMemo(
    () =>
      new ScavengerClient({
        rpcUrl: config.rpcUrl,
        networkPassphrase: networkConfig.networkPassphrase,
        contractId: config.contractId,
      }),
    [config.rpcUrl, config.contractId]
  )
}

/**
 * @deprecated Use `useApi` instead. Retained as a backwards-compatible alias
 * for callers that imported the old name. Delegates directly to `useApi`.
 */
export const useContractQuery = useApi

/**
 * @deprecated Use `useApi` instead. Retained as a backwards-compatible alias
 * for callers that imported the old plural name. Delegates directly to
 * `useApi`; both names resolve to the same memoized client.
 */
export const useContractQueries = useApi

export default useApi