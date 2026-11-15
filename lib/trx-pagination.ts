// a page that came back shorter than the page size is the last one, so the end
// of the list costs no empty request
export function nextTrxPageParam(
  lastPage: readonly unknown[],
  lastPageParam: number,
  pageSize: number
) {
  return lastPage.length < pageSize ? undefined : lastPageParam + 1
}

// rows are paged by offset, so a transaction inserted or deleted between two
// page requests can show up twice; keep the first occurrence
export function flattenTrxPages<T extends { id: string }>(
  pages: readonly (readonly T[])[]
): T[] {
  const seen = new Set<string>()

  return pages.flat().filter((trx) => {
    if (seen.has(trx.id)) return false
    seen.add(trx.id)
    return true
  })
}

// the loader row sits at `loadedCount`, so reaching the last loaded row (or the
// loader itself) is the cue for the next page
export function shouldFetchNextPage({
  lastVisibleIndex,
  loadedCount,
  hasNextPage,
  isFetchingNextPage,
}: {
  lastVisibleIndex: number
  loadedCount: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
}) {
  if (!hasNextPage || isFetchingNextPage) return false

  return lastVisibleIndex >= loadedCount - 1
}
