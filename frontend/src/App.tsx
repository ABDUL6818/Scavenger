import { Suspense } from 'react'
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
  return (
    <Suspense fallback={<div role="status">Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}