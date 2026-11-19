import { z } from 'zod'

const VALID_NETWORKS = ['TESTNET', 'MAINNET', 'FUTURENET', 'STANDALONE'] as const
const VALID_LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val
    const normalized = val.trim().toLowerCase()
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true
    if (['false', '0', 'no', 'off', ''].includes(normalized)) return false
    return val as unknown as boolean
  })
  .pipe(z.boolean())

const envSchema = z.object({
  VITE_CONTRACT_ID: z
    .string({ required_error: 'Missing required environment variable: VITE_CONTRACT_ID' })
    .min(1, 'VITE_CONTRACT_ID must not be empty'),
  VITE_NETWORK: z
    .enum(VALID_NETWORKS, {
      errorMap: () => ({
        message: `VITE_NETWORK must be one of: ${VALID_NETWORKS.join(', ')}`
      })
    })
    .default('TESTNET'),
  VITE_RPC_URL: z
    .string({ required_error: 'Missing required environment variable: VITE_RPC_URL' })
    .min(1, 'VITE_RPC_URL must not be empty')
    .url('VITE_RPC_URL must be a valid URL'),
  VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL must be a valid URL').optional(),
  VITE_API_TIMEOUT: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'number' ? val : Number(val)))
    .pipe(z.number().int('VITE_API_TIMEOUT must be an integer').positive('VITE_API_TIMEOUT must be positive'))
    .optional(),
  VITE_OFFLINE_MODE: booleanFromString.optional(),
  VITE_ANALYTICS: booleanFromString.optional(),
  VITE_NOTIFICATIONS: booleanFromString.optional(),
  VITE_LOG_LEVEL: z.enum(VALID_LOG_LEVELS).default('info'),
  VITE_LOG_CONSOLE: booleanFromString.optional()
})

export type Env = z.infer<typeof envSchema>
export type Network = (typeof VALID_NETWORKS)[number]
export type LogLevel = (typeof VALID_LOG_LEVELS)[number]

const parseEnv = (raw: Record<string, unknown>): Env => {
  const result = envSchema.safeParse(raw)
  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => {
        const path = issue.path.join('.')
        return path ? `${path}: ${issue.message}` : issue.message
      })
      .join('; ')
    throw new Error(`Invalid environment configuration: ${messages}`)
  }
  return result.data
}

const rawEnv = (import.meta.env ?? {}) as Record<string, unknown>

export const env: Env = Object.freeze(parseEnv(rawEnv))

export const config = Object.freeze({
  contractId: env.VITE_CONTRACT_ID,
  network: env.VITE_NETWORK as Network,
  rpcUrl: env.VITE_RPC_URL,
  apiBaseUrl: env.VITE_API_BASE_URL,
  apiTimeout: env.VITE_API_TIMEOUT,
  offlineMode: env.VITE_OFFLINE_MODE ?? false,
  analytics: env.VITE_ANALYTICS ?? false,
  notifications: env.VITE_NOTIFICATIONS ?? false,
  logLevel: env.VITE_LOG_LEVEL as LogLevel,
  logConsole: env.VITE_LOG_CONSOLE ?? false
} as const)

export type AppConfig = typeof config

export { VALID_NETWORKS, VALID_LOG_LEVELS, envSchema, parseEnv }
```

Note: The file `frontend/src/config.ts` should be replaced with re-exports from `frontend/src/config/env.ts`:

```typescript
export { config, env, VALID_NETWORKS, VALID_LOG_LEVELS, envSchema, parseEnv } from './config/env'
export type { AppConfig, Env, Network, LogLevel } from './config/env'
```

And `frontend/src/config/app.ts` should similarly re-export from `./env`:

```typescript
export { config, env, VALID_NETWORKS, VALID_LOG_LEVELS, envSchema, parseEnv } from './env'
export type { AppConfig, Env, Network, LogLevel } from './env'
```

Backwards-compatibility impact: Existing imports of `config` from `frontend/src/config` and `frontend/src/config/app` continue to work unchanged. The `config` object is now frozen and gains additional fields (`apiBaseUrl`, `apiTimeout`, `offlineMode`, `analytics`, `notifications`, `logLevel`, `logConsole`), which is additive. Validation now happens once at module load via zod, producing aggregated error messages instead of failing on the first missing variable.