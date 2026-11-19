import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'

export function App() {
  return (
    <Suspense fallback={<div role="status">Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}