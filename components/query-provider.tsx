"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { getQueryClient } from "@/lib/query-client"
import { env } from "@/lib/env"

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {env.NEXT_PUBLIC_SHOW_REACT_QUERY_DEV_TOOL && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
