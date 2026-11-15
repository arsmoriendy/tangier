import {
  infiniteQueryOptions,
  queryOptions,
  type QueryClient,
} from "@tanstack/react-query"
import { listTransactions } from "@/lib/crud/transactions"
import { nextTrxPageParam } from "@/lib/trx-pagination"

export const TRX_LIST_QUERY_KEY = "trx-list"
export const TRX_REPORT_QUERY_KEY = "trx-report"
export const TRX_LIST_LIMIT = 10

export type TrxFilters = {
  id: string
  from: Date
  to: Date
}

// dates are turned into numbers so the key is stable between the server
// prefetch and the client query
function serializeTrxFilters({ id, from, to }: TrxFilters) {
  return { id, from: from.getTime(), to: to.getTime() }
}

export function trxListQueryOptions(filters: TrxFilters) {
  return infiniteQueryOptions({
    queryKey: [TRX_LIST_QUERY_KEY, serializeTrxFilters(filters)],
    // transactions change from the POS at any time, so never trust a cached
    // list on mount
    staleTime: 0,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listTransactions({
        ...filters,
        offset: pageParam * TRX_LIST_LIMIT,
        limit: TRX_LIST_LIMIT,
      }),
    // a short page is the last one, so the end of the list costs no empty
    // request
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      nextTrxPageParam(lastPage, lastPageParam, TRX_LIST_LIMIT),
  })
}

export function trxReportQueryOptions(filters: TrxFilters) {
  return queryOptions({
    queryKey: [TRX_REPORT_QUERY_KEY, serializeTrxFilters(filters)],
    staleTime: 0,
    queryFn: () => listTransactions(filters),
  })
}

export function invalidateTrxQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: [TRX_LIST_QUERY_KEY] }),
    queryClient.invalidateQueries({ queryKey: [TRX_REPORT_QUERY_KEY] }),
  ])
}
