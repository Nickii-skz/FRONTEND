import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UseCaseProvider } from '@composition-root/UseCaseContext'
import { AppRouter } from '@presentation/router/AppRouter'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UseCaseProvider>
        <AppRouter />
      </UseCaseProvider>
    </QueryClientProvider>
  )
}