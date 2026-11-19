/**
 * Shared domain types for the Scavenger frontend.
 *
 * These types are the single source of truth for API/contract payloads and are
 * intended to be re-exported from `packages/shared` (or `packages/scavenger-sdk`)
 * so that frontend and backend consumers share one definition.
 *
 * Backwards-compatibility: all previously exported names (Role, WasteType,
 * Participant, Incentive, Material, Waste, WasteTransfer, ParticipantStats,
 * GlobalMetrics, ContractError) are preserved with the same shapes, so existing
 * imports from `frontend/src/api/types` continue to work unchanged.
 */

export enum Role {
  Recycler = 'Recycler',
  Collector = 'Collector',
  Manufacturer = 'Manufacturer'
}

export enum WasteType {
  Paper = 0,
  PetPlastic = 1,
  Plastic = 2,
  Metal = 3,
  Glass = 4,
  Organic = 5,
  Electronic = 6
}

export interface Participant {
  address: string
  role: Role
  name: string
  latitude: number
  longitude: number
  registered_at: number
}

/** Raw participant payload as returned by the contract (numeric role). */
export interface RawParticipant {
  address: string
  role: number
  name: string
  latitude: number
  longitude: number
  registered_at: number
}

export interface Incentive {
  id: number
  rewarder: string
  waste_type: WasteType
  reward_points: number
  total_budget: number
  remaining_budget: number
  active: boolean
  created_at: number
}

/** Raw incentive payload as returned by the contract. */
export interface RawIncentive {
  id: number
  rewarder: string
  waste_type: number
  reward_points: number
  total_budget: number
  remaining_budget: number
  active: boolean
  created_at: number
}

export interface Material {
  id: number
  waste_type: WasteType
  weight: number
  submitter: string
  current_owner: string
  submitted_at: number
  verified: boolean
  is_active: boolean
  is_confirmed: boolean
  confirmer: string
}

/** Raw material payload as returned by the contract. */
export interface RawMaterial {
  id: number
  waste_type: number
  weight: number
  submitter: string
  current_owner: string
  submitted_at: number
  verified: boolean
  is_active: boolean
  is_confirmed: boolean
  confirmer: string
}

export interface Waste {
  waste_id: bigint
  waste_type: WasteType
  weight: bigint
  current_owner: string
  latitude: bigint
  longitude: bigint
  recycled_timestamp: number
  is_active: boolean
  is_confirmed: boolean
  confirmer: string
}

/** Raw waste payload as returned by the contract (numeric waste type). */
export interface RawWaste {
  waste_id: bigint
  waste_type: number
  weight: bigint
  current_owner: string
  latitude: bigint
  longitude: bigint
  recycled_timestamp: number
  is_active: boolean
  is_confirmed: boolean
  confirmer: string
}

export interface WasteTransfer {
  waste_id: number
  from: string
  to: string
  transferred_at: number
}

/** Raw waste-transfer payload as returned by the contract. */
export interface RawWasteTransfer {
  waste_id: number
  from: string
  to: string
  transferred_at: number
}

export interface ParticipantStats {
  address: string
  total_earned: bigint
  materials_submitted: number
  transfers_count: number
}

/** Raw participant-stats payload as returned by the contract. */
export interface RawParticipantStats {
  address: string
  total_earned: bigint
  materials_submitted: number
  transfers_count: number
}

export interface GlobalMetrics {
  total_wastes_count: number
  total_tokens_earned: bigint
}

/** Raw global-metrics payload as returned by the contract. */
export interface RawGlobalMetrics {
  total_wastes_count: number
  total_tokens_earned: bigint
}

export class ContractError extends Error {
  constructor(
    message: string,
    public code?: number
  ) {
    super(message)
    this.name = 'ContractError'
  }
}

/** Union of all raw contract payloads, useful for generic decoders. */
export type RawContractPayload =
  | RawParticipant
  | RawIncentive
  | RawMaterial
  | RawWaste
  | RawWasteTransfer
  | RawParticipantStats
  | RawGlobalMetrics
