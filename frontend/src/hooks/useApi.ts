/**
 * useApi — returns a ready-to-use ScavengerClient built from the current
 * ContractContext config and Stellar network settings.
 *
 * Usage:
 *   const api = useApi()
 *   const { data } = useQuery({ queryKey: ['participant', addr], queryFn: () => api.getParticipant(addr) })
 *
 * Backwards-compatibility: the public signature `useApi(): ScavengerClient`
 * is unchanged. The returned client is the same instance consumed by the
 * shared transaction-status module (see `@/hooks/useTransactionStatus`), so
 * existing callers require no changes.
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