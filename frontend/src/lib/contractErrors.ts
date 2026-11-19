import { ContractError } from '@/api/types'
import { TRANSACTION_STATUS_MESSAGES } from '@/lib/transactionStatus'

const ERROR_MESSAGES: Record<number, string> = {
  1: 'Contract is already initialized.',
  2: 'You are not authorized to perform this action.',
  3: 'Participant is not registered.',
  4: 'Participant is already registered.',
  5: 'Only manufacturers can perform this action.',
  6: 'You do not own this waste item.',
  7: 'Waste not found.',
  8: 'Material not found.',
  9: 'Incentive not found.',
  10: 'Participant not found.',
  11: 'Invalid amount — must be greater than zero.',
  12: 'Invalid weight — must be greater than zero.',
  13: 'Invalid coordinates — latitude must be ±90° and longitude ±180°.',
  14: 'Percentages must add up to 100.',
  15: 'Insufficient token balance.',
  16: 'Charity address has not been configured.',
  17: 'Token address has not been configured.',
  18: 'This waste item has been deactivated.',
  19: 'Waste is already deactivated.',
  20: 'Waste has already been confirmed.',
  21: 'Waste has not been confirmed yet.',
  22: 'You cannot confirm your own waste.',
  23: 'This incentive is no longer active.',
  24: 'Material must be verified before use.',
  25: 'Waste type does not match the incentive.',
  26: 'No reward available — budget may be exhausted.',
  27: 'Invalid transfer route for your role.',
  28: 'Source and destination addresses must differ.',
  29: 'Arithmetic overflow detected.',
  30: 'You are not the creator of this resource.',
  31: 'Insufficient incentive budget.',
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ContractError) {
    if (error.code !== undefined && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code]
    }
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return TRANSACTION_STATUS_MESSAGES.failed
}
