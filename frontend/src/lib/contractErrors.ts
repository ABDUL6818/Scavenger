// Contract error mapping now lives in the centralized services layer so there is
// a single source of truth. These re-exports preserve the existing public API
// (imports of `getErrorMessage` / `ERROR_MESSAGES` from this module keep working).
export { ERROR_MESSAGES, getErrorMessage } from '@/services/errorMapper'
