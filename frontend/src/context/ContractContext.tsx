import React, { createContext, useContext, useState, ReactNode } from 'react'
import { config as envConfig } from '@/config'
import { Network, NETWORKS } from '@/lib/constants'

interface ContractConfig {
  contractId: string
  network: Network
  rpcUrl: string
}

interface ContractContextType {
  config: ContractConfig
  updateConfig: (newConfig: Partial<ContractConfig>) => void
}

// Default Testnet configuration for Soroban
const defaultConfig: ContractConfig = {
  contractId: envConfig.contractId,
  network: envConfig.network as Network,
  rpcUrl: envConfig.rpcUrl
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export const ContractProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ContractConfig>(defaultConfig)

  const updateConfig = (newConfig: Partial<ContractConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }

  return (
    <ContractContext.Provider value={{ config, updateConfig }}>{children}</ContractContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useContract = () => {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error('UseContract must be used within a ContractProvider.')
  }
  return context
}

// Re-export network constants for convenience and backwards compatibility
export { Network, NETWORKS }