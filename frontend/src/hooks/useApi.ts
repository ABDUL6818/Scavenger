/**
 * useApi — returns a ready-to-use ScavengerClient built from the current
 * ContractContext config and Stellar network settings.
 *
 * Usage:
 *   const api = useApi()
 *   const { data } = useQuery({ queryKey: ['participant', addr], queryFn: () => api.getParticipant(addr) })
 *
 * For REST calls, use the centralized typed client from '@/services/apiClient'
 * (see `useApiClient` below) instead of ad-hoc fetch calls.
 */
import { useMemo } from 'react'
import { ScavengerClient } from '@/api/client'
import { useContract } from '@/context/ContractContext'
import { networkConfig } from '@/lib/stellar'
import { ApiClient, createApiClient } from '@/services/apiClient'

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
 * useApiClient — returns the centralized typed REST client.
 *
 * All REST calls should be routed through this client so that error mapping
 * and response typing are consistent across the app.
 *
 * Usage:
 *   const client = useApiClient()
 *   const { data } = useQuery({ queryKey: ['participants'], queryFn: () => client.getParticipants() })
 */
export function useApiClient(): ApiClient {
  const { config } = useContract()
  return useMemo(
    () =>
      createApiClient({
        baseUrl: config.rpcUrl,
        networkPassphrase: networkConfig.networkPassphrase,
        contractId: config.contractId,
      }),
    [config.rpcUrl, config.contractId]
  )
}