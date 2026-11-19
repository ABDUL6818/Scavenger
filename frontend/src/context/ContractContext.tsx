import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { config as envConfig } from '@/config'

interface ContractConfig {
  contractId: string
  network: 'TESTNET' | 'MAINNET' | 'FUTURENET' | 'STANDALONE'
  rpcUrl: string
}

interface ContractContextType {
  config: ContractConfig
  updateConfig: (newConfig: Partial<ContractConfig>) => void
  resetConfig: () => void
}

// Derive the canonical config from the single source of truth ('@/config').
// This avoids duplicating defaults that already live in config.ts / config/app.ts.
const getCanonicalConfig = (): ContractConfig => ({
  contractId: envConfig.contractId,
  network: envConfig.network,
  rpcUrl: envConfig.rpcUrl
})

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export const ContractProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ContractConfig>(getCanonicalConfig)

  const updateConfig = useCallback((newConfig: Partial<ContractConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(getCanonicalConfig())
  }, [])

  return (
    <ContractContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ContractContext.Provider>
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