import { lazy, Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { config } from '@/config'

const LazyAppShell = lazy(() =>
  import('@/components/AppShell').then((m) => ({ default: m.AppShell })),
)

function AppFallback() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      Loading…
    </div>
  )
}

export function App() {
  // Env-dependent behaviour is now sourced from the validated config module
  // instead of reading `import.meta.env` directly. This keeps startup
  // validation (zod) in one place and avoids undefined values at runtime.
  if (config.enableAppShell) {
    return (
      <Suspense fallback={<AppFallback />}>
        <LazyAppShell>
          <RouterProvider router={router} />
        </LazyAppShell>
      </Suspense>
    )
  }

  return <RouterProvider router={router} />
}