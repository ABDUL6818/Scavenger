/**
 * context/WalletContext.tsx
 *
 * Backwards-compatibility shim. The implementation now lives in
 * features/wallet (WalletProvider in features/wallet/components, useWallet in
 * features/wallet/hooks, Freighter calls in features/wallet/services).
 * Existing imports of '@/context/WalletContext' keep working; new code should
 * import from '@/features/wallet'.
 */
export { WalletProvider } from '@/features/wallet/components/WalletProvider'
export { useWallet } from '@/features/wallet/hooks/useWallet'
export type { WalletContextType } from '@/features/wallet/hooks/useWallet'
