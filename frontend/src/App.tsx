import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/router'
import { queryCachePolicy } from '@/lib/queryCachePolicy'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: queryCachePolicy.staleTime,
      gcTime: queryCachePolicy.gcTime,
      retry: queryCachePolicy.retry,
      refetchOnWindowFocus: queryCachePolicy.refetchOnWindowFocus,
    },
    mutations: {
      retry: queryCachePolicy.mutationRetry,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}