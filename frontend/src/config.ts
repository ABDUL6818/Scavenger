import { NETWORKS, type Network } from './lib/constants'

const required = (key: string): string => {
  const value = import.meta.env[key] as string | undefined
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

const VALID_NETWORKS = Object.values(NETWORKS) as readonly Network[]

const rawNetwork = (import.meta.env.VITE_NETWORK as string) || NETWORKS.TESTNET
if (!VALID_NETWORKS.includes(rawNetwork as Network)) {
  throw new Error(
    `Invalid VITE_NETWORK "${rawNetwork}". Must be one of: ${VALID_NETWORKS.join(', ')}`
  )
}

export const config = {
  contractId: required('VITE_CONTRACT_ID'),
  network: rawNetwork as Network,
  rpcUrl: required('VITE_RPC_URL')
} as const