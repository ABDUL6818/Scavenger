import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWallet } from '@/context/WalletContext'
import { Material } from '@/api/types'
import { useToast } from '@/hooks/useToast'
import { useScavengerClient } from '@/hooks/useScavengerClient'
import { useAsyncData } from '@/hooks/useAsyncData'

/**
 * Contract for `useWasteList`:
 *
 * - Reads the connected wallet address from `WalletContext` and the contract
 *   client from the consolidated `useScavengerClient` hook.
 * - Loads the participant's waste materials plus the contract admin address
 *   via `useAsyncData` (which owns loading/error state and reload semantics).
 * - Exposes mutation helpers (`confirmWaste`, `transferWaste`, and the
 *   `batch*` variants) that perform optimistic updates where applicable and
 *   reload the list afterwards.
 * - The returned object shape is stable for backwards compatibility:
 *   `{ wastes, isLoading, error, isAdmin, reload, confirmWaste, transferWaste,
 *      batchConfirmWastes, batchVerifyWastes, batchTransferWastes,
 *      batchDeactivateWastes }`.
 */
export function useWasteList() {
  const { address } = useWallet()
  const toast = useToast()
  const getClient = useScavengerClient()
  const [adminAddress, setAdminAddress] = useState<string | null>(null)

  const {
    data: wastes,
    isLoading,
    error,
    reload: load,
    setData: setWastes,
  } = useAsyncData<Material[]>(
    async () => {
      if (!address) return []
      const client = getClient()
      const [admin, ids] = await Promise.all([
        client.getAdmin().catch(() => null),
        client.getParticipantWastes(address),
      ])
      const materials = await Promise.all(ids.map((id) => client.getMaterial(id)))
      setAdminAddress(admin)
      return materials.filter((m): m is Material => m !== null)
    },
    [address, getClient],
    { enabled: Boolean(address), initialData: [], errorMessage: 'Failed to load wastes' }
  )

  const confirmWaste = useCallback(async (wasteId: number | bigint) => {
    if (!address) return
    // Optimistic update
    setWastes((prev) =>
      prev.map((w) => (BigInt(w.id) === BigInt(wasteId) ? { ...w, is_confirmed: true } : w))
    )
    try {
      await getClient().confirmWasteDetails(BigInt(wasteId), address, address)
      toast.success(`Waste #${wasteId} confirmed successfully.`)
      await load()
    } catch (err) {
      // Revert optimistic update on failure
      await load()
      toast.error(err)
    }
  }, [address, getClient, load, toast, setWastes])

  const transferWaste = useCallback(async (wasteId: number | bigint, to: string) => {
    if (!address) return
    await getClient().transferWaste(BigInt(wasteId), address, to, 0n, 0n, '', address)
    await load()
  }, [address, getClient, load])

  const batchConfirmWastes = useCallback(
    async (
      wasteIds: Array<number | bigint>,
      onProgress?: (completed: number, total: number) => void
    ) => {
      if (!address) return { succeeded: 0, failed: wasteIds.length, errors: ['No wallet connected'] }
      const client = getClient()
      const total = wasteIds.length
      let completed = 0
      let succeeded = 0
      const errors: string[] = []

      setWastes((prev) =>
        prev.map((w) =>
          wasteIds.some((id) => BigInt(w.id) === BigInt(id))
            ? { ...w, is_confirmed: true }
            : w
        )
      )

      for (const wasteId of wasteIds) {
        try {
          await client.confirmWasteDetails(BigInt(wasteId), address, address)
          succeeded += 1
        } catch (err) {
          errors.push(err instanceof Error ? err.message : String(err))
        } finally {
          completed += 1
          onProgress?.(completed, total)
        }
      }

      await load()
      if (errors.length === 0) {
        toast.success(`Confirmed ${succeeded} waste item${succeeded !== 1 ? 's' : ''}.`)
      } else {
        toast.error(`Confirmed ${succeeded} of ${total} items. ${errors.length} failed.`)
      }

      return { succeeded, failed: total - succeeded, errors }
    },
    [address, getClient, load, toast, setWastes]
  )

  const batchVerifyWastes = useCallback(
    async (
      wasteIds: Array<number | bigint>,
      onProgress?: (completed: number, total: number) => void
    ) => {
      if (!address) return { succeeded: 0, failed: wasteIds.length, errors: ['No wallet connected'] }
      const client = getClient()
      const total = wasteIds.length
      let completed = 0
      let succeeded = 0
      const errors: string[] = []

      for (const wasteId of wasteIds) {
        try {
          await client.verifyMaterial(BigInt(wasteId), address, address)
          succeeded += 1
        } catch (err) {
          errors.push(err instanceof Error ? err.message : String(err))
        } finally {
          completed += 1
          onProgress?.(completed, total)
        }
      }

      await load()
      if (errors.length === 0) {
        toast.success(`Verified ${succeeded} waste item${succeeded !== 1 ? 's' : ''}.`)
      } else {
        toast.error(`Verified ${succeeded} of ${total} items. ${errors.length} failed.`)
      }

      return { succeeded, failed: total - succeeded, errors }
    },
    [address, getClient, load, toast]
  )

  const batchTransferWastes = useCallback(
    async (
      wasteIds: Array<number | bigint>,
      to: string,
      onProgress?: (completed: number, total: number) => void
    ) => {
      if (!address) return { succeeded: 0, failed: wasteIds.length, errors: ['No wallet connected'] }
      const client = getClient()
      const total = wasteIds.length
      let completed = 0
      let succeeded = 0
      const errors: string[] = []
      const normalizedTo = to.trim()

      for (const wasteId of wasteIds) {
        try {
          await client.transferWaste(BigInt(wasteId), address, normalizedTo, 0n, 0n, '', address)
          succeeded += 1
        } catch (err) {
          errors.push(err instanceof Error ? err.message : String(err))
        } finally {
          completed += 1
          onProgress?.(completed, total)
        }
      }

      await load()
      if (errors.length === 0) {
        toast.success(`Transferred ${succeeded} waste item${succeeded !== 1 ? 's' : ''}.`)
      } else {
        toast.error(`Transferred ${succeeded} of ${total} items. ${errors.length} failed.`)
      }

      return { succeeded, failed: total - succeeded, errors }
    },
    [address, getClient, load, toast]
  )

  const batchDeactivateWastes = useCallback(
    async (
      wasteIds: Array<number | bigint>,
      onProgress?: (completed: number, total: number) => void
    ) => {
      if (!address) return { succeeded: 0, failed: wasteIds.length, errors: ['No wallet connected'] }
      if (!adminAddress || address !== adminAddress) {
        return { succeeded: 0, failed: wasteIds.length, errors: ['Current wallet is not admin'] }
      }
      const client = getClient()
      const total = wasteIds.length
      let completed = 0
      let succeeded = 0
      const errors: string[] = []

      for (const wasteId of wasteIds) {
        try {
          await client.deactivateWaste(adminAddress, BigInt(wasteId), address)
          succeeded += 1
        } catch (err) {
          errors.push(err instanceof Error ? err.message : String(err))
        } finally {
          completed += 1
          onProgress?.(completed, total)
        }
      }

      await load()
      if (errors.length === 0) {
        toast.success(`Deactivated ${succeeded} waste item${succeeded !== 1 ? 's' : ''}.`)
      } else {
        toast.error(`Deactivated ${succeeded} of ${total} items. ${errors.length} failed.`)
      }

      return { succeeded, failed: total - succeeded, errors }
    },
    [address, adminAddress, getClient, load, toast]
  )

  const isAdmin = useMemo(
    () => Boolean(address && adminAddress && String(address) === String(adminAddress)),
    [address, adminAddress]
  )

  const confirmedWastes = useMemo(
    () => wastes.filter((w) => w.is_confirmed),
    [wastes]
  )

  const unconfirmedWastes = useMemo(
    () => wastes.filter((w) => !w.is_confirmed),
    [wastes]
  )

  return useMemo(
    () => ({
      wastes,
      confirmedWastes,
      unconfirmedWastes,
      isLoading,
      error,
      isAdmin,
      reload: load,
      confirmWaste,
      transferWaste,
      batchConfirmWastes,
      batchVerifyWastes,
      batchTransferWastes,
      batchDeactivateWastes,
    }),
    [
      wastes,
      confirmedWastes,
      unconfirmedWastes,
      isLoading,
      error,
      isAdmin,
      load,
      confirmWaste,
      transferWaste,
      batchConfirmWastes,
      batchVerifyWastes,
      batchTransferWastes,
      batchDeactivateWastes,
    ]
  )
}
