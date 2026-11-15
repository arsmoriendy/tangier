import { QueryClient } from "@tanstack/react-query"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  // Server: always a new client, so the cache isn't shared between requests
  if (typeof window === "undefined") return makeQueryClient()
  // Browser: reuse one client
  return (browserQueryClient ??= makeQueryClient())
}
