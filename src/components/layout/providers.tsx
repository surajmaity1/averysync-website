import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import React from 'react'
import { SpaceSessionRoot } from '../spaces/space-session-root'

let browserQueryClient: QueryClient | undefined = undefined

const getQueryClient = () => {
  if (isServer) {
    return new QueryClient({
      defaultOptions: { queries: { staleTime: 60_000, retry: false } },
    })
  }
  if (!browserQueryClient) {
    browserQueryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 60_000, retry: false } },
    })
  }
  return browserQueryClient
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      <SpaceSessionRoot />
    </QueryClientProvider>
  )
}
